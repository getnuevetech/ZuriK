'use client';

import React from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/common';
import { Badge, Card } from '@/components/ui';
import { Order, OrderStatus, User, UserRole } from '@/types';
import { ORDER_STATUS_LABELS } from '@/utils/constants';

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.CUSTOMER,
  country: 'Nigeria',
  phone: '+234 XXX XXX XXXX',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-02-15'),
};

// Mock orders data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    userId: '1',
    user: mockUser,
    items: [],
    subtotal: 125.00,
    platformFee: 12.50,
    shippingFee: 15.00,
    totalAmount: 152.50,
    status: OrderStatus.PROCESSING,
    shippingAddress: {
      street: '123 Fashion Street',
      city: 'Lagos',
      state: 'Lagos',
      postalCode: '100001',
      country: 'Nigeria',
    },
    paymentMethod: 'card',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12'),
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    userId: '1',
    user: mockUser,
    items: [],
    subtotal: 89.99,
    platformFee: 9.00,
    shippingFee: 12.00,
    totalAmount: 110.99,
    status: OrderStatus.SHIPPED,
    shippingAddress: {
      street: '123 Fashion Street',
      city: 'Lagos',
      state: 'Lagos',
      postalCode: '100001',
      country: 'Nigeria',
    },
    paymentMethod: 'card',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-08'),
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    userId: '1',
    user: mockUser,
    items: [],
    subtotal: 200.00,
    platformFee: 20.00,
    shippingFee: 20.00,
    totalAmount: 240.00,
    status: OrderStatus.DELIVERED,
    shippingAddress: {
      street: '123 Fashion Street',
      city: 'Lagos',
      state: 'Lagos',
      postalCode: '100001',
      country: 'Nigeria',
    },
    paymentMethod: 'card',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-02-02'),
  },
];

const getStatusBadgeVariant = (status: OrderStatus): 'default' | 'gold' | 'accent' | 'success' | 'warning' | 'info' => {
  switch (status) {
    case OrderStatus.DELIVERED:
      return 'success';
    case OrderStatus.PROCESSING:
      return 'warning';
    case OrderStatus.SHIPPED:
      return 'info';
    case OrderStatus.PENDING:
      return 'default';
    case OrderStatus.CANCELLED:
      return 'accent';
    default:
      return 'default';
  }
};

export default function DashboardPage() {
  // Calculate stats
  const totalOrders = mockOrders.length;
  const totalSpent = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const savedItems = 5; // Mock value

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-dark mb-4">Navigation</h2>
                <nav className="space-y-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gold rounded-md hover:bg-gold-dark transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className="flex items-center px-4 py-2 text-sm font-medium text-dark hover:bg-cream-dark rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Orders
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-sm font-medium text-dark hover:bg-cream-dark rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/measurements"
                    className="flex items-center px-4 py-2 text-sm font-medium text-dark hover:bg-cream-dark rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Measurements
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-sm font-medium text-dark hover:bg-cream-dark rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                </nav>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-dark mb-2">
                Welcome back, {mockUser.firstName}! 👋
              </h1>
              <p className="text-dark-lighter">
                Here&apos;s what&apos;s happening with your orders today
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-gold to-gold-dark text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Total Orders</p>
                      <p className="text-3xl font-bold">{totalOrders}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-accent to-accent-dark text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Total Spent</p>
                      <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-dark to-dark-light text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Saved Items</p>
                      <p className="text-3xl font-bold">{savedItems}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-dark">Recent Orders</h2>
                  <Link
                    href="/dashboard/orders"
                    className="text-sm text-gold hover:text-gold-dark font-medium transition-colors"
                  >
                    View All →
                  </Link>
                </div>

                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-cream-dark rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-dark">{order.orderNumber}</h3>
                            <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                              {ORDER_STATUS_LABELS[order.status]}
                            </Badge>
                          </div>
                          <div className="text-sm text-dark-lighter space-y-1">
                            <p>Placed on: {order.createdAt.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</p>
                            <p>Total: <span className="font-semibold text-dark">${order.totalAmount.toFixed(2)}</span></p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="px-4 py-2 text-sm font-medium text-gold hover:text-gold-dark border border-gold hover:border-gold-dark rounded-md transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                  {mockOrders.length === 0 && (
                    <div className="text-center py-12">
                      <svg
                        className="w-16 h-16 mx-auto text-dark-lighter mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <p className="text-dark-lighter mb-4">No orders yet</p>
                      <Link
                        href="/designs"
                        className="inline-flex items-center px-6 py-3 bg-gold text-dark font-medium rounded-md hover:bg-gold-dark transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
