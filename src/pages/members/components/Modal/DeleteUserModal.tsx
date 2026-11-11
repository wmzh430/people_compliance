import React, { useState } from 'react';
import { Dialog, DialogBody, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { deleteUser } from '@/services/Admin/adminService';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';

interface IDeleteModalProps {
  open: boolean;
  onOpenChange: (value: ((prevState: boolean) => boolean) | boolean) => void;
  selected: number | any;
}

const DeleteUserModal: React.FC<IDeleteModalProps> = ({ open, onOpenChange, selected }) => {
  const { refetchUsers } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setIsLoading(true);
      await deleteUser(selected?.id);
      toast.success('User deleted successfully.');
      refetchUsers();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete User:', error);
      toast.error('Failed to delete User. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col p-6">
        <DialogHeader className="p-0 border-0">
          <h1 className="text-xl font-semibold text-gray-900">Confirm Deletion</h1>
        </DialogHeader>

        <DialogBody className="py-4">
          <p className="text-gray-700">
            Are you sure you want to delete the user {selected?.first_name} {selected?.last_name}?
            This action cannot be undone.
          </p>
        </DialogBody>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="btn btn-sm btn-light"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteUserModal };
