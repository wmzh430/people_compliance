import { Link } from 'react-router-dom';
import useBodyClasses from '@/hooks/useBodyClasses';

const ErrorMaintenancePage = () => {
  useBodyClasses('dark:bg-coal-500');

  return (
    <div className="flex grow">
      <div className="container-fixed flex items-center justify-center flex-wrap grow">
        <div className="flex flex-col items-center text-center max-w-[460px]">
          <span className="badge badge-warning badge-outline mb-3">
            Service Temporarily Unavailable
          </span>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            We are performing maintenance
          </h3>
          <div className="text-md text-gray-700 mb-8">
            Archer Health Portal is temporarily unavailable. Please try again in a few minutes.
          </div>
          <Link to="/auth/login" className="btn btn-primary">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export { ErrorMaintenancePage };
