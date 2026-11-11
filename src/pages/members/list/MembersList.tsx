import { useMemo, useState } from 'react';
import { DataGridColumnHeader } from '@/components';
import { useLanguage } from '@/i18n';
import { useAdmin } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { DataGrid } from '@/components';
import { Fragment } from 'react';
import { KeenIcon } from '@/components';
import { getAvatarColor, getInitials } from '@/utils';
import { useLayout } from '@/providers';
import { DeleteUserModal } from '../components/Modal/DeleteUserModal';
import EditUserModal from '../components/Modal/EditUserModal';
import { AssignDepartmentModal } from '../components/Modal/AssignDepartment';
import { useNavigate } from 'react-router';
import { Tooltip } from '@mui/material';

const MembersList = () => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const { users, isFetchingUsers } = useAdmin({ enableUsersQuery: true });
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleAssignDepartment = (user: any) => {
    setSelectedUser(user);
    setIsAssignOpen(true);
  };

  const columns = useMemo<any>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }: any) => <DataGridColumnHeader title="Name" column={column} />,
        enableSorting: true,
        cell: (info: {
          row: {
            original: {
              first_name: any;
              last_name: any;
              id: any;
              profile_picture: any;
              email: any;
            };
          };
        }) => {
          return (
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${getAvatarColor(info?.row?.original?.id)}`}
              >
                {info?.row?.original?.profile_picture ? (
                  <img
                    src={info?.row?.original?.profile_picture}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium">
                    {getInitials(
                      `${info?.row?.original?.first_name} ${info?.row?.original?.last_name}`
                    )}
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-medium text-left">
                  {info?.row?.original?.first_name} {info?.row?.original?.last_name}
                </div>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorKey: 'username',
        header: ({ column }: any) => <DataGridColumnHeader title="Username" column={column} />,
        enableSorting: true,
        cell: (info: { row: { original: { username: any } } }) => {
          return <>{info.row.original.username}</>;
        },
        meta: {
          headerClassName: 'w-[100px]',
          cellClassName: 'text-gray-500 font-normal'
        }
      },
      {
        accessorKey: 'department',
        header: ({ column }: any) => <DataGridColumnHeader title="Department" column={column} />,
        enableSorting: true,
        cell: (info: { row: { original: { department: { id: any; name: any } } } }) => {
          return (
            <div className="min-w-[200px] w-full">
              {info.row.original.department ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white bg-blue-500 ${getAvatarColor(info.row.original?.department?.id)}`}
                  >
                    <span className="text-xs font-medium">
                      {getInitials(`${info.row.original?.department?.name} `)}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-left">
                      {info.row.original?.department?.name}
                    </div>
                  </div>
                </div>
              ) : (
                <>No Department Assigned</>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: 'w-[100px]',
          cellClassName: 'text-gray-500 font-normal'
        }
      },
      {
        accessorKey: 'region',
        header: ({ column }: any) => <DataGridColumnHeader title="Region" column={column} />,
        enableSorting: true,
        cell: (info: { row: { original: { region: { id: any; name: any } } } }) => {
          return (
            <div className="min-w-[200px] w-full">
              {info.row.original.region ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white bg-blue-500 ${getAvatarColor(info.row.original?.region?.id)}`}
                  >
                    <span className="text-xs font-medium">
                      {getInitials(`${info.row.original?.region?.name} `)}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-left">
                      {info.row.original?.region?.name.charAt(0).toUpperCase() +
                        info.row.original?.region?.name.slice(1)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white bg-blue-500 ${getAvatarColor('all')}`}
                  >
                    <span className="text-xs font-medium">{getInitials(`All`)}</span>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-left">All</div>
                  </div>
                </div>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: 'w-[100px]',
          cellClassName: 'text-gray-500 font-normal'
        }
      },
      {
        accessorKey: 'email',
        header: ({ column }: any) => <DataGridColumnHeader title="Email" column={column} />,
        enableSorting: true,
        cell: (info: { row: { original: { email: any } } }) => {
          return <>{info.row.original.email}</>;
        },
        meta: {
          headerClassName: 'w-[100px]',
          cellClassName: 'text-gray-500 font-normal'
        }
      },
      {
        accessorKey: 'actions',
        header: ({ column }: any) => <DataGridColumnHeader title="Actions" column={column} />,
        enableSorting: true,
        cell: (info: { row: { original: any } }) => {
          return (
            <div className="flex items-center gap-2">
              <Tooltip
                title={`Edit ${info.row.original?.first_name} ${info.row.original?.last_name} Details`}
              >
                <div onClick={() => handleEditUser(info.row.original)}>
                  <KeenIcon icon="user-edit" className="text-blue-700 cursor-pointer" />
                </div>
              </Tooltip>
              <Tooltip
                title={`Assign Department to ${info.row.original?.first_name} ${info.row.original?.last_name}`}
              >
                <div onClick={() => handleAssignDepartment(info.row.original)}>
                  <KeenIcon icon="save-2" className="text-blue-700 cursor-pointer" />
                </div>
              </Tooltip>
              <Tooltip
                title={`Delete ${info.row.original?.first_name} ${info.row.original?.last_name}`}
              >
                <div onClick={() => handleDeleteUser(info.row.original)}>
                  <KeenIcon icon="archive" className="text-red-500 cursor-pointer" />
                </div>
              </Tooltip>
            </div>
          );
        },
        meta: {
          headerClassName: 'w-[100px]',
          cellClassName: 'text-gray-500 font-normal'
        }
      }
    ],
    [isRTL]
  );

  const toolbarOptions = [
    {
      title: 'Add New User',
      icon: 'setting-4',
      type: 'button',
      action: () => {
        navigate('/members/add');
      }
    }
  ];

  return (
    <Fragment>
      {isFetchingUsers ? (
        <>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[50px] my-4" />
          ))}
        </>
      ) : (
        <DataGrid columns={columns} data={users} rowSelection={true} title={'Members'} />
      )}

      <DeleteUserModal
        open={isDeleteOpen}
        onOpenChange={() => setIsDeleteOpen(false)}
        selected={selectedUser}
      />
      <EditUserModal
        open={isEditOpen}
        onOpenChange={() => setIsEditOpen(false)}
        selected={selectedUser}
      />
      <AssignDepartmentModal
        open={isAssignOpen}
        onOpenChange={() => setIsAssignOpen(false)}
        selected={selectedUser}
      />
    </Fragment>
  );
};

export { MembersList };
