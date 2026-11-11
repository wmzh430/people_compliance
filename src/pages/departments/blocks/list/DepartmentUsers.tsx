import { useMemo } from 'react';
import { DataGridColumnHeader } from '@/components';
import { useLanguage } from '@/i18n';
import { useParams } from 'react-router';
import { useAdmin } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { DataGrid } from '@/components';
import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading } from '@/partials/toolbar';
import { getAvatarColor, getInitials } from '@/utils';
import { useLayout } from '@/providers';

const DepartmentUsersPage = () => {
  const { users, isFetchingUsers } = useAdmin({ enableUsersQuery: true });
  const { isRTL } = useLanguage();
  const { currentLayout } = useLayout();
  const { id } = useParams();
  const departmentUsers = useMemo(
    () =>
      users?.filter((user: any) => String(user?.department?.id ?? '') === String(id ?? '')) ?? [],
    [id, users]
  );

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
      }
    ],
    [isRTL]
  );

  return (
    <Fragment>
      {/* <PageNavbar /> */}

      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <h1 className="text-xl font-medium leading-none text-gray-900">Department Users</h1>
              <ToolbarDescription>Users assigned to this department.</ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        {isFetchingUsers ? (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-[50px]" />
            ))}
          </>
        ) : (
          <DataGrid
            columns={columns}
            data={departmentUsers}
            rowSelection={true}
            title={'Members'}
          />
        )}
      </Container>
    </Fragment>
  );
};

export { DepartmentUsersPage };
