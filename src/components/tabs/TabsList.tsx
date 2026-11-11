import React, { forwardRef } from 'react';
import { TabsList as MuiTabsList, TabsListProps as MuiTabProps } from '@mui/base/TabsList';

// Define the extended tab component
const TabsList = forwardRef<HTMLDivElement, MuiTabProps>((props, ref) => {
  return (
    <MuiTabsList
      slotProps={{
        root: () => ({
          className: 'tabs'
        })
      }}
      {...props}
      ref={ref}
    />
  );
});

TabsList.displayName = 'TabsList';

export { TabsList };
