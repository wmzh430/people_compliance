import { useEffect, useState } from 'react';
import { Container } from '@/components/container';
import { getBackendHealth, subscribeBackendHealth } from '@/api/backendHealth';
import { fetchAppMetadata, type AppMetadata } from '@/services/Core/coreService';

const APP_METADATA_SESSION_KEY = 'app-footer-metadata';

const formatVersion = (version?: string) => {
  if (!version) {
    return '';
  }

  const parts = version.split('.');
  if (parts.length < 4) {
    return version;
  }

  return parts
    .map((part, index) => {
      if (index === 1 || index === 2) {
        const parsed = Number(part);
        if (Number.isFinite(parsed)) {
          return String(parsed).padStart(2, '0');
        }
      }
      return part;
    })
    .join('.');
};

const getCachedAppMetadata = (): AppMetadata | null => {
  try {
    const rawValue = sessionStorage.getItem(APP_METADATA_SESSION_KEY);
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as AppMetadata;
  } catch (error) {
    console.error('Failed to read app footer metadata from session storage', error);
    return null;
  }
};

const cacheAppMetadata = (value: AppMetadata) => {
  try {
    sessionStorage.setItem(APP_METADATA_SESSION_KEY, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to cache app footer metadata in session storage', error);
  }
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [appMetadata, setAppMetadata] = useState<AppMetadata | null>(() => getCachedAppMetadata());
  const [hasMetadataError, setHasMetadataError] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(
    () => getBackendHealth().status === 'healthy'
  );

  useEffect(() => {
    return subscribeBackendHealth((snapshot) => {
      setBackendHealthy(snapshot.status === 'healthy');
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchAppMetadata()
      .then((metadata) => {
        if (!isMounted) {
          return;
        }

        setHasMetadataError(false);
        setAppMetadata(metadata);
        cacheAppMetadata(metadata);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setHasMetadataError(true);
        console.error('Failed to load app footer metadata', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const footerBuildLabel =
    appMetadata?.APP_ENV && appMetadata?.APP_VERSION
      ? `${appMetadata.APP_ENV}: ${formatVersion(appMetadata.APP_VERSION)}`
      : null;
  const statusColorClass = backendHealthy && !hasMetadataError ? 'bg-green-500' : 'bg-red-500';
  const statusTitle =
    backendHealthy && !hasMetadataError ? 'Backend healthy' : 'Backend unavailable';

  return (
    <footer className="footer">
      <Container>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
          <div className="flex order-2 md:order-1  gap-2 font-normal text-2sm">
            <span className="text-gray-500">{currentYear} &copy;</span>
            <a
              href="https://archerhealthinc.com/"
              target="_blank"
              className="text-gray-600 hover:text-primary"
              rel="noreferrer"
            >
              Archer Health Inc.
            </a>
          </div>
          {footerBuildLabel || hasMetadataError ? (
            <div className="order-1 md:order-2 flex items-center gap-2 text-gray-500 text-2sm font-normal">
              {footerBuildLabel ? <span>{footerBuildLabel}</span> : null}
              <span
                aria-label={statusTitle}
                className={`inline-block size-2 rounded-full ${statusColorClass}`}
                title={statusTitle}
              />
            </div>
          ) : null}
          {/*<nav className="flex order-1 md:order-2 gap-4 font-normal text-2sm text-gray-600">*/}
          {/*  <a href="#" target="_blank" className="hover:text-primary" rel="noreferrer">*/}
          {/*    Docs*/}
          {/*  </a>*/}
          {/*  <a href="#" target="_blank" className="hover:text-primary" rel="noreferrer">*/}
          {/*    Purchase*/}
          {/*  </a>*/}
          {/*  <a href="#" target="_blank" className="hover:text-primary" rel="noreferrer">*/}
          {/*    FAQ*/}
          {/*  </a>*/}
          {/*  <a href="#" target="_blank" className="hover:text-primary" rel="noreferrer">*/}
          {/*    Support*/}
          {/*  </a>*/}
          {/*  <a href="#" target="_blank" className="hover:text-primary" rel="noreferrer">*/}
          {/*    License*/}
          {/*  </a>*/}
          {/*</nav>*/}
        </div>
      </Container>
    </footer>
  );
};

export { Footer };
