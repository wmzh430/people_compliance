import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  fetchUsers,
  addMember,
  createRole,
  getRoles,
  ONLY_USERS_QUERY_KEY,
  ONLY_USERS_QUERY_OPTIONS,
  getPermissions,
  assignPermissions,
  updateFDStatus,
  fetchDepartments,
  fetchRegions,
  fetchOnlyUsers
} from '@/services/Admin/adminService';

type UseAdminOptions = {
  enableUsersQuery?: boolean;
  enableOnlyUsersQuery?: boolean;
};

export const useAdmin = (options: UseAdminOptions = {}) => {
  const { enableUsersQuery = false, enableOnlyUsersQuery = false } = options;

  const [archived, setArchived] = useState(true);
  const [targetDate, setTargetDate] = useState('');
  const [customDate, setCustomDate] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [groupByField, setGroupByField] = useState<string | null>('provider_name');
  const [filterValue, setFilterValue] = useState<any>({});

  const queryClient = useQueryClient();

  const addMemberMutation = useMutation(addMember, {
    onSuccess: () => {
      // console.log('Member added successfully');
    },
    onError: (error: any) => {
      console.error('Failed to add member:', error);
    }
  });

  const createRoleMutation = useMutation(createRole, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles');
      // console.log('Role created successfully');
    },
    onError: (error: any) => {
      console.error('Failed to create role:', error);
    }
  });

  const rolesQuery = useQuery('roles', getRoles, {
    onSuccess: (data) => {
      // console.log('Roles fetched successfully:', data);
    },
    onError: (error: any) => {
      console.error('Failed to fetch roles:', error);
    }
  });

  const permisssionsQuery = useQuery('permissions', getPermissions, {
    onSuccess: (data) => {},
    onError: (error: any) => {
      console.error('Failed to fetch permissions:', error);
    }
  });

  const usersQuery = useQuery('users', fetchUsers, {
    enabled: enableUsersQuery,
    onSuccess: (data) => {},
    onError: (error: any) => {
      console.error('Failed to fetch users:', error);
    }
  });

  const onlyUsersQuery = useQuery(ONLY_USERS_QUERY_KEY, fetchOnlyUsers, {
    ...ONLY_USERS_QUERY_OPTIONS,
    enabled: enableOnlyUsersQuery,
    onSuccess: (data) => {},
    onError: (error: any) => {
      console.error('Failed to fetch users:', error);
    }
  });

  const departmentsQuery = useQuery('departments', fetchDepartments, {
    onSuccess: (data) => {},
    onError: (error: any) => {
      console.error('Failed to fetch departments:', error);
    }
  });

  const regionsQuery = useQuery('regions', fetchRegions, {});

  const assignPermissionsMutations = useMutation(assignPermissions, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles');
    },
    onError: (error: any) => {
      console.error('Failed to add assign permission:', error);
    }
  });

  const updateFDStatusMutations = useMutation(updateFDStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('reports');
    },
    onError: (error: any) => {
      console.error('Failed to add assign permission:', error);
    }
  });

  return {
    archived,
    setArchived,
    targetDate,
    setTargetDate,
    customDate,
    setCustomDate,
    search,
    setSearch,
    groupByField,
    setGroupByField,
    valueFilterHook: filterValue,
    setValueFilterHook: setFilterValue,

    addMember: addMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isLoading,
    isAddMemberError: addMemberMutation.isError,
    addMemberError: addMemberMutation.error,

    createRole: createRoleMutation.mutateAsync,
    isCreatingRole: createRoleMutation.isLoading,
    isCreateRoleError: createRoleMutation.isError,
    createRoleError: createRoleMutation.error,

    roles: rolesQuery.data,
    isFetchingRoles: rolesQuery.isLoading,
    isFetchRolesError: rolesQuery.isError,
    fetchRolesError: rolesQuery.error,

    permissions: permisssionsQuery.data,
    isFetchingPermissions: permisssionsQuery.isLoading,
    isFetchPermissionsError: permisssionsQuery.isError,
    fetchPermissionsError: permisssionsQuery.error,

    departments: departmentsQuery.data,
    isFetchingDepartments: departmentsQuery.isLoading,
    isFetchDepartmentsError: departmentsQuery.isError,
    fetchDepartmentsError: departmentsQuery.error,
    refetchDepartments: departmentsQuery.refetch,

    users: usersQuery.data,
    isFetchingUsers: usersQuery.isLoading,
    isFetchUsersError: usersQuery.isError,
    fetchUsersError: usersQuery.error,
    refetchUsers: usersQuery.refetch,

    assignPermissions: assignPermissionsMutations.mutateAsync,
    isAssigningPermissions: assignPermissionsMutations.isLoading,
    isAssigningPermissionsError: assignPermissionsMutations.isError,
    assignPermissionsError: assignPermissionsMutations.error,

    updateFDStatus: updateFDStatusMutations.mutateAsync,
    isUpdatingStatus: updateFDStatusMutations.isLoading,
    isUpdatingStatusError: updateFDStatusMutations.isError,
    updateFDStatusError: updateFDStatusMutations.error,

    regions: regionsQuery.data,

    onlyUsers: onlyUsersQuery.data,
    isFetchingOnlyUsers: onlyUsersQuery.isLoading,
    isFetchOnlyUsersError: onlyUsersQuery.isError,
    fetchOnlyUsersError: onlyUsersQuery.error,
    refetchOnlyUsers: onlyUsersQuery.refetch
  };
};
