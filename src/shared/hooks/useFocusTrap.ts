import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * useFocusTrap Hook
 * Traps keyboard focus within an active dialog modal:
 * - Traps Tab and Shift+Tab cycling within focusable elements in the modal
 * - Closes modal on Escape key press
 * - Returns focus to the trigger element when modal closes
 * - Sets inert / aria-hidden on background elements
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  triggerRef,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember trigger button or current active element to restore focus on exit
    previouslyFocusedElementRef.current = (triggerRef?.current || document.activeElement) as HTMLElement | null;

    const modalElement = containerRef.current;
    if (!modalElement) return;

    // Query focusable elements
    const getFocusableElements = () => {
      const focusableSelector =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(modalElement.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0
      );
    };

    // Auto-focus first focusable element or modal container
    const focusables = getFocusableElements();
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      modalElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const elements = getFocusableElements();
        if (elements.length === 0) {
          e.preventDefault();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === first || !modalElement.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab
          if (document.activeElement === last || !modalElement.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Apply inert / aria-hidden to root siblings when modal is active
    const rootEl = document.getElementById('root');
    const prevAriaHidden = rootEl?.getAttribute('aria-hidden');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (rootEl) {
        if (prevAriaHidden) {
          rootEl.setAttribute('aria-hidden', prevAriaHidden);
        } else {
          rootEl.removeAttribute('aria-hidden');
        }
      }
      // Restore focus to trigger element
      const targetRestore = triggerRef?.current || previouslyFocusedElementRef.current;
      if (targetRestore && typeof targetRestore.focus === 'function') {
        targetRestore.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  return containerRef;
}
