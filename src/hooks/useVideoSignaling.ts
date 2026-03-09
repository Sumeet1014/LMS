import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';

export type SignalPayload =
  | { type: 'offer'; data: RTCSessionDescriptionInit }
  | { type: 'answer'; data: RTCSessionDescriptionInit }
  | { type: 'ice'; data: RTCIceCandidateInit };

export function useVideoSignaling(
  roomId: string,
  onSignal: (signal: SignalPayload) => void
) {
  const { emit, on, off, isConnected } = useSocket(roomId);
  const onSignalRef = useRef(onSignal);

  useEffect(() => {
    onSignalRef.current = onSignal;
  }, [onSignal]);

  useEffect(() => {
    const handleSignal = (data: any) => {
      console.log('Received signal:', data.type);
      onSignalRef.current(data as SignalPayload);
    };

    on('signal', handleSignal);
    return () => off('signal', handleSignal);
  }, [on, off]);

  const sendSignal = useCallback(async (signal: SignalPayload) => {
    if (!isConnected) {
      console.warn('Socket not connected');
      return;
    }
    console.log('Sending signal:', signal.type);
    emit('signal', signal);
  }, [emit, isConnected]);

  return { sendSignal };
}
