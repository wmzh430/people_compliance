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

import { Departments } from './blocks';
import { useLayout } from '@/providers';

const DepartmentsPage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      {/* <PageNavbar /> */}

      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Overview of all Departments.</ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <Departments />
      </Container>
    </Fragment>
  );
};

export { DepartmentsPage };
