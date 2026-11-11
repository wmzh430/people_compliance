import React, { useState, useRef, useEffect } from 'react';
import { Fragment } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from 'react-query';

import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { DataGridColumnHeader, KeenIcon } from '@/components';
import Grid from '@/pages/fd-reports/components/Table/Grid';
import { useLayout } from '@/providers';
import {
  fetchVerifications,
  IVerificationRecord
} from '@/services/ClinicianVerification/clinicianVerificationService';
import { Dialog, DialogBody, DialogContent, DialogHeader } from '@/components/ui/dialog';
import PDFViewer from '@/components/PDF';
import { requestS3PreSign } from '@/services/s3Service';
import apiClient from '@/api/client';

const STATUS_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  match_not_found: { icon: 'shield-tick', color: 'success', label: 'Clear' },
  no_results: { icon: 'shield-tick', color: 'success', label: 'Clear' },
  match_found: { icon: 'shield-cross', color: 'danger', label: 'Excluded' },
  inconclusive: { icon: 'information-2', color: 'warning', label: 'Inconclusive' },
  error: { icon: 'shield-cross', color: 'danger', label: 'Error' },
  pending: { icon: 'time', color: 'gray', label: 'Pending' }
};
const STATUS_FALLBACK = { icon: 'minus-circle', color: 'gray', label: 'Not Verified' };

const formatMonth = (dateStr: string | null) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

const formatVerifiedDate = (dateStr: string | null) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const OIGClinicianDetail = () => {
  const { clinicianId } = useParams<{ clinicianId: string }>();
  const navigate = useNavigate();
  const { currentLayout } = useLayout();

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [isPdfResolving, setIsPdfResolving] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<string>('');
  const [pageNumber, setPageNumber] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageRefs = useRef([]);

  useEffect(() => {
    return () => {
      if (selectedPdfUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(selectedPdfUrl);
      }
    };
  }, [selectedPdfUrl]);

  const {
    data: verifications,
    isLoading,
    isError
  } = useQuery(
    ['oigClinicianDetail', clinicianId],
    () => fetchVerifications({ clinician_id: Number(clinicianId), page_size: 200 }),
    { enabled: !!clinicianId }
  );

  const clinicianName = verifications?.results?.[0]?.clinician_name ?? 'Clinician';

  const deriveS3Key = (path: string): string => {
    if (path.startsWith('https://')) {
      try {
        const url = new URL(path);
        return url.pathname.replace(/^\//, '');
      } catch {
        return path;
      }
    }
    return path;
  };

  const handleViewPdf = async (record: IVerificationRecord) => {
    if (!record.pdf_path) return;
    setPdfModalOpen(true);
    setIsPdfResolving(true);
    setPdfLoadError('');
    setSelectedPdfUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    try {
      const key = deriveS3Key(record.pdf_path);
      const resp = await requestS3PreSign(key);
      const url = resp?.url || resp?.presigned_url || resp?.signed_url;
      if (url) {
        setSelectedPdfUrl(url);
        setIsPdfResolving(false);
        return;
      }
      throw new Error('No presigned URL returned');
    } catch (error) {
      try {
        const response = await apiClient.get(
          `/clinician-verification/verifications/${record.id}/pdf/`,
          { responseType: 'blob' }
        );
        const blobUrl = URL.createObjectURL(response.data);
        setSelectedPdfUrl(blobUrl);
        setIsPdfResolving(false);
      } catch (fallbackError) {
        console.error('Failed to load OIG PDF:', fallbackError || error);
        setPdfLoadError('Failed to load PDF');
        setSelectedPdfUrl(null);
        setIsPdfResolving(false);
      }
    }
  };

  const scrollToThumbnail = (page: number) => {
    const thumbnail = document.getElementById(`pdf-thumbnail-${page}`);
    if (thumbnail) {
      thumbnail.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const columns = [
    {
      accessorFn: (row: IVerificationRecord) => row.verified_at,
      id: 'month',
      name: 'Month',
      isVisible: true,
      header: ({ column }: any) => <DataGridColumnHeader title="Month" column={column} />,
      enableSorting: true,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        return formatMonth(row.verified_at);
      },
      meta: { className: 'min-w-[160px]', cellClassName: 'text-gray-800 font-normal' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.verified_at,
      id: 'verified_at',
      name: 'Verified At',
      isVisible: true,
      header: ({ column }: any) => <DataGridColumnHeader title="Verified At" column={column} />,
      enableSorting: true,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        return formatVerifiedDate(row.verified_at);
      },
      meta: { className: 'min-w-[180px]', cellClassName: 'text-gray-800 font-normal' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.status,
      id: 'status',
      name: 'Status',
      isVisible: true,
      header: ({ column }: any) => <DataGridColumnHeader title="Status" column={column} />,
      enableSorting: true,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        const { icon, color, label } =
          row.status && STATUS_CONFIG[row.status] ? STATUS_CONFIG[row.status] : STATUS_FALLBACK;
        return (
          <span
            className={`badge font-sm badge-${color} shrink-0 badge-outline rounded-[30px] whitespace-nowrap gap-1`}
          >
            <KeenIcon icon={icon} />
            {label}
          </span>
        );
      },
      meta: { className: 'min-w-[140px]', cellClassName: 'text-gray-800 font-normal' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.status,
      id: 'warning',
      name: 'Alert',
      isVisible: true,
      header: () => <span className="text-xs font-medium text-gray-600">Alert</span>,
      enableSorting: false,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        if (row.status === 'match_found' || row.status === 'inconclusive') {
          return <KeenIcon icon="information-2" className="text-danger text-lg" />;
        }
        return null;
      },
      meta: { className: 'min-w-[70px]', cellClassName: 'text-center' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.pdf_path,
      id: 'pdf',
      name: 'PDF',
      isVisible: true,
      header: () => <span className="text-xs font-medium text-gray-600">PDF</span>,
      enableSorting: false,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        if (!row.pdf_path) return <span className="text-gray-400 text-xs">—</span>;
        return (
          <button
            className="btn btn-sm btn-icon btn-light"
            onClick={(e) => {
              e.stopPropagation();
              handleViewPdf(row);
            }}
          >
            <KeenIcon icon="eye" className="text-primary text-base" />
          </button>
        );
      },
      meta: { className: 'min-w-[80px]', cellClassName: 'text-center' }
    }
  ];

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Verification history for {clinicianName}</ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b-0">
            <div className="flex items-center gap-3">
              <button className="btn btn-sm btn-light" onClick={() => navigate('/oig-reports')}>
                <KeenIcon icon="arrow-left" className="text-base" />
                Back
              </button>
              <h3 className="card-title font-medium text-sm">
                {clinicianName} — {verifications?.results?.length ?? 0} records
              </h3>
            </div>
          </div>

          <Grid
            data={verifications?.results ?? []}
            columns={columns}
            isFetchingReports={isLoading}
            isFetchReportsError={isError}
            fetchReportsError={null}
            title={`OIG History — ${clinicianName}`}
          />
        </div>
      </Container>

      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="container-fixed max-w-[auto] pt-7.5 w-[1000px] max-h-[95vh]">
          <DialogHeader className="p-0 border-0">
            <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                OIG Report — {clinicianName}
              </h1>
            </div>
          </DialogHeader>
          <DialogBody className="max-h-[600px] h-full overflow-auto bg-gray-100 scrollable-y p-3 mb-5">
            {isPdfResolving ? (
              <div className="h-[520px] flex items-center justify-center text-gray-500 text-lg">
                Loading PDF...
              </div>
            ) : selectedPdfUrl ? (
              <PDFViewer
                file={selectedPdfUrl}
                isReports={true}
                isActions={true}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
                pageRefs={pageRefs}
                scrollToThumbnail={scrollToThumbnail}
              />
            ) : (
              <div className="h-[520px] flex items-center justify-center text-gray-500 text-lg">
                {pdfLoadError || 'PDF not found'}
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export { OIGClinicianDetail };
