import { useState, useEffect, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';

const LOCAL_STORAGE_KEY = 'localSettings';

interface LocalSettings {
  dateFormat: string;
  timeFormat: string;
  dateTimeFormat: string;
}

const defaultSettings: LocalSettings = {
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
};

type DateInput = number | Date | Dayjs | string;

export const useLocalSettings = (): [{
  dateFormat: string;
  timeFormat: string;
  dateTimeFormat: string;
  formatDate: (date: DateInput) => string;
  formatTime: (date: DateInput) => string;
  formatDateTime: (date: DateInput) => string;
}, (newSettings: Partial<LocalSettings>) => void] => {
  const [settings, setSettings] = useState<LocalSettings>(() => {
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<LocalSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const formatDateTimeHelper = (date: DateInput, format: string) =>
    dayjs(date).format(format);

  return [
    {
      ...settings,
      formatDate: (date: DateInput) => formatDateTimeHelper(date, settings.dateFormat),
      formatTime: (date: DateInput) => formatDateTimeHelper(date, settings.timeFormat),
      formatDateTime: (date: DateInput) => formatDateTimeHelper(date, settings.dateTimeFormat),
    },
    updateSettings,
  ];
};
