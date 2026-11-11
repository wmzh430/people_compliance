import { Fragment, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router';
import { useMenuCurrentItem } from '@/components/menu';
import { Footer, Header, Sidebar, useDemo1Layout } from '../';
import { useMenus } from '@/providers';

const Main = () => {
  const { layout } = useDemo1Layout();
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('primary');
  const menuItem = useMenuCurrentItem(pathname, menuConfig);
  const hideSidebar = pathname.includes('/create-patient');

  useEffect(() => {
    const bodyClass = document.body.classList;

    // Add a class to the body element
    bodyClass.add('demo1');

    if (layout.options.sidebar.fixed && !hideSidebar) {
      bodyClass.add('sidebar-fixed');
    } else {
      bodyClass.remove('sidebar-fixed');
    }
    if (layout.options.sidebar.collapse) bodyClass.add('sidebar-collapse');
    if (layout.options.header.fixed) bodyClass.add('header-fixed');

    // Prevent body scroll on create-patient (body has overflow:visible !important inline)
    if (hideSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Remove the class when the component is unmounted
    return () => {
      bodyClass.remove('demo1');
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('sidebar-collapse');
      bodyClass.remove('header-fixed');
      document.body.style.overflow = '';
    };
  }, [layout, hideSidebar]);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add('layout-initialized');
    }, 1000); // 1000 milliseconds

    // Remove the class when the component is unmounted
    return () => {
      document.body.classList.remove('layout-initialized');
      clearTimeout(timer);
    };
  }, []);

  return (
    <Fragment>
      <Helmet>
        <title>{menuItem?.title}</title>
      </Helmet>

      {!hideSidebar && <Sidebar />}

      <div
        className={`wrapper flex grow flex-col ${hideSidebar ? 'h-screen overflow-hidden' : ''}`}
      >
        <Header />

        <main
          className={`grow content ${hideSidebar ? 'pt-0 flex flex-col min-h-0 overflow-hidden' : 'pt-5'}`}
          role="content"
        >
          <Outlet />
        </main>

        {!hideSidebar && <Footer />}
      </div>
    </Fragment>
  );
};

export { Main };
