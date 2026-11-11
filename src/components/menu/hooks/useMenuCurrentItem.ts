import { matchPath } from 'react-router';

import { IMenuItemConfig, type TMenuConfig } from '../types';

const useMenuCurrentItem = (
  pathname: string,
  items: TMenuConfig | null
): IMenuItemConfig | null => {
  pathname = pathname.trim();

  const isSectionDetailMatch = (menuPath: string) => {
    if (matchPath(pathname, menuPath)) {
      return true;
    }

    if (menuPath === '/referrals' && pathname.startsWith('/referrals/details/')) {
      return true;
    }

    if (menuPath === '/faxes/inbox' && pathname.startsWith('/faxes/details/')) {
      return true;
    }

    return false;
  };

  const findCurrentItem = (items: TMenuConfig | null): IMenuItemConfig | null => {
    if (!items) return null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.path && isSectionDetailMatch(item.path)) {
        return item ?? null;
      } else if (item.children) {
        const childItem = findCurrentItem(item.children as TMenuConfig);
        if (childItem) {
          return childItem;
        }
      }
    }

    return null;
  };

  return findCurrentItem(items);
};

export { useMenuCurrentItem };
