import { useState, useEffect, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

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

export type DateInput = number | Date | Dayjs | string;

export const useLocalSettings = (): [{
  dateFormat: string;
  timeFormat: string;
  dateTimeFormat: string;
  formatDate: (date: DateInput) => string;
  formatTime: (date: DateInput) => string;
  formatDateTime: (date: DateInput) => string;
  formatCountdown: (targetDate: DateInput) => string;
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

  const formatCountdown = (targetDate: DateInput): string => {
    const now = dayjs();
    const target = dayjs(targetDate);
    const diff = dayjs.duration(target.diff(now));
    if (diff.asMilliseconds() <= 0) {
      return '0h 0m 0s';
    }
    
    const days = Math.floor(diff.asDays());
    const hours = diff.hours();
    const minutes = diff.minutes();
    const seconds = diff.seconds();
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return [
    {
      ...settings,
      formatDate: (date: DateInput) => formatDateTimeHelper(date, settings.dateFormat),
      formatTime: (date: DateInput) => formatDateTimeHelper(date, settings.timeFormat),
      formatDateTime: (date: DateInput) => formatDateTimeHelper(date, settings.dateTimeFormat),
      formatCountdown,
    },
    updateSettings,
  ];
};
