import React, { useState } from 'react';
import { Dialog, DialogBody, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { assignDepartment, deleteUser } from '@/services/Admin/adminService';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';
import { Field, Form, Formik } from 'formik';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.tsx';

interface IAssignDepartmentModalProps {
  open: boolean;
  onOpenChange: (value: ((prevState: boolean) => boolean) | boolean) => void;
  selected: number | any;
}

interface IDepartment {
  id: string;
  name: string;
}

interface IFormValues {
  department: any;
}

const AssignDepartmentModal: React.FC<IAssignDepartmentModalProps> = ({
  open,
  onOpenChange,
  selected
}) => {
  const { refetchUsers, departments } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!selected) return;
    try {
      setIsLoading(true);
      await assignDepartment({
        user_id: selected?.id,
        department_id: values?.department?.id
      });
      toast.success('Department Assigned Successfully.');
      refetchUsers();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign department:', error);
      toast.error('Failed to assign department. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col p-6">
        <DialogHeader className="p-0 border-0">
          <div className="flex items-center justify-between flex-wrap grow gap-5 pb-4.5 border-b-chart-1 border-gray-600">
            <div className="flex flex-col justify-center gap-2 w-full">
              <h1 className="text-xl font-semibold leading-none text-gray-900 w-full">
                Assign Department to {selected?.first_name} {selected?.last_name}
              </h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700">
                Please select the appropriate department for this user.
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="">
          <Formik<IFormValues>
            initialValues={{
              department: selected?.department || null
            }}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => {
              return (
                <Form className="space-y-6">
                  {/* Sub-Category Dropdown */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">
                      Departments
                    </label>
                    <Select
                      value={values.department?.id || ''}
                      onValueChange={(selectedId) => {
                        const selectedDepartment = departments.find(
                          (d: any) => d.id === selectedId
                        );
                        setFieldValue('department', selectedDepartment);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={values.department?.name || 'Select a Department'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department: any) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end mt-10 space-x-2">
                    <button
                      className="btn btn-sm btn-light w-[80px] justify-center"
                      type="button"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-sm btn-primary w-[80px] justify-center"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AssignDepartmentModal };
