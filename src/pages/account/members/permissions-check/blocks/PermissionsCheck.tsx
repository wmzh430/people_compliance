import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import { capitalizeFirstLetter } from '@/utils';

interface PermissionsCheckItem {
  id: number;
  name: string;
  codename: string;
  content_type: number;
}

interface Role {
  id: number;
  name: string;
  permissions: number[];
}

interface PermissionsCheckProps {
  role: { role: Role };
}

const TableRow = memo(
  ({
    each,
    isChecked,
    handleCheckboxChange
  }: {
    each: PermissionsCheckItem;
    isChecked: boolean;
    handleCheckboxChange: (id: number) => void;
  }) => (
    <tr key={each.id}>
      <td className="!py-5.5">{each.name}</td>
      <td className="!py-5.5 text-center">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={isChecked}
          onChange={() => handleCheckboxChange(each.id)}
        />
      </td>
    </tr>
  )
);

TableRow.displayName = 'TableRow';

const PermissionsCheck: React.FC<PermissionsCheckProps> = ({ role }) => {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    role.role.permissions || []
  );
  const { permissions, assignPermissions } = useAdmin();

  useEffect(() => {
    setSelectedPermissions(role.role.permissions || []);
  }, [role.role.permissions]);

  const handleCheckboxChange = useCallback((id: number) => {
    setSelectedPermissions((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((permissionId) => permissionId !== id)
        : [...prevSelected, id]
    );
  }, []);

  const handleAssignPermissions = async () => {
    try {
      const payload = {
        role_id: role.role.id,
        permission_ids: selectedPermissions
      };
      await assignPermissions(payload);
      toast.success(`Permissions for ${role.role.name} have been assigned successfully!`);
    } catch (error) {
      console.error(error);
      toast.error(`Error assigning permissions for ${role.role.name}`);
    }
  };

  return (
    <div className="card">
      <div className="card-header gap-2">
        <h3 className="card-title">
          <a href="#" className="link">
            {capitalizeFirstLetter(role.role.name)}
          </a>
          &nbsp;Role Permissions
        </h3>
        {/* <div className="flex gap-5">
          <a href="#" className="btn btn-sm btn-light btn-outline shrink-0">
            New Permission
          </a>
        </div> */}
      </div>
      <div className="card-table scrollable-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="text-start text-gray-300 font-normal min-w-[300px]">Permission</th>
              <th className="min-w-24 text-gray-700 font-normal text-center">Select</th>
            </tr>
          </thead>
          <tbody className="text-gray-900 font-medium">
            {permissions?.map((each: PermissionsCheckItem) => (
              <TableRow
                key={each.id}
                each={each}
                isChecked={selectedPermissions.includes(each.id)}
                handleCheckboxChange={handleCheckboxChange}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer justify-end py-7.5 gap-2.5">
        <a href="#" className="btn btn-light btn-outline">
          Restore Defaults
        </a>
        <button className="btn btn-primary" onClick={handleAssignPermissions}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export { PermissionsCheck };
