import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSettings } from '@/providers/SettingsProvider';
import { AppRouting } from '@/routing';
import { PathnameProvider } from '@/providers';
import { Toaster } from '@/components/ui/sonner';

const { BASE_URL } = import.meta.env;

const App = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add(settings.themeMode);
  }, [settings]);

  useEffect(() => {
    let today = new Date();
    const thisDay = new Date();
    const currentDay = today.getDay();
    const daysToSubtract = currentDay === 6 ? 0 : currentDay + 1;

    const lastSaturdayDate = new Date(today);
    lastSaturdayDate.setDate(today.getDate() - daysToSubtract);

    const lastClearedAtString = localStorage.getItem('lastClearedAt');
    let lastClearedAt: any;

    lastSaturdayDate.setHours(0, 0, 0, 0);

    if (!lastClearedAtString) {
      lastClearedAt = thisDay;
      localStorage.setItem('lastClearedAt', thisDay.toISOString());
    } else {
      lastClearedAt = new Date(lastClearedAtString);
    }

    let formattedClearedDate = lastClearedAt.setDate(lastClearedAt.getDate());

    if (lastSaturdayDate > formattedClearedDate) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key !== 'lastClearedAt' && key !== 'auth' && key !== 'currentUser') {
          localStorage.removeItem(key);
        }
      });

      localStorage.setItem('lastClearedAt', thisDay.toISOString());
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ fontSize: '1.5rem' }}></div>
      </div>
    );
  }

  return (
    <BrowserRouter
      basename={BASE_URL}
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true
      }}
    >
      <PathnameProvider>
        <AppRouting />
      </PathnameProvider>
      <Toaster richColors />
    </BrowserRouter>
  );
};

export { App };
