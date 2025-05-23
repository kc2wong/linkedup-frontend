import { _Error as Error } from '../__generated__/linkedup-web-api-client';
import { UserCreation, SimpleUser } from '../__generated__/linkedup-web-api-client';
import { User } from '../__generated__/linkedup-web-api-client';
import {
  Activity,
  ActivityDetail,
  ActivityCategory,
  ActivityStatus,
  ActivityPayload,
  AchievementSubmissionRole,
  FindActivityResult,
} from '../__generated__/linkedup-web-api-client';

import { Language, UserRole, UserStatus } from '../__generated__/linkedup-web-api-client';

import { Student } from '../__generated__/linkedup-web-api-client';
import { Shop } from '../__generated__/linkedup-web-api-client';

export enum LanguageEnum {
  English = 'English',
  TraditionalChinese = 'TraditionalChinese',
  SimplifiedChinese = 'SimplifiedChinese',
}

export enum UserRoleEnum {
  Student = 'Student',
  Parent = 'Parent',
  Teacher = 'Teacher',
  Admin = 'Admin',
  Alumni = 'Alumni',
}

export enum UserStatusEnum {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspend = 'Suspend',
}

export enum ApprovalStatusEnum {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum ApprovalCommentType {
  CONVERSATION = 'Conversation',
  REJECTION = 'Rejection',
  APPROVAL = 'Approval',
}

export enum SubmissionRoleEnum {
  Teacher = 'Teacher',
  Student = 'Student',
  Both = 'Both'
}

export enum ActivityStatusEnum {
  Open = 'Open',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
  Scheduled = 'Scheduled',
}

export const roleToEnum = (role: UserRole): UserRoleEnum => UserRoleEnum[role];
export const statusToEnum = (status: UserStatus): UserStatusEnum => UserStatusEnum[status];
export const approvalStatusToEnum = (status: ApprovalStatusEnum): ApprovalStatusEnum =>
  ApprovalStatusEnum[status];
export const languageToEnum = (language: Language): LanguageEnum => LanguageEnum[language];
export const activityStatusToEnum = (activityStatus: ActivityStatus): ActivityStatusEnum => ActivityStatusEnum[activityStatus];

// export type { Language, UserRole, UserStatus };
export type {
  Error,
  User,
  SimpleUser,
  UserCreation,
  Student,
  Shop,
  Activity,
  ActivityDetail,
  ActivityCategory,
  ActivityStatus,
  ActivityPayload,
  AchievementSubmissionRole,
  FindActivityResult,
};
