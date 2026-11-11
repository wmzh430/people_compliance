import { Fragment } from 'react';
import { KeenIcon } from '@/components';
import { useNavigate } from 'react-router';

import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { MembersContent } from './MembersContent';
import { useLayout } from '@/providers';
import { MembersList } from '@/pages/members/list/MembersList.tsx';

const MembersPage = () => {
  const { currentLayout } = useLayout();
  const navigate = useNavigate();

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container className="flex items-center justify-between w-full">
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Overview of all team members.</ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
          <button
            className={`btn-primary p-2 text-sm rounded-lg`}
            onClick={() => navigate('/members/add')}
          >
            <KeenIcon icon="plus-circle" /> Add New Member
          </button>
        </Container>
      )}

      <Container>
        {/* <MembersContent /> */}
        <MembersList />
      </Container>
    </Fragment>
  );
};

export { MembersPage };
