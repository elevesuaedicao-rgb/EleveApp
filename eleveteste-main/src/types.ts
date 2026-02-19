export enum UserRole {
  Student = 'student',
  Parent = 'parent',
  Teacher = 'teacher',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
