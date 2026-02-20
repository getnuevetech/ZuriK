'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsApi } from './api';
import type { Notification } from '../types/notification';

interface NotificationContextValue {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  notifications: [],
  loading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refresh: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    setIsLoggedIn(!!token);
  }, []);

  const refresh = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) return;
    try {
      setLoading(true);
      const [countRes, listRes] = await Promise.all([
        notificationsApi.getUnreadCount(),
        notificationsApi.list(1, 10),
      ]);
      setUnreadCount(countRes.count);
      setNotifications(listRes.notifications || []);
    } catch {
      // silently ignore when not authenticated
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 30 seconds when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [isLoggedIn, refresh]);

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
    const n = notifications.find((x) => x.id === id);
    await notificationsApi.delete(id);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    if (n && !n.isRead) setUnreadCount((c) => Math.max(0, c - 1));
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, notifications, loading, markAsRead, markAllAsRead, deleteNotification, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
