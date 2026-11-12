import { useEffect, useState } from 'react';
import { LoadingState } from '@/components/LoadingState';
import { getConfig, type AppConfig } from '@/config';
import { Appointments } from '@/features/appointments';
import { LocaleProvider, toLocale } from '@/i18n';

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const cfg = getConfig();
    document.body.setAttribute('data-theme', cfg.theme);
    document.documentElement.lang = toLocale(cfg.language);
    setConfig(cfg);
  }, []);

  return (
    <LocaleProvider locale={toLocale(config?.language ?? 'es')}>
      <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
        {config ? <Appointments config={config} /> : <LoadingState />}
      </main>
    </LocaleProvider>
  );
}
