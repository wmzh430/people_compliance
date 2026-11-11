import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLanguage } from '@/i18n';
import { useClinicians } from '../../context/CliniciansContext';
import { normalizeRegion, toAbsoluteUrl } from '@/utils';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { Clinician, updateClinician } from '@/services/Clinicians/clinicianService';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { DataGrid, DataGridColumnHeader, KeenIcon } from '@/components';
import Toolbar from '@/pages/clinicians/components/Grid/Toolbar.tsx';
import EditClinicianModal from '../../components/Modal/EditModal';

const CliniciansList = () => {
  const { isRTL } = useLanguage();

  const { clinicians, isCliniciansLoading, cliniciansRefetch, filter, setFilter } = useClinicians();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEdit, setSelectedEdit] = useState();

  const handleEditModalOpen = (id: any) => {
    setSelectedEdit(id);
    setEditModalOpen(true);
  };

  const employeeTypeConfig: Record<
    'Part-time' | 'Contract' | 'Full-time' | 'Staff',
    { icon: string; color: string }
  > = {
    'Part-time': { icon: 'time', color: 'info' },
    Contract: { icon: 'tablet-text-down', color: 'warning' },
    'Full-time': { icon: 'brifecase-tick', color: 'primary' },
    Staff: { icon: 'people', color: 'success' }
  };

  const userTypeConfig: Record<any, any> = {
    PT: { icon: 'people', color: 'warning' },
    OT: { icon: 'people', color: 'danger' },
    LVN: { icon: 'people', color: 'info' },
    PTA: { icon: 'people', color: 'success' },
    COTA: { icon: 'people', color: 'primary' },
    RN: { icon: 'people', color: 'dark' }
  };

  const regionColors: Record<string, string> = {
    north: 'text-red-600',
    south: 'text-blue-600',
    east: 'text-green-600',
    west: 'text-yellow-600'
  };

  const getRegionColor = (region: string) => {
    return regionColors[region?.toLowerCase()] || 'text-gray-800';
  };

  const columns = useMemo<ColumnDef<Clinician>[]>(
    () => [
      {
        accessorKey: 'last_name',
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} isFilter={true} isClinical={true} />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <>
              {info.row.original.first_name} {info.row.original.last_name}
            </>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorKey: 'suffix',
        header: ({ column }) => (
          <DataGridColumnHeader title="Suffix" column={column} isFilter={true} isClinical={true} />
        ),
        enableSorting: true,
        cell: (info) => {
          const userType = info.row.original.suffix ? info.row.original.suffix : 'N/A';
          const config =
            userType === 'N/A'
              ? { icon: 'minus-circle', color: 'gray' }
              : userTypeConfig[userType] || { icon: 'people', color: 'gray' };

          return (
            <span
              className={`badge font-sm badge-${config.color} shrink-0 badge-outline rounded-[30px] whitespace-nowrap  gap-1 `}
            >
              <KeenIcon icon={config.icon} />
              {userType}
            </span>
          );
        },
        meta: {
          headerClassName: 'w-[100px]',
          cellClassName: 'text-gray-500 font-normal'
        }
      },
      {
        accessorKey: 'employee_type',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Employee Type"
            column={column}
            isFilter={true}
            isClinical={true}
          />
        ),
        enableSorting: true,
        cell: (info) => {
          const employeeType = info.row.original.employee_type as keyof typeof employeeTypeConfig;
          const config = employeeTypeConfig[employeeType] || { icon: 'help-circle', color: 'gray' };

          return (
            <span
              className={`badge font-sm badge-${config.color} shrink-0 badge-outline rounded-[30px] whitespace-nowrap  gap-1 `}
            >
              <KeenIcon icon={config.icon} />
              {employeeType}
            </span>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorKey: 'zip_code',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Zip Code"
            column={column}
            isFilter={true}
            isClinical={true}
          />
        ),
        enableSorting: true,
        cell: (info) => info.getValue() || <>N/A</>,
        meta: {
          headerClassName: 'min-w-[100px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorKey: 'region',
        header: ({ column }) => (
          <DataGridColumnHeader title="Region" column={column} isFilter={true} isClinical={true} />
        ),
        enableSorting: true,
        cell: (info) => {
          const region = info.getValue() as keyof typeof regionColors;
          const textColor = getRegionColor(region);
          return region ? (
            <div className="flex items-center gap-1.5">
              <KeenIcon icon="compass" className={`${textColor} text-lg`} />
              <p className={`font-bold`}>{normalizeRegion(region)}</p>
            </div>
          ) : (
            <>N/A</>
          );
        },
        meta: {
          headerClassName: 'min-w-[130px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorKey: 'email_address',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Email Address"
            column={column}
            isFilter={true}
            isClinical={true}
          />
        ),
        enableSorting: true,
        cell: (info) =>
          info.row.original.email_address ? (
            <a href={`mailto:${info.getValue()}`} className="text-blue-600 hover:underline">
              {info.row.original.email_address}
            </a>
          ) : (
            <>N/A</>
          ),
        meta: {
          headerClassName: 'min-w-[200px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorKey: 'phone_1',
        header: ({ column }) => (
          <DataGridColumnHeader title="Phone 1" column={column} isFilter={true} isClinical={true} />
        ),
        enableSorting: true,
        cell: (info) => info.getValue() || <>N/A</>,
        meta: {
          headerClassName: 'min-w-[130px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorKey: 'phone_2',
        header: ({ column }) => (
          <DataGridColumnHeader title="Phone 2" column={column} isFilter={true} isClinical={true} />
        ),
        enableSorting: true,
        cell: (info) => info.getValue() || <>N/A</>,
        meta: {
          headerClassName: 'min-w-[130px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },

      {
        accessorKey: 'exclude_from_oig',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="OIG Report"
            column={column}
            isFilter={false}
            isClinical={true}
          />
        ),
        enableSorting: false,
        cell: (info) => {
          const excluded = info.row.original.exclude_from_oig;
          const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const newExcluded = !e.target.checked;
            try {
              await updateClinician(info.row.original.id, { exclude_from_oig: newExcluded });
              cliniciansRefetch();
              toast.success(
                newExcluded
                  ? 'Clinician excluded from OIG verification.'
                  : 'Clinician included in OIG verification.'
              );
            } catch {
              toast.error('Failed to update OIG setting.');
            }
          };
          return (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!excluded}
                onChange={handleToggle}
                className="checkbox checkbox-sm border-2"
              />
            </label>
          );
        },
        meta: {
          headerClassName: 'min-w-[120px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: { id: any }) => row.id,
        id: 'edit',
        name: 'Edit',
        isVisible: true,
        header: ({ column }: any) => <DataGridColumnHeader title="Edit" column={column} />,
        enableSorting: true,
        cell: (info: { row: { original: { id: any } } }) => {
          return (
            <button className={'w-full'} onClick={() => handleEditModalOpen(info.row.original.id)}>
              <KeenIcon icon={'pencil'} />
            </button>
          );
        },
        meta: {
          className: 'min-w-[165px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      }
    ],
    [isRTL, cliniciansRefetch]
  );

  return (
    <>
      <Toolbar />
      {isCliniciansLoading ? (
        <>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[50px]" />
          ))}
        </>
      ) : (
        <DataGrid
          columns={columns}
          data={clinicians?.results}
          rowSelection={true}
          paginationData={filter}
          setPaginationData={setFilter}
          paginationDataCount={clinicians?.count!}
          refetch={cliniciansRefetch}
          title={'Clinicians'}
        />
      )}

      <EditClinicianModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        selected={selectedEdit}
      />
    </>
  );
};

export { CliniciansList };
