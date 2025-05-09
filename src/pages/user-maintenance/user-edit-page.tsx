import { z } from 'zod';
import { Language, Student, User, UserCreation, UserRole, UserStatus } from '../../models/openapi';
import { Button, Dropdown, Option, Spinner } from '@fluentui/react-components';
import { Field } from '../../components/Field';
import { Input } from '../../components/Input';
import {
  ArrowTurnUpLeftRegular,
  CheckmarkRegular,
  DismissRegular,
  KeyResetRegular,
  SaveRegular,
} from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Form, Root } from '../../components/Container';
import { zodEmail, zodOptionalString, zodString } from '../../types/zod';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMessage } from '../../hooks/use-message';
import {
  userDetailAtom,
  UserDetailStateGetSuccess,
  UserDetailStateUpdateSuccess,
} from '../../states/user-detail';
import { useAtom, useAtomValue } from 'jotai';
import { useDialog } from '../../hooks/use-dialog';
import { useFormDirty } from '../../contexts/FormDirty';
import { constructMessage } from '../../utils/string-util';
import { getEnumValueByRawValue } from '../../utils/enum-util';
import { EmptyCell } from '../../components/EmptyCell';
import { asArray } from '../../utils/array-util';
import {
  studentListAtom,
  StudentListStateProgress,
  StudentListStateSuccess,
} from '../../states/student';
import { useLocation, useParams } from 'react-router-dom';
import { MultiLangButton, MultiLangDrawer } from '../../components/multi-lang-drawer';
import { hasMissingRequiredField } from '../../utils/form-util';
import { emptyStringToUndefined } from '../../utils/object-util';
import { MessageType } from '../../models/system';
import { RoleIcon, RoleLabel } from './role-label';
import { StatusIcon, StatusLabel } from './status-label';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { authenticationAtom } from '../../states/authentication';

// form for editing user
const maxNameLength = 50;

const statusList = [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPEND];
const roleList = [UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN];

type UserEditPageProps = { mode: string; onBackButtonClick: () => void; onSave: () => void };

export const UserEditPage: React.FC<UserEditPageProps> = ({
  mode,
  onBackButtonClick,
  onSave,
}: UserEditPageProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const { dispatchMessage } = useMessage();
  const { startBreadcrumb, appendBreadcrumb } = useBreadcrumb();

  const { showConfirmationDialog } = useDialog();
  const { markDirty, resetDirty } = useFormDirty();

  const { id } = useParams<{ id: string }>();
  const userFromParentPage = useLocation().state?.user;

  const [state, action] = useAtom(userDetailAtom);
  const [studentListState, studentListAction] = useAtom(studentListAtom);
  const login = useAtomValue(authenticationAtom).login;
  const isToAddParentUser = mode === 'add' && login?.user.role === UserRole.STUDENT;

  const readOnly = mode === 'view';
  const baselineTimestamp = useRef<number>(Date.now());

  const _user2FormData = (user?: User): FormData => {
    if (user) {
      const { entitledStudentId, ...others } = user;
      return { entitledStudentId: entitledStudentId[0] ?? '', ...others };
    } else {
      if (isToAddParentUser) {
        return {
          email: '',
          role: UserRole.PARENT,
          status: UserStatus.ACTIVE,
          name: {},
          entitledStudentId: login?.user.entitledStudent[0].id,
        };
      } else {
        return {
          email: '',
          role: '',
          status: '',
          name: {},
          entitledStudentId: '',
        };
      }
    }
  };

  const _formData2UserCreation = (formData: FormData): UserCreation => {
    const { role, status, entitledStudentId, ...others } = formData;
    return {
      role: getEnumValueByRawValue(UserRole, role)!,
      status: getEnumValueByRawValue(UserStatus, status)!,
      entitledStudentId: asArray(emptyStringToUndefined(entitledStudentId)) ?? [],
      ...others,
    };
  };

  const _constructStudentName = (student?: Student): string | undefined => {
    if (student) {
      const languagePreference =
        i18n.language === 'en'
          ? [Language.ENGLISH, Language.TRADITIONAL_CHINESE]
          : [Language.TRADITIONAL_CHINESE, Language.ENGLISH];

      const firstName =
        languagePreference.map((lang) => student.firstName[lang]).find((n) => n !== undefined) ??
        '';
      const lastName =
        languagePreference.map((lang) => student.lastName[lang]).find((n) => n !== undefined) ?? '';

      return ` ${lastName} ${firstName}`;
    } else {
      return '\u00A0';
    }
  };

  const schema = z
    .object({
      id: zodOptionalString(),
      email: zodEmail(),
      name: z
        .record(zodOptionalString({ maxLength: maxNameLength }))
        .refine((data) => data[Language.ENGLISH] && data[Language.ENGLISH].trim().length > 0, {
          message: 'Required',
          path: ['en'], // path of error
        }),
      role: zodString(),
      entitledStudentId: zodOptionalString(),
      status: zodString(),
    })
    .refine(
      (data) =>
        data.role !== UserRole.STUDENT ||
        (data.role === UserRole.STUDENT &&
          data.entitledStudentId &&
          data.entitledStudentId.trim().length > 0),
      { message: 'zod.error.Required', path: ['entitledStudentId'] },
    )
    .refine(
      (data) =>
        emptyStringToUndefined(data.entitledStudentId) === undefined ||
        studentListState.result.find((s) => s.id === data.entitledStudentId),
      { message: 'zod.error.user.invalidStudentId', path: ['entitledStudentId'] },
    );
  type FormData = z.infer<typeof schema>;

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: _user2FormData(userFromParentPage),
    resolver: zodResolver(schema),
  });

  const formValues = watch();
  useEffect(() => {
    // to trigger enable / disable of save button and mark dirtiness
    if (isDirty) {
      markDirty();
    }
    return () => resetDirty();
  }, [formValues, isDirty, markDirty, resetDirty]);

  useEffect(() => {
    if (id) {
      action({ search: { id: id } });
    } else {
      action({ reset: {} });
      if (isToAddParentUser && formValues.entitledStudentId) {
        studentListAction({ search: { id: [formValues.entitledStudentId] } });
      }
    }
  }, [id]);

  useEffect(() => {
    if (state.eventTime > baselineTimestamp.current) {
      baselineTimestamp.current = state.eventTime;
      if (state instanceof UserDetailStateGetSuccess) {
        reset(_user2FormData(state.result));
        const studentId = state.result.entitledStudentId;
        if (studentId.length > 0) {
          studentListAction({ search: { id: studentId } });
        }
      } else if (state instanceof UserDetailStateUpdateSuccess) {
        dispatchMessage({
          type: MessageType.Success,
          text: constructMessage(t, 'system.message.saveObjectSuccess', ['User', state.result.id]),
        });
        onSave();
      }
    }
  }, [state]);

  useEffect(() => {
    baselineTimestamp.current = state.eventTime;
    if (studentListState instanceof StudentListStateSuccess) {
      const student = studentListState.result[0];
      if (mode === 'add' && !isToAddParentUser && student) {
        const nameEn = `${student.firstName[Language.ENGLISH] ?? ''} ${student.lastName[Language.ENGLISH] ?? ''}`;
        const nameZhHant = `${student.lastName[Language.TRADITIONAL_CHINESE] ?? ''}${student.firstName[Language.TRADITIONAL_CHINESE] ?? ''}`;
        const nameZhHans = `${student.lastName[Language.SIMPLIFIED_CHINESE] ?? ''}${student.firstName[Language.SIMPLIFIED_CHINESE] ?? ''}`;
        if (
          student.id === formValues.entitledStudentId ||
          `${student.classId}-${student.studentNumber}` === formValues.entitledStudentId
        ) {
          setValue('entitledStudentId', student.id);
          setValue('name', {
            [Language.ENGLISH]: nameEn,
            [Language.TRADITIONAL_CHINESE]: nameZhHant,
            [Language.SIMPLIFIED_CHINESE]: nameZhHans,
          });
        }
      }
    }
  }, [studentListState]);

  isToAddParentUser
    ? startBreadcrumb('userMaintenance.titleAddParent')
    : appendBreadcrumb('userMaintenance.titleEdit', `system.message.${mode}`);

  const handleNameFieldChange = (fieldName: 'name', langStr: string, value: string) => {
    const currentFieldValues = formValues[fieldName];

    currentFieldValues[
      langStr === Language.TRADITIONAL_CHINESE ? Language.TRADITIONAL_CHINESE : Language.ENGLISH
    ] = value;

    setValue(fieldName, currentFieldValues, { shouldDirty: true });
  };

  const backButton =
    window.history.length > 1 ? (
      <Button icon={<ArrowTurnUpLeftRegular />} onClick={onBackButtonClick}>
        {t('system.message.back')}
      </Button>
    ) : (
      <></>
    );

  const resetPasswordButton =
    mode === 'edit' ? (
      <Button appearance="outline" disabled={true} icon={<KeyResetRegular />}>
        {t('system.message.resetPassword')}
      </Button>
    ) : (
      <></>
    );

  const saveButton = readOnly ? (
    <></>
  ) : (
    <Button
      appearance="primary"
      disabled={hasMissingRequiredField(formValues, schema)}
      icon={<SaveRegular />}
      onClick={handleSubmit(() => {
        showConfirmationDialog({
          confirmType: 'save',
          message: t('system.message.doYouWantToSaveChange'),
          primaryButton: {
            label: t('system.message.save'),
            icon: <CheckmarkRegular />,
            action: () => {
              action(
                state.result
                  ? {
                      update: {
                        id: state.result.id,
                        version: state.result.version,
                        user: _formData2UserCreation(formValues),
                      },
                    }
                  : { create: _formData2UserCreation(formValues) },
              );
            },
          },
          secondaryButton: { label: t('system.message.cancel'), icon: <DismissRegular /> },
        });
      })}
    >
      {t('system.message.save')}
    </Button>
  );

  return (
    <Root>
      <Form
        buttons={[backButton, resetPasswordButton, saveButton]}
        numColumn={3}
        styles={{ width: '690px' }}
        title={
          isToAddParentUser
            ? t('userMaintenance.titleAddParent')
            : constructMessage(t, 'userMaintenance.titleEdit', [
                mode ? `system.message.${mode}` : '',
              ])
        }
      >
        {mode !== 'add' ? (
          <>
            <Controller
              control={control}
              name="id"
              render={({ field }) => (
                <Field colSpan={2} label={t('userMaintenance.id')} required>
                  <Input {...field} readOnly={true} />
                </Field>
              )}
            />
            <EmptyCell colSpan={1} />
          </>
        ) : (
          <></>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Field
              colSpan={2}
              label={t('userMaintenance.email')}
              required
              validationMessage={errors?.email?.message}
            >
              <Input {...field} readOnly={readOnly || mode !== 'add'} />
            </Field>
          )}
        />
        <EmptyCell colSpan={1} />

        <Controller
          control={control}
          name="name"
          render={({ field }) => {
            return (
              <Field
                colSpan={3}
                label={t('userMaintenance.name')}
                required
                validationMessage={errors?.name?.en?.message}
              >
                <Input
                  contentAfter={
                    <MultiLangButton
                      isOpen={isDrawerOpen}
                      onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    />
                  }
                  name={field.name}
                  onChange={(evt, data) => {
                    handleNameFieldChange(field.name, evt.target.name, data.value);
                  }}
                  readOnly={readOnly}
                  value={field.value[Language.ENGLISH]}
                />
              </Field>
            );
          }}
        />

        <Controller
          control={control}
          name="role"
          render={({ field }) => {
            const { value, ...others } = field;
            const selectedValue = value ?? '';
            return (
              <Field
                label={t('userMaintenance.role.label')}
                orientation="horizontal"
                required={true}
                validationMessage={errors?.role?.message}
              >
                {readOnly || isToAddParentUser ? (
                  <Input
                    appearance="underline"
                    contentBefore={<RoleIcon role={value} />}
                    value={value ? t(`userMaintenance.role.value.${value}`) : ''}
                  />
                ) : (
                  <Dropdown
                    {...others}
                    multiselect={false}
                    onOptionSelect={(_ev, data) => {
                      field.onChange(data.selectedOptions[0] ?? '');
                      // clear entitledStudentId if role is not Student
                      if (data.optionValue != UserRole.STUDENT) {
                        setValue('entitledStudentId', '');
                      }
                    }}
                    selectedOptions={asArray(selectedValue)}
                    value={selectedValue}
                  >
                    {roleList.map((role) => (
                      <Option
                        key={role.toString()}
                        text={t(`userMaintenance.role.value.${role}`)}
                        value={`${role}`}
                      >
                        <RoleLabel role={role}></RoleLabel>
                      </Option>
                    ))}
                  </Dropdown>
                )}
              </Field>
            );
          }}
        />

        {formValues.role == UserRole.STUDENT || formValues.role == UserRole.PARENT ? (
          <>
            <Controller
              control={control}
              name="entitledStudentId"
              render={({ field }) => {
                const { value, ...others } = field;
                const student = value
                  ? studentListState.result.find((s) => s.id === value)
                  : undefined;
                return (
                  <Field
                    colSpan={2}
                    infoMessage={_constructStudentName(student)}
                    label={t('userMaintenance.studentId')}
                    labelHint="P[1 to 6]-[1 to 30] e.g. P1A-1, P1A-2, .... P6E-30"
                    orientation="horizontal"
                    required={true}
                    validationMessage={errors?.entitledStudentId?.message}
                  >
                    <Input
                      {...others}
                      contentAfter={
                        studentListState instanceof StudentListStateProgress ? (
                          <Spinner size="extra-tiny" />
                        ) : undefined
                      }
                      onBlur={() => {
                        const entitledStudentId = formValues.entitledStudentId;
                        if (entitledStudentId) {
                          studentListAction({ search: { id: [entitledStudentId] } });
                        }
                      }}
                      readOnly={readOnly || isToAddParentUser}
                      value={value}
                    />
                  </Field>
                );
              }}
            />
          </>
        ) : (
          <EmptyCell colSpan={2} />
        )}

        <Controller
          control={control}
          name="status"
          render={({ field }) => {
            const { value, ...others } = field;
            const selectedValue = value ?? '';
            return (
              <Field
                label={t('userMaintenance.status.label')}
                orientation="horizontal"
                required={true}
                validationMessage={errors?.status?.message}
              >
                {readOnly || isToAddParentUser ? (
                  <Input
                    appearance="underline"
                    contentBefore={<StatusIcon status={value} />}
                    value={value ? t(`userMaintenance.status.value.${value}`) : ''}
                  />
                ) : (
                  <Dropdown
                    {...others}
                    multiselect={false}
                    onOptionSelect={(_ev, data) => {
                      field.onChange(data.selectedOptions[0] ?? '');
                    }}
                    selectedOptions={asArray(selectedValue)}
                    value={selectedValue}
                  >
                    {statusList.map((status) => (
                      <Option
                        key={status.toString()}
                        text={t(`userMaintenance.status.value.${status}`)}
                        value={`${status}`}
                      >
                        <StatusLabel status={status}></StatusLabel>
                      </Option>
                    ))}
                  </Dropdown>
                )}
              </Field>
            );
          }}
        />
        <EmptyCell colSpan={2} />
      </Form>
      <div style={{ flex: 1 }}></div>

      <MultiLangDrawer
        initialData={formValues.name}
        isOpen={isDrawerOpen}
        isReadOnly={readOnly}
        onDrawerClose={() => setIsDrawerOpen(false)}
        onValueChange={(ev, data) => handleNameFieldChange('name', ev, data)}
        t={t}
        title={t('userMaintenance.name')}
      />
    </Root>
  );
};
