// ...existing code...
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://darienn-zenbook.tailee72e7.ts.net/';

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('connect', () => console.log('Socket conectado'));
    socket.on('disconnect', () => console.log('Socket desconectado'));
    socket.on('connect_error', (err) => console.error('error de socket', err));
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const subscribeToEvent = (event: string, callback: (...args: any[]) => void): void => {
  const s = getSocket();
  if (s) s.on(event, callback);
  else console.error('Socket no inicializado. Llamar a initializeSocket primero.');
};

export const unsubscribeFromEvent = (event: string, callback: (...args: any[]) => void): void => {
  const s = getSocket();
  if (s) s.off(event, callback);
};

export const emitEvent = (event: string, payload?: any): void => {
  const s = getSocket();
  if (s && s.connected) s.emit(event, payload);
  else console.warn('No se puede emitir. Socket desconectado.');
};

/**
 * Hook que expone estado de conexión y helpers.
 * Usa el mismo singleton del módulo para evitar múltiples conexiones.
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    // si el socket ya existe, devolver su estado
    return !!(socket && socket.connected);
  });

  useEffect(() => {
    const s = initializeSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (err: any) => console.error('Socket connect_error', err);

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('connect_error', handleError);

    setIsConnected(s.connected);

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('connect_error', handleError);
    };
  }, []);

  const subscribe = useCallback((event: string, cb: (...args: any[]) => void) => {
    subscribeToEvent(event, cb);
  }, []);

  const unsubscribe = useCallback((event: string, cb: (...args: any[]) => void) => {
    unsubscribeFromEvent(event, cb);
  }, []);

  const emit = useCallback((event: string, payload?: any) => {
    emitEvent(event, payload);
  }, []);

  return { isConnected, subscribe, unsubscribe, emit };
};
