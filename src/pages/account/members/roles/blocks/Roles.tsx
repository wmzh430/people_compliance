import { useState } from 'react';
import { KeenIcon } from '@/components';

import { CardAddNew, CardRole } from '@/partials/cards';
import { ReactNode } from 'react';

import { useAdmin } from '@/hooks/useAdmin';
import { Role } from '@/services/Admin/adminService';

import { toast } from 'sonner';

import { ModalAddRole } from '@/partials/modals/add-role';
import { Skeleton } from '@/components/ui/skeleton';

import { useNavigate } from 'react-router';

const Roles = () => {
  const navigate = useNavigate();
  const renderItem = (item: Role, index: number) => {
    return (
      <CardRole
        key={index}
        role_id={item.id}
        subTitle={'role'}
        title={item.name}
        description={`This role is for ${item.name}`}
        navigation={() => navigate(`/roles/permissions/${item.id}`)}
        viewTitle={'Permissions'}
      />
    );
  };

  const [isRoleAddOpen, setIsRoleAddOpen] = useState(false);
  const handleAddRoleModalOpen = () => {
    setIsRoleAddOpen(true);
  };
  const handleAddRoleModalClose = () => {
    setIsRoleAddOpen(false);
  };

  const { roles, isFetchingRoles, createRole, isCreatingRole } = useAdmin();

  const handleAddRole = async (roleName: string) => {
    try {
      await createRole({ name: roleName });
      toast.success(`${roleName} has been Added Successfully!`);
      setIsRoleAddOpen(false);
    } catch (error) {
      console.error('Failed to add role:', error);
    }
  };

  return (
    <>
      {isFetchingRoles ? (
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[50px]" />
          <Skeleton className="h-[50px]" />
          <Skeleton className="h-[50px]" />
          <Skeleton className="h-[50px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5">
          {roles?.map((item, index) => {
            return renderItem(item, index);
          })}

          <CardAddNew
            onClick={handleAddRoleModalOpen}
            size="size-[60px]"
            iconSize="text-2xl"
            title="Add New Role"
            subTitle="Ignite Professional Adventures"
          />

          <ModalAddRole
            open={isRoleAddOpen}
            onOpenChange={handleAddRoleModalClose}
            onAddRole={handleAddRole}
            isCreatingRole={isCreatingRole}
          />
        </div>
      )}
    </>
  );
};

export { Roles };
