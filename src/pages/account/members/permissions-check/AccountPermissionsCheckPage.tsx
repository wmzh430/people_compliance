import { Fragment } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';

import { useAdmin } from '@/hooks/useAdmin';

import { useParams } from 'react-router';

import { useNavigate } from 'react-router';

import { AccountPermissionsCheckContent } from '.';
import { useLayout } from '@/providers';

const AccountPermissionsCheckPage = () => {
  const { id } = useParams();
  const { roles, isFetchingRoles, fetchRolesError } = useAdmin();
  const { currentLayout } = useLayout();
  const navigate = useNavigate();

  if (isFetchingRoles) {
    return <div>Loading role details...</div>;
  }

  if (fetchRolesError) {
    return <div>Error fetching roles: {fetchRolesError.message}</div>;
  }

  const role = roles?.find((role) => role?.id === Number(id));

  if (!role) {
    return <div>Role not found.</div>;
  }

  return (
    <Fragment>
      <PageNavbar />

      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Overview of all team members and roles.</ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <a onClick={() => navigate('/roles')} className="btn btn-sm btn-light">
                View Roles
              </a>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <AccountPermissionsCheckContent role={role} />
      </Container>
    </Fragment>
  );
};

export { AccountPermissionsCheckPage };
