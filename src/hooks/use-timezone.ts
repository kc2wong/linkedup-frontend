import { useContext } from 'react';
import { TimezoneContext } from '../contexts/timezone-context';
import { DateTime } from 'luxon';
import { formatDistanceToNow as formatDistanceToNowFn } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }

  const formatDate = (value: Date | string): string => {
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime())
      ? ''
      : DateTime.fromJSDate(date).setZone(context.timezone).toFormat('yyyy-LL-dd');
  };

  const formatDatetime = (value: Date): string => {
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime())
      ? ''
      : DateTime.fromJSDate(date).setZone(context.timezone).toFormat('yyyy-LL-dd HH:mm:ss');
  };

  const formatDistanceToNow = (date: Date): string => {
    const { i18n } = useTranslation();
    return formatDistanceToNowFn(date, {
      addSuffix: true,
      locale: i18n.language === 'zhHant' ? zhTW : undefined,
    });
  };

  return {
    timezone: context.timezone,
    formatDate,
    formatDatetime,
    formatDistanceToNow,
  };
};
