import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { OIGReportsContent } from './OIGReportsContent';
import { useLayout } from '@/providers';

const OIGReportsPage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>OIG Exclusion Verification Reports</ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <OIGReportsContent />
      </Container>
    </Fragment>
  );
};

export { OIGReportsPage };
