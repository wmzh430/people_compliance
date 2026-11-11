import { type TMenuConfig } from '@/components/menu';

export const MENU_SIDEBAR: TMenuConfig = [
  {
    title: 'User Management',
    icon: 'people',
    children: [
      {
        title: 'Members',
        icon: 'users',
        path: '/members'
      },
      {
        title: 'Access Control',
        icon: 'security-user',
        children: [
          {
            title: 'Roles',
            path: '/roles'
          },
          {
            title: 'Departments',
            path: '/departments'
          }
        ]
      },
      {
        title: 'Clinicians',
        icon: 'security-user',
        path: '/clinicians/list'
      }
    ]
  },
  {
    title: 'HR',
    icon: 'people',
    children: [
      {
        title: 'OIG Reports',
        path: '/oig-reports'
      }
    ]
  }
];

export const MENU_MEGA: TMenuConfig = [
  {
    title: 'Home',
    path: '/'
  }
];

export const MENU_ROOT: TMenuConfig = [
  {
    title: 'Public Profile',
    icon: 'profile-circle',
    rootPath: '/public-profile/',
    path: 'public-profile/profiles/default',
    childrenIndex: 2
  },
  {
    title: 'Account',
    icon: 'setting-2',
    rootPath: '/account/',
    path: '/',
    childrenIndex: 3
  },
  {
    title: 'Network',
    icon: 'users',
    rootPath: '/network/',
    path: 'network/get-started',
    childrenIndex: 4
  },
  {
    title: 'Authentication',
    icon: 'security-user',
    rootPath: '/authentication/',
    path: 'authentication/get-started',
    childrenIndex: 5
  }
];
