import { Fragment } from 'react';

import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils/Assets';

import { CommonHexagonBadge } from '../common';
import { IAddNewProps } from './CardAddNewRow';
import { useSettings } from '@/providers';

const CardAddNew = ({ onClick, size, iconSize, title, subTitle }: IAddNewProps) => {
  const { getThemeMode } = useSettings();

  return (
    <Fragment>
      <div
        onClick={onClick}
        className="card border-2 border-dashed border-brand-clarity bg-center bg-[length:600px] bg-no-repeat cursor-pointer"
        style={{
          backgroundImage:
            getThemeMode() === 'dark'
              ? `url('${toAbsoluteUrl('/media/images/2600x1200/bg-4-dark.png')}')`
              : `url('${toAbsoluteUrl('/media/images/2600x1200/bg-4.png')}')`
        }}
      >
        <div className="card-body grid items-center">
          <div className="flex flex-col gap-3">
            <div className="flex justify-center pt-5">
              <CommonHexagonBadge
                size={size}
                badge={<KeenIcon icon="rocket" className={`${iconSize} text-brand`} />}
                stroke="stroke-brand-clarity"
                fill="fill-light"
              />
            </div>

            <div className="flex flex-col text-center">
              <span className="text-lg font-medium text-gray-900 hover:text-primary-active mb-px">
                {title}
              </span>
              <span className="text-2sm text-gray-700">{subTitle}</span>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export { CardAddNew };
