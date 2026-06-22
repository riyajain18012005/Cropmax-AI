import React, { useEffect, useRef } from 'react';

/**
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - Trigger state to show/hide the modal.
 * @property {() => void} onClose - Action callback triggered to close the modal.
 * @property {string} [title] - Title header content for the modal container.
 * @property {React.ReactNode} children - Content body to render inside the modal.
 */

/**
 * Accessible Modal component that locks scrolling, traps focus, and supports closing via Escape or backdrop click.
 * @param {ModalProps} props
 * @returns {React.JSX.Element | null}
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleFocusTrap = (e) => {
      if (!modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleFocusTrap);

    const previousFocus = document.activeElement;

    // Direct initial focus
    if (modalRef.current) {
      const focusable = modalRef.current.querySelector('button, input');
      if (focusable) {
        focusable.focus();
      } else {
        modalRef.current.focus();
      }
    }

    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleFocusTrap);
      if (previousFocus && previousFocus.focus) {
        previousFocus.focus();
      }
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Dialog box wrapper */}
      <div
        ref={modalRef}
        tabIndex="-1"
        className="relative w-full max-w-lg transform overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-2xl transition-all duration-300 animate-scale-up focus:outline-none"
      >
        {/* Header container */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {title || 'Crop Analysis Details'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors duration-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal content body */}
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          {children}
        </div>
      </div>
    </div>
  );
}
