import { CliniciansList } from '@/pages/clinicians/blocks/list/CliniciansList.tsx';

const CliniciansTableContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <CliniciansList />
    </div>
  );
};

export { CliniciansTableContent };
