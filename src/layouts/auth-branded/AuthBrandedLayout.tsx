import { Link, Outlet } from 'react-router-dom';
import { Fragment } from 'react';
import { toAbsoluteUrl } from '@/utils';
import useBodyClasses from '@/hooks/useBodyClasses';
import { AuthBrandedLayoutProvider } from './AuthBrandedLayoutProvider';

const Layout = () => {
  // Applying body classes to manage the background color in dark mode
  useBodyClasses('dark:bg-coal-500');

  return (
    <Fragment>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1999270187.jpg')}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1-dark.png')}');
          }
        `}
      </style>

      <div className="grid lg:grid-cols-2 grow">
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Outlet />
        </div>

        <div className="lg:rounded-xl lg:border lg:border-gray-200 lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg relative">
          {/* Add overlay background behind text content */}
          <div className="absolute inset-0 bg-black opacity-40 rounded-xl"></div>

          <div className="flex flex-col p-8 lg:p-16 gap-4 relative z-10">
            <Link to="/">
              <img
                src={toAbsoluteUrl('/media/app/mini-logo2.png')}
                className="h-[50px] max-w-none"
                alt=""
              />
            </Link>

            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-semibold text-white">Archer Health Portal</h3>
              <div className="text-base font-medium text-gray-200">
                A robust health system ensuring focused
                <br /> healthcare provided in your home. &nbsp;
                <br />
                <span className="text-white font-semibold">
                  {' '}
                  Focus on Health • Aim for Excellence
                </span>
                {/* &nbsp;to the Metronic */}
                {/* <br /> Dashboard interface. */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => (
  <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>
);

export { AuthBrandedLayout };
