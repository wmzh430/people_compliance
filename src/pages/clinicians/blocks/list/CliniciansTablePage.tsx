import { Fragment } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';

import { CliniciansTableContent } from '@/pages/clinicians/blocks/list/CliniciansTableContent.tsx';
import { useLayout } from '@/providers';

const CliniciansTablePage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Clinicians Management Hub</ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <CliniciansTableContent />
      </Container>
    </Fragment>
  );
};

export { CliniciansTablePage };
