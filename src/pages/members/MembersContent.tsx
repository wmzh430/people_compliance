import { Fragment } from 'react';
import { MiscStarter } from '@/partials/misc';
import { toAbsoluteUrl } from '@/utils';

const MembersContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <MiscStarter
        image={
          <Fragment>
            <img
              src={toAbsoluteUrl('/media/illustrations/22.svg')}
              className="dark:hidden max-h-[230px]"
              alt=""
            />
            <img
              src={toAbsoluteUrl('/media/illustrations/22-dark.svg')}
              className="light:hidden max-h-[230px]"
              alt=""
            />
          </Fragment>
        }
        title="New Member Onboarding and Registration"
        subTitle={
          <Fragment>
            A streamlined process to welcome and integrate new members into the team,
            <br />
            ensuring a smooth and efficient start.
          </Fragment>
        }
        engage={{
          path: '/members/add',
          label: 'Add New Member',
          btnColor: 'btn-primary'
        }}
      />
    </div>
  );
};

export { MembersContent };
