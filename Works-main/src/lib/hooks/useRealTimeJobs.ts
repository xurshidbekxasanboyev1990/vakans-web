import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../contexts/SocketContext';

/**
 * Real-time hook for jobs list updates
 * Automatically refetches jobs when new/update/delete events occur
 */
export function useRealTimeJobs() {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // New job created and approved
    const handleNewJob = () => {
      console.log('📢 Real-time: New job added');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    };

    // Job updated
    const handleJobUpdate = (data: { id: string }) => {
      console.log('📢 Real-time: Job updated', data.id);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.id] });
    };

    // Job deleted
    const handleJobDelete = (data: { id: string }) => {
      console.log('📢 Real-time: Job deleted', data.id);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.removeQueries({ queryKey: ['job', data.id] });
    };

    // Job approved by admin
    const handleJobApproved = (data: { id: string }) => {
      console.log('📢 Real-time: Job approved', data.id);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    };

    socket.on('job:new', handleNewJob);
    socket.on('job:update', handleJobUpdate);
    socket.on('job:delete', handleJobDelete);
    socket.on('job:approved', handleJobApproved);

    return () => {
      socket.off('job:new', handleNewJob);
      socket.off('job:update', handleJobUpdate);
      socket.off('job:delete', handleJobDelete);
      socket.off('job:approved', handleJobApproved);
    };
  }, [socket, isConnected, queryClient]);

  return { isConnected };
}

/**
 * Real-time hook for applications updates
 */
export function useRealTimeApplications() {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // New application received
    const handleNewApplication = () => {
      console.log('📢 Real-time: New application');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    };

    // Application status changed
    const handleApplicationStatus = () => {
      console.log('📢 Real-time: Application status changed');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    };

    socket.on('application:new', handleNewApplication);
    socket.on('application:statusChanged', handleApplicationStatus);

    return () => {
      socket.off('application:new', handleNewApplication);
      socket.off('application:statusChanged', handleApplicationStatus);
    };
  }, [socket, isConnected, queryClient]);

  return { isConnected };
}

/**
 * Real-time hook for notifications
 */
export function useRealTimeNotifications() {
  const { socket, isConnected, notifications, unreadNotificationsCount } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotificationRead = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleAllRead = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:read', handleNotificationRead);
    socket.on('notification:read-all', handleAllRead);

    return () => {
      socket.off('notification:read', handleNotificationRead);
      socket.off('notification:read-all', handleAllRead);
    };
  }, [socket, isConnected, queryClient]);

  return { 
    notifications, 
    unreadCount: unreadNotificationsCount,
    isConnected 
  };
}

/**
 * Real-time hook for user blocking (force logout)
 */
export function useRealTimeUserStatus(onBlocked?: () => void) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleBlocked = (data: { message: string }) => {
      console.log('🚫 User blocked:', data.message);
      
      // Clear auth data
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      
      // Callback to logout
      if (onBlocked) {
        onBlocked();
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    };

    socket.on('user:blocked', handleBlocked);

    return () => {
      socket.off('user:blocked', handleBlocked);
    };
  }, [socket, isConnected, onBlocked]);

  return { isConnected };
}
