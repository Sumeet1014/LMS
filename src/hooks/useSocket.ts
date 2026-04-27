import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

// Singleton — survives HMR hot reloads
let globalSocket: Socket | null = null;
let globalSocketToken: string | null = null;

function getOrCreateSocket(): Socket {
    const token = localStorage.getItem('auth_token');

    // If token changed (different user logged in), disconnect old socket
    if (globalSocket && globalSocketToken !== token) {
        globalSocket.disconnect();
        globalSocket = null;
        globalSocketToken = null;
    }

    if (!globalSocket) {
        globalSocketToken = token;
        globalSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            auth: { token }
        });
    }

    return globalSocket;
}

export function useSocket(roomId?: string) {
    const [isConnected, setIsConnected] = useState(() => globalSocket?.connected ?? false);
    const roomIdRef = useRef(roomId);

    useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

    useEffect(() => {
        const socket = getOrCreateSocket();

        const onConnect = () => {
            setIsConnected(true);
            if (roomIdRef.current) socket.emit('join-session', roomIdRef.current);
        };
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        if (socket.connected) {
            setIsConnected(true);
            if (roomId) socket.emit('join-session', roomId);
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    useEffect(() => {
        if (globalSocket?.connected && roomId) {
            globalSocket.emit('join-session', roomId);
        }
    }, [roomId]);

    const emit = useCallback((event: string, data: any) => {
        if (globalSocket?.connected) {
            globalSocket.emit(event, { ...data, sessionId: roomIdRef.current });
        }
    }, []);

    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        globalSocket?.on(event, callback);
    }, []);

    const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
        globalSocket?.off(event, callback);
    }, []);

    return { socket: globalSocket, isConnected, emit, on, off };
}
