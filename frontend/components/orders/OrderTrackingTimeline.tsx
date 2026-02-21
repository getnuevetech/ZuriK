'use client';

import React from 'react';
import type { ShipmentTracking } from '../../lib/api';

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  pending:           { label: 'Pending',          icon: '⏳', color: 'text-neutral-600',  bgColor: 'bg-neutral-100' },
  processing:        { label: 'Processing',       icon: '🔄', color: 'text-blue-600',     bgColor: 'bg-blue-50' },
  shipped:           { label: 'Shipped',          icon: '📦', color: 'text-indigo-600',   bgColor: 'bg-indigo-50' },
  in_transit:        { label: 'In Transit',       icon: '🚚', color: 'text-purple-600',   bgColor: 'bg-purple-50' },
  out_for_delivery:  { label: 'Out for Delivery', icon: '🏍️', color: 'text-orange-600',  bgColor: 'bg-orange-50' },
  delivered:         { label: 'Delivered',        icon: '✅', color: 'text-green-600',    bgColor: 'bg-green-50' },
  failed:            { label: 'Failed',           icon: '❌', color: 'text-red-600',      bgColor: 'bg-red-50' },
  returned:          { label: 'Returned',         icon: '↩️', color: 'text-yellow-600',  bgColor: 'bg-yellow-50' },
};

const PROGRESS_STEPS = ['pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];

interface OrderTrackingTimelineProps {
  shipment: ShipmentTracking;
}

export function OrderTrackingTimeline({ shipment }: OrderTrackingTimelineProps) {
  const config = STATUS_CONFIG[shipment.status] ?? STATUS_CONFIG['pending'];
  const currentStepIdx = PROGRESS_STEPS.indexOf(shipment.status);

  return (
    <div className="space-y-6">
      {/* Current status badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${config.bgColor} ${config.color}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>

      {/* Progress bar (only for forward-progress statuses) */}
      {currentStepIdx >= 0 && (
        <div className="flex items-center gap-0">
          {PROGRESS_STEPS.map((step, idx) => {
            const stepConfig = STATUS_CONFIG[step];
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 transition-colors',
                      isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : '',
                      isCurrent ? 'bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-100' : '',
                      !isCompleted && !isCurrent ? 'bg-white border-neutral-300 text-neutral-400' : '',
                    ].join(' ')}
                    title={stepConfig.label}
                  >
                    {isCompleted ? '✓' : stepConfig.icon}
                  </div>
                  <span className={`mt-1 text-xs text-center hidden sm:block max-w-16 leading-tight ${isCurrent ? 'font-semibold text-indigo-700' : isCompleted ? 'text-indigo-500' : 'text-neutral-400'}`}>
                    {stepConfig.label}
                  </span>
                </div>
                {idx < PROGRESS_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 mt-[-0.75rem] sm:mt-[-1.5rem] transition-colors ${idx < currentStepIdx ? 'bg-indigo-600' : 'bg-neutral-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Tracking info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {shipment.carrier && (
          <div>
            <span className="text-neutral-500 font-medium">Carrier: </span>
            <span className="text-neutral-900">{shipment.carrier}</span>
          </div>
        )}
        {shipment.trackingNumber && (
          <div>
            <span className="text-neutral-500 font-medium">Tracking #: </span>
            {shipment.carrierTrackingUrl ? (
              <a
                href={shipment.carrierTrackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline font-mono"
              >
                {shipment.trackingNumber}
              </a>
            ) : (
              <span className="font-mono text-neutral-900">{shipment.trackingNumber}</span>
            )}
          </div>
        )}
        {shipment.estimatedDeliveryDate && (
          <div>
            <span className="text-neutral-500 font-medium">Est. Delivery: </span>
            <span className="text-neutral-900">
              {new Date(shipment.estimatedDeliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        )}
        {shipment.deliveredAt && (
          <div>
            <span className="text-neutral-500 font-medium">Delivered: </span>
            <span className="text-green-700 font-semibold">
              {new Date(shipment.deliveredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Carrier tracking link */}
      {shipment.carrierTrackingUrl && (
        <a
          href={shipment.carrierTrackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Track on {shipment.carrier || 'Carrier'} →
        </a>
      )}

      {/* Timeline of events */}
      {shipment.events && shipment.events.length > 0 && (
        <div>
          <h4 className="font-semibold text-neutral-800 mb-3">Tracking History</h4>
          <ol className="relative border-l-2 border-neutral-200 space-y-4 pl-6">
            {[...shipment.events].reverse().map((event) => {
              const evConfig = STATUS_CONFIG[event.status] ?? STATUS_CONFIG['pending'];
              return (
                <li key={event.id} className="relative">
                  <span className={`absolute -left-9 flex items-center justify-center w-7 h-7 rounded-full ${evConfig.bgColor} border-2 border-white`}>
                    <span className="text-xs">{evConfig.icon}</span>
                  </span>
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${evConfig.color}`}>{evConfig.label}</span>
                      <span className="text-xs text-neutral-400">
                        {new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700">{event.description}</p>
                    {event.location && (
                      <p className="text-xs text-neutral-500 mt-1">📍 {event.location}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
