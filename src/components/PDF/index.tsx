//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  IoPrintOutline,
  IoCloudDownloadOutline,
  IoShareOutline,
  IoExpandOutline,
  IoContractOutline
} from 'react-icons/io5';
import Tooltip from '@mui/material/Tooltip';
import { LinearProgress } from '@mui/material';
import { actionLog, buildActionLogPayload } from '@/services/Faxes/inboxService';
import { Skeleton } from '../ui/skeleton';
import { BsZoomIn, BsZoomOut } from 'react-icons/bs';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;

const MAX_CACHED_PDFS = 6;
const pdfObjectUrlCache = new Map<string, string>();
const pendingPdfRequests = new Map<string, Promise<string>>();

const cachePdfObjectUrl = (source: string, objectUrl: string) => {
  if (pdfObjectUrlCache.has(source)) {
    pdfObjectUrlCache.delete(source);
  }

  pdfObjectUrlCache.set(source, objectUrl);

  if (pdfObjectUrlCache.size > MAX_CACHED_PDFS) {
    const oldestEntry = pdfObjectUrlCache.entries().next().value;

    if (!oldestEntry) {
      return;
    }

    const [oldestSource, oldestObjectUrl] = oldestEntry;
    pdfObjectUrlCache.delete(oldestSource);
    URL.revokeObjectURL(oldestObjectUrl);
  }
};

const fetchPdfObjectUrl = async (source: string) => {
  const cachedObjectUrl = pdfObjectUrlCache.get(source);
  if (cachedObjectUrl) {
    return cachedObjectUrl;
  }

  const pendingRequest = pendingPdfRequests.get(source);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = (async () => {
    const response = await fetch(source, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Accept: 'application/pdf'
      }
    });

    if (response.status === 404) {
      throw new Error('404');
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('The PDF is empty or invalid');
    }

    const objectUrl = URL.createObjectURL(blob);
    cachePdfObjectUrl(source, objectUrl);

    return objectUrl;
  })();

  pendingPdfRequests.set(source, request);

  try {
    return await request;
  } finally {
    pendingPdfRequests.delete(source);
  }
};

interface PDFViewerProps {
  file: string;
  isActions?: boolean;
  faxData?: any;
  scrollToThumbnail?: any;
  pageNumber?: number;
  setPageNumber?: any;
  currentPage?: number;
  setCurrentPage?: any;
  pageRefs?: any;
  manualPageChangeRef?: any;
  isReferrals?: boolean;
  isReports?: boolean;
  onPageCountChange?: (numPages: number) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  faxData,
  file,
  isActions = false,
  scrollToThumbnail,
  pageNumber,
  setPageNumber,
  currentPage,
  setCurrentPage,
  pageRefs,
  manualPageChangeRef,
  isReferrals = false,
  isReports = false,
  onPageCountChange
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingFile, setIsFetchingFile] = useState(Boolean(file));
  const [isRenderingPDF, setIsRenderingPDF] = useState(false);
  const [scale, setScale] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [lastWheelTime, setLastWheelTime] = useState(0);
  const [pdf, setPdf] = useState<string | null>(null);
  const activeSourceRef = useRef<string | null>(null);

  const isPDFLoading = isFetchingFile || isRenderingPDF;

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - start.x, y: e.clientY - start.y });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsRenderingPDF(false);
    onPageCountChange?.(numPages);
  };

  const onLoadError = (error: any) => {
    setError(error?.message?.includes('404') ? 'PDF not found' : 'Failed to load PDF');
    setIsRenderingPDF(false);
    console.error(error);
  };

  const renderLoadingState = (message = 'Loading PDF...') => (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-gray-700">{message}</div>
        <LinearProgress />
        <div className="mt-3 text-xs text-gray-500">Large PDFs can take 20-30 seconds to load.</div>
      </div>
    </div>
  );

  const renderStatusState = (message: string) => (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600 shadow-sm">
        {message}
      </div>
    </div>
  );

  const logActionBestEffort = async (action: string) => {
    const payload = buildActionLogPayload(faxData, action, { isReferrals, isReports });
    if (!payload) {
      return;
    }

    try {
      await actionLog(payload);
    } catch (error) {
      console.error('Failed to log PDF action:', error);
    }
  };

  const handleDownload = async () => {
    void logActionBestEffort('Download');

    const link = document.createElement('a');
    link.href = file;
    link.download = `${faxData?.patient_name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = async () => {
    void logActionBestEffort('Print');

    const pdfUrl = file;
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      alert('Pop-up blocked! Please allow pop-ups for this site.');
    }
  };

  const handleShare = async () => {
    if (!faxData?.fax_id) {
      console.error('Fax data is not available');
      return;
    }

    void logActionBestEffort('Share');

    const subject = `Fax Document - ${faxData?.patient_name || 'Document'}`;
    const body = `Please find the fax document${
      faxData?.patient_name ? ` for ${faxData.patient_name}` : ''
    } attached.`;

    const link = document.createElement('a');
    link.href = file;
    link.download = `${faxData?.patient_name || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  useEffect(() => {
    async function fetchPDF() {
      if (!file) {
        activeSourceRef.current = null;
        setPdf(null);
        setNumPages(0);
        setError(null);
        setIsFetchingFile(false);
        setIsRenderingPDF(false);
        onPageCountChange?.(0);
        return;
      }

      activeSourceRef.current = file;
      setError(null);
      setNumPages(0);
      setIsFetchingFile(true);

      if (isReports) {
        setPdf((currentPdf) => (currentPdf === file ? currentPdf : file));
        setIsRenderingPDF(true);
        setIsFetchingFile(false);
        return;
      }

      try {
        const nextPdf = await fetchPdfObjectUrl(file);

        if (activeSourceRef.current !== file) {
          return;
        }

        setPdf((currentPdf) => (currentPdf === nextPdf ? currentPdf : nextPdf));
        setIsRenderingPDF(true);
      } catch (error) {
        if (activeSourceRef.current !== file) {
          return;
        }

        setPdf(null);
        setError(error?.message === '404' ? 'PDF not found' : 'Failed to load PDF');
        console.error('Error fetching PDF:', error);
      } finally {
        if (activeSourceRef.current === file) {
          setIsFetchingFile(false);
        }
      }
    }

    setIsRenderingPDF(false);
    fetchPDF();

    return () => {
      activeSourceRef.current = null;
    };
  }, [file, isReports]);

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const handleFullScreen = () => {
    const viewer = document.getElementById('pdf-viewer-container');
    if (!isFullScreen) {
      if (viewer?.requestFullscreen) {
        viewer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setScale(1);
      setPosition({ x: 0, y: 0 }); // 🔹 ADDED: reset pan on exit fullscreen
    }
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      if (document.fullscreenElement) {
        document.body.classList.add('fullscreen-pdf');
      } else {
        document.body.classList.remove('fullscreen-pdf');
      }
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.body.classList.remove('fullscreen-pdf');
    };
  }, []);

  useEffect(() => {
    if (scale === 1) {
      setPosition({ x: 0, y: 0 }); // 🔹 ADDED: reset pan when returning to 100%
    }
  }, [scale]); // 🔹 CHANGED: added dependency to ensure reset happens exactly at scale 1

  // === page highlight observer (unchanged) ===
  useEffect(() => {
    const scrollContainer = document.querySelector('#pdf-scroll-container');
    if (!scrollContainer || !pageRefs?.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visiblePages = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number(entry.target.getAttribute('data-page-number')));

        if (visiblePages.length > 0) {
          setCurrentPage?.(Math.min(...visiblePages));
        }
      },
      {
        root: scrollContainer as Element | null,
        rootMargin: '0px 0px -80% 0px',
        threshold: 0.1
      }
    );

    pageRefs.current.forEach((ref: HTMLElement) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [numPages]);

  useEffect(() => {
    const activeThumb = document.querySelector(`#pdf-thumbnail-${currentPage}`);
    const thumbContainer = document.querySelector('#pdf-thumbnail-container');
    if (activeThumb && thumbContainer) {
      const containerHeight = thumbContainer.clientHeight;
      const thumbOffsetTop = (activeThumb as HTMLElement).offsetTop;
      const thumbHeight = (activeThumb as HTMLElement).clientHeight;
      const scrollOffset = thumbOffsetTop - containerHeight / 2 + thumbHeight / 2;
      (thumbContainer as HTMLElement).scrollTo({ top: scrollOffset, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
    onLoadSuccess?.({ numPages });
  };

  return (
    <div
      className={`flex flex-col ${isFullScreen ? 'h-screen' : 'h-full'}`}
      id="pdf-viewer-container"
    >
      {isActions && (
        <div
          className={`w-full flex items-end justify-end gap-3 p-4 ${
            isFullScreen ? 'bg-white' : ''
          }`}
        >
          {/* toolbar preserved */}
          <Tooltip title={'Print'}>
            <div
              className="flex flex-col items-center py-2 px-3 hover:bg-blue-100 rounded-full cursor-pointer"
              onClick={handlePrint}
            >
              <IoPrintOutline className="text-blue-600" />
            </div>
          </Tooltip>

          <Tooltip title={'Download'}>
            <div
              className="flex flex-col items-center py-2 px-3 rounded-full hover:bg-blue-100 cursor-pointer"
              onClick={handleDownload}
            >
              <IoCloudDownloadOutline className="text-blue-600" />
            </div>
          </Tooltip>

          <Tooltip title={'Share'}>
            <div
              className="flex flex-col items-center py-2 px-3 rounded-full hover:bg-blue-100 cursor-pointer"
              onClick={handleShare}
            >
              <IoShareOutline className="text-blue-600" />
            </div>
          </Tooltip>

          {/* zoom buttons kept visible in both modes */}
          <div
            className="flex flex-col items-center py-2 px-3 hover:bg-blue-100 rounded-full cursor-pointer"
            onClick={handleZoomIn}
          >
            <BsZoomIn className="text-blue-600" />
          </div>
          <div
            className="flex flex-col items-center py-2 px-3 hover:bg-blue-100 rounded-full cursor-pointer"
            onClick={handleZoomOut}
          >
            <BsZoomOut className="text-blue-600" />
          </div>

          <Tooltip title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}>
            <div
              className="flex flex-col items-center py-2 px-3 hover:bg-blue-100 rounded-full cursor-pointer"
              onClick={handleFullScreen}
            >
              {isFullScreen ? (
                <IoContractOutline className="text-blue-600" />
              ) : (
                <IoExpandOutline className="text-blue-600" />
              )}
            </div>
          </Tooltip>
        </div>
      )}

      <div
        className={`flex ${
          isFullScreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-60px)]'
        } min-w-[150px]`}
      >
        {/* Thumbnails (unchanged) */}
        <div
          className={`min-w-[150px] overflow-y-auto border-r border-gray-300 bg-gray-100 p-2 ${
            isFullScreen ? 'h-full' : ''
          }`}
          id="pdf-thumbnail-container"
        >
          {error ? (
            renderStatusState(error)
          ) : isPDFLoading && !pdf ? (
            renderLoadingState()
          ) : pdf ? (
            <Document file={pdf} loading={null}>
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={index}
                  id={`pdf-thumbnail-${index + 1}`}
                  className={`cursor-pointer flex flex-col items-center relative overflow-hidden ${
                    currentPage === index + 1 ? 'shadow-md' : ''
                  } mb-2 transition-all`}
                  onClick={() => {
                    const pageElement = pageRefs.current[index];
                    if (pageElement) {
                      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setCurrentPage?.(index + 1);
                    }
                  }}
                >
                  <div className="flex justify-center items-center w-full p-1">
                    <Page
                      pageNumber={index + 1}
                      width={126}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </div>

                  <span
                    className={`block text-sm py-1 font-semibold relative  ${
                      currentPage === index + 1 ? 'text-blue-500' : 'text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </span>
                  {currentPage === index + 1 && (
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none " />
                  )}
                </div>
              ))}
            </Document>
          ) : (
            renderStatusState('No PDF available')
          )}
        </div>

        {/* Main viewer */}
        <div
          className={`flex justify-center items-center w-full overflow-y-auto bg-white ${
            isFullScreen ? 'h-full' : ''
          }`}
          id="pdf-scroll-container"
        >
          {error ? (
            renderStatusState(error)
          ) : !file && !isPDFLoading ? (
            renderStatusState('No PDF available')
          ) : (
            <div
              className={`relative flex justify-center items-center h-full w-full bg-white ${
                isFullScreen ? 'h-full' : ''
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                cursor: dragging ? 'grabbing' : 'grab', // 🔹 ADDED: proper grab cursor only when zoomed
                position: 'relative',
                width: '100%',
                height: '100%'
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                // 🔹 CHANGED: removed CSS `transform: scale(${scale})` to avoid bitmap stretching
                // (pdf.js will handle crisp zoom via <Page scale={scale}>)
              >
                <div
                  className="relative m-auto"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px)`, // 🔹 ADDED: panning translation
                    transition: dragging ? 'none' : 'transform 0.2s'
                  }}
                >
                  {pdf ? (
                    <div>
                      {isPDFLoading && (
                        <div className="absolute left-0 right-0 top-0 z-10">
                          <LinearProgress />
                        </div>
                      )}
                      <Document
                        file={pdf}
                        onLoadSuccess={handleLoadSuccess}
                        onLoadError={onLoadError}
                        loading={renderLoadingState()}
                      >
                        {Array.from({ length: numPages }, (_, index) => (
                          <div
                            key={index + 1}
                            ref={(el) => (pageRefs.current[index] = el)}
                            data-page-number={index + 1}
                            className="mb-4 flex justify-center"
                          >
                            <Page
                              pageNumber={index + 1}
                              scale={scale} // 🔹 ADDED: crisp zoom via pdf.js re-render
                              renderAnnotationLayer={false}
                              renderTextLayer={false}
                              loading={<Skeleton className="h-[500px] w-[360px]" />}
                            />
                          </div>
                        ))}
                      </Document>
                    </div>
                  ) : isPDFLoading ? (
                    renderLoadingState()
                  ) : (
                    renderStatusState('No PDF available')
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
