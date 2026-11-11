import { Fragment, useState } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';
import { ModalAddRole } from '@/partials/modals/add-role';

import { AccountRolesContent } from '.';
import { useLayout } from '@/providers';

const AccountRolesPage = () => {
  const { currentLayout } = useLayout();

  const [isRoleAddOpen, setIsRoleAddOpen] = useState(false);
  const handleAddRoleModalOpen = () => {
    setIsRoleAddOpen(true);
  };
  const handleAddRoleModalClose = () => {
    setIsRoleAddOpen(false);
  };

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
          </Toolbar>
        </Container>
      )}

      <Container>
        <AccountRolesContent />
      </Container>
    </Fragment>
  );
};

export { AccountRolesPage };
