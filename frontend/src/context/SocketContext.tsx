import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitEvent: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    const socketInstance: Socket = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 3,
      timeout: 5000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (user) {
        socketInstance.emit('authenticate', { userId: user.id, role: user.role });
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('ticket_status_changed', (data: any) => {
      showToast(
        'Live Ticket Update',
        `Ticket ${data.trackingCode || ''} changed to ${data.status}`,
        'info'
      );
    });

    socketInstance.on('new_announcement', (data: any) => {
      showToast('Campus Broadcast', data.title, 'warning');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, showToast]);

  const emitEvent = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, emitEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
