import { useState, useEffect, useCallback, useRef } from 'react';
import { api, getErrorMessage } from '../services/api';
import { Email, ScheduleEmailPayload } from '../types';

export function useEmails(autoRefresh = true, intervalMs = 1500) {
  const [scheduledEmails, setScheduledEmails] = useState<Email[]>([]);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchEmails = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const [scheduledData, sentData] = await Promise.all([
        api.getScheduledEmails(200),
        api.getSentEmails(200),
      ]);

      if (isMountedRef.current) {
        setScheduledEmails(scheduledData);
        setSentEmails(sentData);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current && !isSilent) {
        setError(getErrorMessage(err));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchEmails();

    let intervalId: any;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchEmails(true); // Fast 1.5s silent polling for real-time live updates
      }, intervalMs);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchEmails, autoRefresh, intervalMs]);

  const scheduleCampaign = async (payload: ScheduleEmailPayload) => {
    try {
      const result = await api.scheduleEmails(payload);
      await fetchEmails();
      return result;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  // Stats derivation
  const stats = {
    totalScheduled: scheduledEmails.filter((e) => e.status === 'SCHEDULED').length,
    totalProcessing: scheduledEmails.filter((e) => e.status === 'PROCESSING').length,
    totalSent: sentEmails.filter((e) => e.status === 'SENT').length,
    totalFailed: sentEmails.filter((e) => e.status === 'FAILED').length,
  };

  return {
    scheduledEmails,
    sentEmails,
    loading,
    refreshing,
    error,
    stats,
    refresh: () => fetchEmails(false),
    scheduleCampaign,
  };
}
