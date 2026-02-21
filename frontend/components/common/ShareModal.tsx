'use client';

import React from 'react';
import Image from 'next/image';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { copyToClipboard, generateShareLinks, getShareText, nativeShare } from '../../lib/share-utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
  image?: string;
  type?: 'product' | 'fabric' | 'designer';
}

interface ShareOption {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  show?: boolean;
}

export function ShareModal({ isOpen, onClose, url, title, description, image }: ShareModalProps) {
  const { toast } = useToast();
  const links = generateShareLinks(url, title, description, image);

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    toast(success ? 'success' : 'error', success ? 'Link copied!' : 'Failed to copy link');
    onClose();
  };

  const openWindow = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=450');
    onClose();
  };

  const handleNativeShare = async () => {
    await nativeShare({ title, text: getShareText(title, description), url });
    onClose();
  };

  const shareOptions: ShareOption[] = [
    {
      label: 'Share via…',
      show: hasNativeShare,
      onClick: handleNativeShare,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
      ),
    },
    {
      label: 'Copy Link',
      onClick: handleCopy,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      ),
    },
    {
      label: 'WhatsApp',
      onClick: () => openWindow(links.whatsapp),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      ),
    },
    {
      label: 'Twitter / X',
      onClick: () => openWindow(links.twitter),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      ),
    },
    {
      label: 'Facebook',
      onClick: () => openWindow(links.facebook),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
      ),
    },
    {
      label: 'Pinterest',
      show: !!image,
      onClick: () => openWindow(links.pinterest),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
      ),
    },
    {
      label: 'Email',
      onClick: () => { window.location.href = links.email; onClose(); },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      ),
    },
  ];

  const visibleOptions = shareOptions.filter((o) => o.show !== false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share" size="sm">
      {/* Preview */}
      <div className="flex items-center gap-3 mb-5 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
        {image ? (
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200">
            <Image src={image} alt={title} fill className="object-cover" sizes="56px" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center flex-shrink-0 text-2xl">
            🛍️
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-900 text-sm line-clamp-2">{title}</p>
          {description && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{description}</p>}
        </div>
      </div>

      {/* Share options grid */}
      <div className="grid grid-cols-3 gap-2">
        {visibleOptions.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={option.onClick}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-colors text-center"
          >
            <span className="text-neutral-600">{option.icon}</span>
            <span className="text-xs text-neutral-600 font-medium leading-tight">{option.label}</span>
          </button>
        ))}
      </div>

      {/* URL preview */}
      <div className="mt-4 flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 truncate"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors whitespace-nowrap"
        >
          Copy
        </button>
      </div>
    </Modal>
  );
}
