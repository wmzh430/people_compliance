import React, { useEffect, useState } from 'react';
import { KeenIcon } from '@/components';
import { useClinicians } from '@/pages/clinicians/context/CliniciansContext.tsx';
import { useDebounce } from '@/hooks/useDebounce.ts';
import Tooltip from '@mui/material/Tooltip';
import { toast } from 'sonner';
import { useQuery } from 'react-query';
import { fetchCrawlerDate } from '@/services/StaffUtilization/staffService.ts';
import { backendConfig } from '@/config';

const Toolbar = () => {
  const { filter, setFilter, cliniciansRefetch, clinicians } = useClinicians();
  const [localSearch, setLocalSearch] = useState<string>(filter.search);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (filter.search == '') {
      setLocalSearch('');
    }
  }, [filter.search]);

  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    const updateFilterAndFetchClinicians = async () => {
      await setFilter((prevFilter) => ({
        ...prevFilter,
        search: debouncedSearch
      }));
      cliniciansRefetch();
    };

    updateFilterAndFetchClinicians();
  }, [debouncedSearch, setFilter, cliniciansRefetch]);

  const handleFetchData = async () => {
    setIsLoading(true);
    try {
      toast.success('Triggered Successfully! Please do not close this page.');
      const response = await fetch(`${backendConfig.baseUrl}/schedule-reports/run-clinician`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      toast.success('Data Fetched Successfully!');
    } catch (error) {
      toast.error('Could not fetch data!');
    } finally {
      setIsLoading(false);
    }
  };

  const { data: crawlerDate } = useQuery({
    queryKey: ['lastSync', 'clinician'],
    queryFn: () => fetchCrawlerDate('clinician'),
    refetchInterval: 60000,
    refetchIntervalInBackground: false
  });

  return (
    <>
      <div className="flex-wrap flex justify-between gap-2 border-b-0">
        <h3 className="card-title font-medium text-sm">Total Clinicians: {clinicians?.count}</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className={`leading-none text-md absolute top-1/2 start-0 -translate-y-1/2 ms-3 `}
              />
              <input
                type="text"
                placeholder="Search"
                className="input input-sm ps-8 w-[300px] mt-1"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={'w-full flex justify-end items-center gap-x-1 mt-[-20px]'}>
        <Tooltip title={'Sync Data'}>
          <div onClick={handleFetchData} className={'cursor-pointer'}>
            {isLoading ? (
              <KeenIcon
                icon="rescue"
                className="text-green-600 mt-2 animate-spin"
                style={'duotone'}
              />
            ) : (
              <>
                <KeenIcon icon="rescue" className="text-blue-600 mt-2" style={'duotone'} />
              </>
            )}
          </div>
        </Tooltip>
        <div className="text-xs text-gray-500 mt-1">
          Last import:{' '}
          {crawlerDate?.last_fetched
            ? new Date(crawlerDate.last_fetched).toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            : 'N/A'}
        </div>
      </div>
    </>
  );
};

export default Toolbar;
