type Role =
  | 'admin'
  | 'department_admin'
  | 'remote_developer'
  | 'customer_support'
  | 'project_manager'
  | 'remote_designer'
  | 'hr_manager';

interface User {
  id: number;
  username: string;
  role: Role;
  isAuthenticated: boolean;
}

export type { User, Role };
