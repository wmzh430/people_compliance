import { type TLanguageCode } from '@/i18n';

export type Role =
  | 'admin'
  | 'department_admin'
  | 'remote_developer'
  | 'customer_support'
  | 'project_manager'
  | 'remote_designer'
  | 'Intake'
  | 'hr_manager';

export const RolesSelector = [
  { name: 'Admin', selector: 'admin' },
  { name: 'Department Admin', selector: 'department_admin' },
  { name: 'Remote Developer', selector: 'remote_developer' },
  { name: 'Customer Support', selector: 'customer_support' },
  { name: 'Project Manager', selector: 'project_manager' },
  { name: 'Remote Designer', selector: 'remote_designer' },
  { name: 'Hr Manager', selector: 'hr_manager' }
];

export interface AuthModel {
  access: string;
  api_token?: string;
  refresh?: string;
}

export interface UserModel {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  fullname?: string;
  password?: string;
  occupation?: string;
  companyName?: string;
  phone?: string;
  roles: Role[];
  pic?: string;
  language?: TLanguageCode;
  auth?: AuthModel;
  is_superuser?: boolean;
  department?: [];
}
