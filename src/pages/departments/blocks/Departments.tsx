import { CardRole } from '@/partials/cards';

import { useAdmin } from '@/hooks/useAdmin';
import { Role } from '@/services/Admin/adminService';

import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router';

const Departments = () => {
  const navigate = useNavigate();
  const renderItem = (item: Role, index: number) => {
    return (
      <CardRole
        key={index}
        role_id={item.id}
        subTitle={'department'}
        title={item.name}
        description={`This is ${item.name} department`}
        navigation={() => navigate(`/departments/users/${item.id}`)}
        viewTitle={'Users'}
      />
    );
  };

  const { isFetchingDepartments, departments } = useAdmin();

  return (
    <>
      {isFetchingDepartments ? (
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[50px]" />
          <Skeleton className="h-[50px]" />
          <Skeleton className="h-[50px]" />
          <Skeleton className="h-[50px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5">
          {departments?.map((item: any, index: number) => {
            return renderItem(item, index);
          })}
        </div>
      )}
    </>
  );
};

export { Departments };
