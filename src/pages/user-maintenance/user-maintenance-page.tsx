import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useMessage } from '../../hooks/use-message';
import { useMode } from '../../hooks/use-mode';
import {
  userListAtom,
  UserListStateFail,
  UserListStateProgress,
  UserListStateSuccess,
} from '../../states/user-list';
import {
  userDetailAtom,
  UserDetailStateFail,
  UserDetailStateProgress,
  UserDetailStateGetSuccess,
  UserDetailStateUpdateSuccess,
} from '../../states/user-detail';
import { UserSearchPage } from './user-search-page';
import { UserEditPage } from './user-edit-page';
import { Message, MessageType } from '../../models/system';
import { constructErrorMessage } from '../../utils/string-util';
import { useTranslation } from 'react-i18next';
import { useNavigationHelpers } from '../../hooks/use-delay-navigate';

export const UserMaintenancePage: React.FC = () => {
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();

  const { t } = useTranslation();
  const { navigate, navigateWithSpinner } = useNavigationHelpers();
  const mode = useMode(['add-parent']);

  const userDetailState = useAtomValue(userDetailAtom);
  const [userListState, userListAction] = useAtom(userListAtom);

  useEffect(() => {
    if (userListState instanceof UserListStateProgress) {
      showSpinner();
    } else if (userListState instanceof UserListStateSuccess) {
      stopSpinner();
    } else if (userListState instanceof UserListStateFail) {
      stopSpinner();
      _handleFailre(userListState.failure);
    }
  }, [userListState]);

  useEffect(() => {
    if (userDetailState instanceof UserDetailStateProgress) {
      showSpinner();
    } else if (userDetailState instanceof UserDetailStateGetSuccess) {
      stopSpinner();
    } else if (userDetailState instanceof UserDetailStateUpdateSuccess) {
      stopSpinner();
      userListAction({ markDirty: {} });
    } else if (userDetailState instanceof UserDetailStateFail) {
      stopSpinner();
      _handleFailre(userDetailState.failure);
    }
  }, [userDetailState]);

  const _handleFailre = (message: Message) => {
    if (message?.type === MessageType.Error) {
      dispatchMessage({
        type: message.type,
        text: constructErrorMessage(t, message.key, message.parameters),
      });
    }
  };

  const searchPage = (
    <UserSearchPage
      onAddButtonClick={() => navigate('/user/add')}
      onEditButtonClick={() => {
        const selectedUser = userListState.selectedResult;
        if (selectedUser) {
          navigateWithSpinner(`/user/${selectedUser.id}/edit`, { state: { user: selectedUser } });
        }
      }}
      onViewButtonClick={() => {
        const selectedUser = userListState.selectedResult;
        if (selectedUser) {
          navigateWithSpinner(`/user/${selectedUser.id}/view`, { state: { user: selectedUser } });
        }
      }}
    />
  );

  const editPage = (mode: string) => (
    <UserEditPage
      mode={mode === 'add-parent' ? 'add' : mode}
      onBackButtonClick={() => {
        navigate(-1);
      }}
      onSave={() => {
        if (mode === 'add') {
          const selectedUser = userDetailState.result;
          if (selectedUser) {
            navigateWithSpinner(`/user/${selectedUser.id}/edit`, {
              replace: true,
              state: { user: selectedUser },
            });
          }
        } else if (mode === 'add-parent') {
          navigateWithSpinner('/', {
            replace: true,
          });
        }
      }}
    />
  );

  switch (mode) {
    case 'list': {
      return searchPage;
    }
    case 'add-parent':
    case 'add':
    case 'view':
    case 'edit': {
      return editPage(mode);
    }
    default:
      return <></>;
  }
};
