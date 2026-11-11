import React, { useRef } from 'react';
import { Formik, Field, Form } from 'formik';
import { Dialog, DialogBody, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useQuery } from 'react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchSingleClinician, updateClinician } from '@/services/Clinicians/clinicianService';
import { toast } from 'sonner';
import { useClinicians } from '@/pages/clinicians/context/CliniciansContext.tsx';

interface IModalProfileProps {
  open: boolean;
  onOpenChange: (value: ((prevState: boolean) => boolean) | boolean) => void;
  selected: number | any;
}

interface IClinicianFormValues {
  region: string | null;
}

const EditClinicianModal: React.FC<IModalProfileProps> = ({ open, onOpenChange, selected }) => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const { cliniciansRefetch } = useClinicians();

  const { data, isLoading, error } = useQuery(
    ['clinicians', selected],
    () => fetchSingleClinician(selected),
    {
      enabled: open
    }
  );

  if (error) {
    return <div>Error fetching report details. Please try again later.</div>;
  }

  const initialValues: IClinicianFormValues = {
    region: data?.region
      ? data.region.charAt(0).toUpperCase() + data.region.slice(1).toLowerCase()
      : 'N/A'
  };

  const handleSubmit = async (values: IClinicianFormValues) => {
    try {
      const updatedData = {
        region: values.region
      };

      await updateClinician(selected, updatedData);
      cliniciansRefetch();
      toast.success('Clinician information updated successfully.');

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to update clinician information:', error);
      toast.error('Failed to update clinician information. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="container-fixed max-w-[500px] flex flex-col p-10 overflow-hidden">
        <DialogHeader className="p-0 border-0">
          <div className="flex items-center justify-between gap-5 pb-7.5">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">Edit Clinician</h1>
              <p className="text-sm text-gray-700">Edit clinician settings.</p>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="py-0 px-3 overflow-y-auto" ref={parentRef}>
          <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
            {({ values, setFieldValue }) => (
              <Form>
                {isLoading ? (
                  <>
                    {Array.from({ length: 1 }).map((_, index) => (
                      <Skeleton key={index} className="h-[50px] my-5" />
                    ))}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-2.5">
                      <label className="form-label" htmlFor="region">
                        Region
                      </label>
                      <Field as="select" className="input" name="region" id="region">
                        {initialValues.region === 'N/A' && (
                          <option value="N/A" disabled>
                            N/A
                          </option>
                        )}
                        <option value="North">North</option>
                        <option value="South">South</option>
                      </Field>
                    </div>

                    <div className="flex justify-end mt-10 space-x-2">
                      <button
                        className="btn btn-sm btn-light"
                        onClick={(event) => {
                          event.preventDefault();
                          onOpenChange(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-sm btn-primary w-[65px] flex items-center justify-center"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Applying..' : 'Apply'}
                      </button>
                    </div>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditClinicianModal;
