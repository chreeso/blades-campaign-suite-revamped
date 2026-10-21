'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type SyncStatus = 'connected' | 'connecting' | 'local_mode' | 'error';

interface UseCampaignSyncProps {
  campaignId: string;
  onClockEvent?: (payload: unknown) => void;
  onFactionEvent?: (payload: unknown) => void;
  onCharacterEvent?: (payload: unknown) => void;
  onJournalEvent?: (payload: unknown) => void;
}

export function useCampaignSync({
  campaignId,
  onClockEvent,
  onFactionEvent,
  onCharacterEvent,
  onJournalEvent
}: UseCampaignSyncProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    return createClient() ? 'connecting' : 'local_mode';
  });
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      return;
    }

    const channelName = `campaign:${campaignId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true }
      }
    });

    channel
      .on('broadcast', { event: 'clock_update' }, ({ payload }) => {
        if (onClockEvent) onClockEvent(payload);
      })
      .on('broadcast', { event: 'faction_update' }, ({ payload }) => {
        if (onFactionEvent) onFactionEvent(payload);
      })
      .on('broadcast', { event: 'character_update' }, ({ payload }) => {
        if (onCharacterEvent) onCharacterEvent(payload);
      })
      .on('broadcast', { event: 'journal_update' }, ({ payload }) => {
        if (onJournalEvent) onJournalEvent(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSyncStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setSyncStatus('error');
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [campaignId, onClockEvent, onFactionEvent, onCharacterEvent, onJournalEvent]);

  // Broadcast function to notify peers across clients in real-time
  const broadcastChange = useCallback(
    async (event: 'clock_update' | 'faction_update' | 'character_update' | 'journal_update', payload: unknown) => {
      if (channelRef.current && syncStatus === 'connected') {
        await channelRef.current.send({
          type: 'broadcast',
          event,
          payload
        });
      }
    },
    [syncStatus]
  );

  return {
    syncStatus,
    broadcastChange
  };
}
