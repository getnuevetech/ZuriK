import React from 'react';

const ORDER_STEPS = [
  { status: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { status: 'PAID', label: 'Paid' },
  { status: 'IN_PRODUCTION', label: 'In Production' },
  { status: 'SHIPPED_TO_QA', label: 'Shipped to QA' },
  { status: 'QA_INSPECTION', label: 'QA Inspection' },
  { status: 'APPROVED', label: 'Approved' },
  { status: 'SHIPPED_TO_CUSTOMER', label: 'Shipped' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const STATUS_ORDER = ORDER_STEPS.map((s) => s.status);

interface OrderStatusTimelineProps {
  currentStatus: string;
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
        <span className="text-red-500 text-2xl">✕</span>
        <span className="font-medium text-red-700">
          Order {currentStatus === 'CANCELLED' ? 'Cancelled' : 'Rejected'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start min-w-max gap-0">
        {ORDER_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step.status} className="flex items-start">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                    isCompleted ? 'bg-primary-600 border-primary-600 text-white' : '',
                    isCurrent ? 'bg-white border-primary-600 text-primary-600 ring-4 ring-primary-100' : '',
                    isPending ? 'bg-white border-neutral-300 text-neutral-400' : '',
                  ].join(' ')}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={[
                    'mt-2 text-xs text-center max-w-16 leading-tight',
                    isCurrent ? 'font-semibold text-primary-700' : '',
                    isCompleted ? 'text-primary-600' : '',
                    isPending ? 'text-neutral-400' : '',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>
              {idx < ORDER_STEPS.length - 1 && (
                <div
                  className={[
                    'h-0.5 w-12 mt-4 mx-1 transition-colors',
                    isCompleted ? 'bg-primary-600' : 'bg-neutral-200',
                  ].join(' ')}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
