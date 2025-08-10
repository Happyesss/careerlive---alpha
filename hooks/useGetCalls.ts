"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const useGetCalls = () => {
  const { user } = useAuth();
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>();
  const [isLoading, setIsLoading] = useState(false);

  const loadCalls = async () => {
    if (!client || !user?.id) return;
    
    setIsLoading(true);

    try {
      // https://getstream.io/video/docs/react/guides/querying-calls/#filters
      const { calls } = await client.queryCalls({
        sort: [{ field: 'starts_at', direction: -1 }],
        filter_conditions: {
          starts_at: { $exists: true },
          $or: [
            { created_by_user_id: user.id },
            { members: { $in: [user.id] } },
          ],
        },
      });

      let mergedCalls: Call[] = calls;

      // Also include calls this user joined via a link (not explicitly a member)
      try {
        if (typeof window !== 'undefined') {
          const key = `joinedViaLink:${user.id}`;
          const stored = window.localStorage.getItem(key);
          const joinedIds: string[] = stored ? JSON.parse(stored) : [];

          const existingIds = new Set(mergedCalls.map((c) => c.id));
          const missingIds = joinedIds.filter((id) => !existingIds.has(id));

          if (missingIds.length > 0) {
            const extra = await client.queryCalls({
              filter_conditions: { id: { $in: missingIds } },
              sort: [{ field: 'starts_at', direction: -1 }],
            });
            // Merge and de-duplicate by id
            const byId = new Map<string, Call>();
            mergedCalls.forEach((c) => byId.set(c.id, c));
            extra.calls.forEach((c) => byId.set(c.id, c));
            mergedCalls = Array.from(byId.values());
          }
        }
      } catch (_) {
        // Non-fatal: if localStorage or extra query fails, stick with base list
      }

      setCalls(mergedCalls);
    } catch (error) {
      // Silently handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, [client, user?.id]);

  const now = new Date();

  const endedCalls = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
    return (startsAt && new Date(startsAt) < now) || !!endedAt
  })

  const upcomingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
    return startsAt && new Date(startsAt) > now
  })

  return { 
    endedCalls, 
    upcomingCalls, 
    callRecordings: calls, 
    isLoading,
    refetchCalls: loadCalls // Add manual refresh function
  }
};