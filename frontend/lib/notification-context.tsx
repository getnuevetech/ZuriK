'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi } from './api';
import type { Notification } from '../types/notification';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const POLL_INTERVAL_MS = 30_000;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  };

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      setIsLoading(true);
      const [data, countData] = await Promise.all([
        notificationsApi.list(1, 20),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(data.notifications ?? []);
      setUnreadCount(countData.count ?? 0);
    } catch {
      // silently ignore – user may not be logged in
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    refreshNotifications();
    timerRef.current = setInterval(refreshNotifications, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refreshNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const wasUnread = notifications.find((n) => n.id === id)?.isRead === false;
    await notificationsApi.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, refreshNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
