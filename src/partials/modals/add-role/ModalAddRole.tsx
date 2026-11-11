import { useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface IModalAddRoleProps {
  open: boolean;
  onOpenChange: () => void;
  onAddRole: (roleName: string) => void;
  isCreatingRole: boolean;
}

const ModalAddRole = ({ open, onOpenChange, onAddRole, isCreatingRole }: IModalAddRoleProps) => {
  const [roleName, setRoleName] = useState('');

  const handleAddRole = () => {
    if (roleName.trim()) {
      onAddRole(roleName);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[500px] max-h-[95%] scrollable-y-auto">
        <DialogHeader className="justify-end border-0 pt-5">
          <DialogTitle className="sr-only">Add a New Role</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new role and define responsibilities for your team.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col items-center pt-0 pb-10">
          <h3 className="text-lg font-medium text-gray-900 text-center mb-3">Add a New role</h3>

          <div className="text-2sm text-center text-gray-700 mb-7">
            Define responsibilities and empower
            <br /> your team with a new role.
          </div>

          <div className="w-[90%] mb-8">
            <div className="flex flex-col items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <label className="form-label flex items-center gap-1 max-w-56">Role Name</label>
              <input
                className="input"
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={isCreatingRole}
            onClick={handleAddRole}
            className="btn btn-primary flex justify-center"
          >
            {isCreatingRole ? 'Adding...' : 'Add Role'}
          </button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalAddRole };
