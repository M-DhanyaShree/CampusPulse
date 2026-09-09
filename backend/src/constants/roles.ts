export enum UserRole {
  STUDENT = 'student',
  DEPT_ADMIN = 'dept_admin',
  MANAGEMENT = 'management',
  SUPER_ADMIN = 'superadmin',
}

export const ALL_ROLES = Object.values(UserRole);

export const ADMIN_ROLES = [
  UserRole.DEPT_ADMIN,
  UserRole.MANAGEMENT,
  UserRole.SUPER_ADMIN,
];

export const GOVERNING_ROLES = [
  UserRole.MANAGEMENT,
  UserRole.SUPER_ADMIN,
];
