import React, { forwardRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useDemo1Layout } from '../';
import { toAbsoluteUrl } from '@/utils';
import { SidebarToggle } from './';

const SidebarHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { layout, sidebarMouseLeave } = useDemo1Layout();

  const lightLogo = () => (
    <Fragment>
      {layout.options.sidebar.collapse && sidebarMouseLeave ? (
        <>
          <Link to="/" className="dark:hidden">
            <img src={toAbsoluteUrl('/media/app/mini-logo2.png')} className="small-logo h-9 w-8" />
          </Link>
          <Link to="/" className="hidden dark:block">
            <img src={toAbsoluteUrl('/media/app/mini-logo2.png')} className="small-logo h-9 w-56" />
          </Link>
        </>
      ) : (
        <>
          <Link to="/" className="dark:hidden">
            <img src={toAbsoluteUrl('/media/app/mini-logo.png')} className="small-logo h-16 w-56" />
          </Link>
          <Link to="/" className="hidden dark:block">
            <img src={toAbsoluteUrl('/media/app/mini-logo.png')} className="small-logo h-16 w-56" />
          </Link>
        </>
      )}
    </Fragment>
  );

  const darkLogo = () => (
    <Link to="/">
      <img
        src={toAbsoluteUrl('/media/app/mini-logo.png')}
        className="default-logo min-h-[22px] max-w-none"
      />
      <img src={toAbsoluteUrl('/media/app/mini-logo.png')} className="small-logo h-20 w-20" />
    </Link>
  );

  return (
    <div
      ref={ref}
      className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
    >
      {layout.options.sidebar.theme === 'light' ? lightLogo() : darkLogo()}
      <SidebarToggle />
    </div>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

export { SidebarHeader };
