import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AccountPermissionsCheckPage } from '@/pages/account/members/permissions-check/AccountPermissionsCheckPage';
import { AccountRolesPage } from '@/pages/account/members/roles/AccountRolesPage';
import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { ErrorsRouting } from '@/errors';
import ProtectedRoute from './ProtectedRoute';
import { MembersPage } from '@/pages/members';
import { AddMembers } from '@/pages/members/add';
import { CliniciansProvider } from '@/pages/clinicians/context/CliniciansContext';
import { CliniciansTablePage } from '@/pages/clinicians/blocks/list/CliniciansTablePage.tsx';
import { MembersList } from '@/pages/members/list/MembersList';
import { DepartmentUsersPage, DepartmentsPage } from '@/pages/departments';
import { OIGReportsPage, OIGClinicianDetail } from '@/pages/hr/oig-reports';
import { OIGReportsProvider } from '@/pages/hr/oig-reports/context/OIGReportsContext';

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<Navigate to="/members" replace />} />
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/members" element={<MembersPage />} />
            <Route path="/members/add" element={<AddMembers />} />
            <Route path="/members/list" element={<MembersList />} />
          </Route>
          <Route
            path="/clinicians/list"
            element={
              <CliniciansProvider>
                <CliniciansTablePage />
              </CliniciansProvider>
            }
          />
          <Route path="/roles" element={<AccountRolesPage />} />
          <Route path="/roles/permissions/:id" element={<AccountPermissionsCheckPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/departments/users/:id" element={<DepartmentUsersPage />} />
          <Route
            path="/oig-reports"
            element={
              <OIGReportsProvider>
                <OIGReportsPage />
              </OIGReportsProvider>
            }
          />
          <Route path="/oig-reports/clinician/:clinicianId" element={<OIGClinicianDetail />} />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
