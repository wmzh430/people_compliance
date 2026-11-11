//@ts-nocheck
import React, { useRef, useState } from 'react';
import { Formik, Field, Form } from 'formik';
import { Dialog, DialogBody, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useQuery } from 'react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchSingleUser, updateUserInformation } from '@/services/Admin/adminService';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.tsx';

interface IModalProfileProps {
  open: boolean;
  onOpenChange: (value: ((prevState: boolean) => boolean) | boolean) => void;
  selected: number | any;
}

const EditUserModal: React.FC<IModalProfileProps> = ({ open, onOpenChange, selected }) => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const { departments, regions, refetchUsers } = useAdmin();

  const { data, isLoading, error } = useQuery(
    ['single-user', selected],
    () => fetchSingleUser(selected?.id),
    { enabled: open }
  );

  const handleSubmit = async (payload: any) => {
    if (!selected) return;
    try {
      setIsUpdateLoading(true);
      await updateUserInformation({
        userID: selected?.id,
        payload: payload
      });
      toast.success('User Information Updated Successfully.');
      refetchUsers();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update user information:', error);

      const errors = error.response?.data;

      let errorMessage = 'Failed to update user information. Please try again.';

      if (errors && typeof errors === 'object') {
        errorMessage = Object.entries(errors)
          .map(([key, value]) => ` ${(value as string[]).join(', ')}`)
          .join('\n');
      }

      toast.error(errorMessage);
    } finally {
      setIsUpdateLoading(false);
    }
  };

  if (error) {
    return <div>Error fetching user details. Please try again later.</div>;
  }

  if (isLoading || !data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-[430px] min-h-[600px] p-[40px]">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="min-h-[35px] min-w-[418px] my-4" />
          ))}
        </DialogContent>
      </Dialog>
    );
  }

  const initialValues = {
    roles: data.roles?.[0]?.id.toString() || '',
    department: data.department?.id || '',
    region: data.region?.id || '',
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || ''
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] flex flex-col p-10 overflow-hidden">
        <DialogHeader className="p-0 border-0">
          <div className="flex items-center justify-between gap-5 pb-7.5">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">Edit User</h1>
              <p className="text-sm text-gray-700">
                Edit the details of {data.first_name} {data.last_name}.
              </p>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="py-0 px-3 overflow-y-auto" ref={parentRef}>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={(values, { setSubmitting }) => {
              const payload = {
                roles: values.roles ? [parseInt(values.roles)] : [],
                department: values.department,
                region: values.region,
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email
              };

              handleSubmit(payload);
            }}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Field name="first_name" className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Field name="last_name" className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Field name="email" className="w-full border px-3 py-2 rounded" />
                </div>

                <div>
                  <label className="text-sm font-medium">Region</label>
                  <Select
                    value={values.region}
                    onValueChange={(val) => setFieldValue('region', val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions?.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Select
                    value={values.department}
                    onValueChange={(val) => setFieldValue('department', val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Roles</label>
                  <Select value={values.roles} onValueChange={(val) => setFieldValue('roles', val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Admin</SelectItem>
                      <SelectItem value="11">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    disabled={isUpdateLoading || isLoading}
                  >
                    {isUpdateLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
