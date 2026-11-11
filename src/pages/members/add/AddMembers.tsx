import { KeenIcon } from '@/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const formSchema = Yup.object().shape({
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
  username: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Username is required'),
  first_name: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('First Name is required'),
  last_name: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Last Name is required'),
  role_id: Yup.string().required('Role is required')
});

const initialValues = {
  email: '',
  password: '',
  username: '',
  first_name: '',
  last_name: '',
  profile_picture: '',
  role_id: '',
  department_id: '',
  region_id: ''
};

const AddMembers = () => {
  const { addMember, isAddingMember, roles, departments, regions } = useAdmin();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues,
    validationSchema: formSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        await addMember(values);
        setSubmitting(false);
        toast.success(`${values.first_name} ${values.last_name} has been Added Successfully!`);
        navigate('/members');
      } catch (error: any) {
        setStatus('There was an error adding the member');

        const errorData = error?.response?.data;

        if (errorData && typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg) => {
                toast.error(`${msg}`);
              });
            }
          });
        } else {
          toast.error(`Error Adding ${values.first_name} ${values.last_name}`);
        }

        setSubmitting(false);
      }
    }
  });

  const handleRoleChange = (value: any) => {
    formik.setFieldValue('role_id', value);
  };

  const handleDepartmentChange = (value: any) => {
    formik.setFieldValue('department_id', value);
  };

  const handleRegionChange = (value: any) => {
    formik.setFieldValue('region_id', value);
  };

  const selectedRole = roles?.find((role) => String(role.id) === formik.values.role_id);
  const selectedDepartment = departments?.find(
    (department: any) => String(department.id) === formik.values.department_id
  );
  const selectedRegion = regions?.find(
    (region: any) => String(region.id) === formik.values.region_id
  );

  return (
    <div className="card mx-[30px]">
      <div className="card-header" id="webhooks">
        <h3 className="card-title">Add Members to your Organization</h3>
      </div>
      <form className="card-body flex flex-col gap-5 p-10" onSubmit={formik.handleSubmit}>
        <div className="card-body grid gap-5">
          <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
            <span className="form-label max-w-32 w-full">Email</span>
            <div className="grow min-w-48">
              <input className="input w-full" type="text" {...formik.getFieldProps('email')} />
              {formik.touched.email && formik.errors.email && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.email}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
            <span className="form-label max-w-32 w-full">Username</span>
            <div className="grow min-w-48">
              <input className="input w-full" type="text" {...formik.getFieldProps('username')} />
              {formik.touched.username && formik.errors.username && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.username}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
            <span className="form-label max-w-32 w-full">Password</span>
            <div className="grow min-w-48">
              <input
                className="input w-full"
                type="password"
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.password}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
            <span className="form-label max-w-32 w-full">First Name</span>
            <div className="grow min-w-48">
              <input className="input w-full" type="text" {...formik.getFieldProps('first_name')} />
              {formik.touched.first_name && formik.errors.first_name && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.first_name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
            <span className="form-label max-w-32 w-full">Last Name</span>
            <div className="grow min-w-48">
              <input className="input w-full" type="text" {...formik.getFieldProps('last_name')} />
              {formik.touched.last_name && formik.errors.last_name && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.last_name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline flex-wrap gap-2.5">
            <label className="form-label max-w-32">Role</label>
            <div className="grid gap-5 grow items-start">
              <Select value={formik.values.role_id} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select">
                    {selectedRole
                      ? selectedRole.name.charAt(0).toUpperCase() + selectedRole.name.slice(1)
                      : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role: any) => (
                    <SelectItem value={role.id} key={role.id}>
                      {' '}
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.role_id && formik.errors.role_id && (
                <span role="alert" className="text-danger text-xs">
                  {formik.errors.role_id}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline flex-wrap gap-2.5">
            <label className="form-label max-w-32">Department</label>
            <div className="grid gap-5 grow items-start">
              <Select value={formik.values.department_id} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select">
                    {selectedDepartment
                      ? selectedDepartment.name.charAt(0).toUpperCase() +
                        selectedDepartment.name.slice(1)
                      : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((department: any) => (
                    <SelectItem value={department.id} key={department.id}>
                      {' '}
                      {department.name.charAt(0).toUpperCase() + department.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.department_id && formik.errors.department_id && (
                <span role="alert" className="text-danger text-xs">
                  {formik.errors.department_id}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline flex-wrap gap-2.5">
            <label className="form-label max-w-32">Region</label>
            <div className="grid gap-5 grow items-start">
              <Select value={formik.values.region_id} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select">
                    {selectedRegion
                      ? selectedRegion.name.charAt(0).toUpperCase() + selectedRegion.name.slice(1)
                      : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {regions?.map((region: any) => (
                    <SelectItem value={region.id} key={region.id}>
                      {' '}
                      {region.name.charAt(0).toUpperCase() + region.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.region_id && formik.errors.region_id && (
                <span role="alert" className="text-danger text-xs">
                  {formik.errors.region_id}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[150px] mr-8">
            <button
              type="submit"
              className="btn btn-primary flex items-center justify-center w-full"
              disabled={isAddingMember}
            >
              {isAddingMember ? (
                <div className="loader">
                  <KeenIcon icon="spinner" className="animate-spin" />
                </div>
              ) : (
                <KeenIcon icon="plus-squared" />
              )}
              Add Member
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export { AddMembers };
