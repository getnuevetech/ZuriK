'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Notification } from '../../types/notification';
import { notificationsApi } from '../../lib/api';
import { NotificationList } from './NotificationList';

// Poll every 30 seconds — balances near-real-time updates with minimal server load for MVP
const POLL_INTERVAL_MS = 30000;

interface NotificationBellProps {
  tone?: 'light' | 'dark';
}

export function NotificationBell({ tone = 'light' }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await notificationsApi.getUnreadCount();
      if (count > prevCountRef.current) {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 1000);
      }
      prevCountRef.current = count;
      setUnreadCount(count);
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list({ limit: 5, page: 1 });
      setNotifications(data.items || []);
    } catch {}
    setLoading(false);
  }, []);

  const handleUpdate = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial fetch and polling
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      handleUpdate();
    } catch {}
  };
  const bellColorClass =
    tone === 'dark'
      ? 'text-white/80 hover:text-white'
      : 'text-[var(--color-primary)]/70 hover:text-[var(--color-primary)]';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={['relative p-2 transition-colors rounded-lg', bellColorClass, animate ? 'animate-bounce' : ''].join(' ')}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#fffdf9] rounded-xl shadow-modal border border-[#e3d7c8] z-50 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#eee3d6]">
            <h3 className="font-semibold text-[var(--color-primary-dark)] text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto p-2">
            <NotificationList
              notifications={notifications}
              loading={loading}
              onUpdate={handleUpdate}
              emptyMessage="You're all caught up!"
            />
          </div>

          {/* Footer */}
          <div className="border-t border-[#eee3d6] px-4 py-2.5 text-center">
            <Link
              href="/notifications"
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium"
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
