import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';

export type SignalPayload =
  | { type: 'offer'; data: RTCSessionDescriptionInit }
  | { type: 'answer'; data: RTCSessionDescriptionInit }
  | { type: 'ice'; data: RTCIceCandidateInit };

export function useVideoSignaling(
  roomId: string,
  onSignal: (signal: SignalPayload) => void,
  onPeerJoined?: () => void
) {
  const { emit, on, off, isConnected } = useSocket(roomId);
  const onSignalRef = useRef(onSignal);
  const onPeerJoinedRef = useRef(onPeerJoined);

  useEffect(() => {
    onSignalRef.current = onSignal;
    onPeerJoinedRef.current = onPeerJoined;
  }, [onSignal, onPeerJoined]);

  useEffect(() => {
    const handleSignal = (data: any) => {
      console.log('Received signal:', data.type);
      onSignalRef.current(data as SignalPayload);
    };

    const handlePeerJoined = (data: any) => {
      console.log('Peer joined room:', data);
      onPeerJoinedRef.current?.();
    };

    on('signal', handleSignal);
    on('peer-joined', handlePeerJoined);
    return () => {
      off('signal', handleSignal);
      off('peer-joined', handlePeerJoined);
    };
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
