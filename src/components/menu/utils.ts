import { Children, isValidElement, ReactNode } from 'react';
import { MenuLink } from './MenuLink';
import { matchPath } from 'react-router';

export const getMenuLinkPath = (children: ReactNode): string => {
  let path = '';

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === MenuLink && child.props.path) {
      path = child.props.path; // Assign the path when found
    }
  });

  return path;
};

export const hasMenuActiveChild = (path: string, children: ReactNode): boolean => {
  const childrenArray: ReactNode[] = Children.toArray(children);

  const isSectionDetailMatch = (menuPath: string, currentPath: string) => {
    if (matchPath(menuPath, currentPath)) {
      return true;
    }

    if (menuPath === '/referrals' && currentPath.startsWith('/referrals/details/')) {
      return true;
    }

    if (menuPath === '/faxes/inbox' && currentPath.startsWith('/faxes/details/')) {
      return true;
    }

    return false;
  };

  for (const child of childrenArray) {
    if (isValidElement(child)) {
      if (child.type === MenuLink && child.props.path) {
        if (path === '/') {
          if (child.props.path === path) {
            return true;
          }
        } else {
          if (isSectionDetailMatch(child.props.path as string, path)) {
            return true;
          }
        }
      } else if (hasMenuActiveChild(path, child.props.children as ReactNode)) {
        return true;
      }
    }
  }

  return false;
};
