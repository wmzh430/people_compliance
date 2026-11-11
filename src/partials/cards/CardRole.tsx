import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n';
import { KeenIcon, Menu, MenuItem, MenuToggle } from '@/components';

import { DropdownCardItem1 } from '../dropdowns/general';
import { CommonHexagonBadge } from '../common';
import { ReactNode, useMemo } from 'react';

import { capitalizeFirstLetter } from '@/utils';

import { useNavigate } from 'react-router-dom';

interface Badge {
  size: string;
  badge: ReactNode;
  fill: string;
  stroke: string;
}

interface RoleProps {
  role_id: number;
  title: string;
  subTitle: string;
  description: string;
  navigation: any;
  viewTitle: any;
}

const badges: Badge[] = [
  {
    size: 'size-[44px]',
    badge: <KeenIcon icon="setting" className="text-1.5xl text-primary" />,
    fill: 'fill-primary-light',
    stroke: 'stroke-primary-clarity'
  },
  {
    size: 'size-[44px]',
    badge: <KeenIcon icon="eye" className="text-1.5xl text-brand" />,
    fill: 'fill-brand-light',
    stroke: 'stroke-brand-clarity'
  },
  {
    size: 'size-[44px]',
    badge: <KeenIcon icon="face-id" className="text-1.5xl text-success" />,
    fill: 'fill-success-light',
    stroke: 'stroke-success-clarity'
  },
  {
    size: 'size-[44px]',
    badge: <KeenIcon icon="delivery-24" className="text-1.5xl text-danger" />,
    fill: 'fill-danger-light',
    stroke: 'stroke-danger-clarity'
  },
  {
    size: 'size-[44px]',
    badge: <KeenIcon icon="chart-line-up-2" className="text-1.5xl text-info" />,
    fill: 'fill-info-light',
    stroke: 'stroke-info-clarity'
  },
  {
    size: 'size-[44px]',
    badge: <KeenIcon icon="design-1" className="text-1.5xl text-gray-500" />,
    fill: 'fill-gray-100',
    stroke: 'stroke-gray-300'
  },
  {
    size: 'size-[44px]',
    badge: <KeenIcon icon="people" className="text-1.5xl text-success" />,
    fill: 'fill-success-light',
    stroke: 'stroke-success-clarity'
  }
];

const getRandomBadge = (): Badge => {
  const randomIndex = Math.floor(Math.random() * badges.length);
  return badges[randomIndex];
};

const CardRole = ({ role_id, title, subTitle, description, navigation, viewTitle }: RoleProps) => {
  const { isRTL } = useLanguage();
  const badge = useMemo(() => getRandomBadge(), []);
  const navigate = useNavigate();

  return (
    <div className="card flex flex-col gap-5 p-5 lg:p-7.5">
      <div className="flex items-center flex-wrap justify-between gap-1">
        <div className="flex items-center gap-2.5">
          <CommonHexagonBadge {...badge} />

          <div className="flex flex-col">
            <div className="text-md font-medium text-gray-900 hover:text-primary-active mb-px">
              {capitalizeFirstLetter(title)}
            </div>
            <span className="text-2sm text-gray-700">{subTitle}</span>
          </div>
        </div>

        <Menu className="inline-flex">
          <MenuItem
            toggle="dropdown"
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? 'bottom-start' : 'bottom-end',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: isRTL() ? [0, -10] : [0, 10] // [skid, distance]
                  }
                }
              ]
            }}
          >
            <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
              <KeenIcon icon="dots-vertical" />
            </MenuToggle>
            {DropdownCardItem1()}
          </MenuItem>
        </Menu>
      </div>

      <p className="text-2sm text-gray-700">{description}</p>

      <button className="btn w-fit flex justify-center" onClick={navigation}>
        {' '}
        <KeenIcon icon="eye" /> View {viewTitle}
      </button>
    </div>
  );
};

export { CardRole, type RoleProps };
