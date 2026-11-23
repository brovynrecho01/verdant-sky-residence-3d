import { FLOATING_WA_URL } from '../data/tourData';

export function FloatingWhatsApp() {
  return (
    <a
      href={FLOATING_WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tanya Unit Verdant Sky Residence via WhatsApp"
      className="fixed right-4 bottom-5 sm:right-6 sm:bottom-6 z-50 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-xs sm:text-sm font-semibold !text-white shadow-md transition-transform duration-200 hover:scale-[1.03] hover:bg-[#20BD5A] active:scale-[0.98]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4 sm:h-5 sm:w-5 shrink-0"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.46 0 .1 5.36.1 11.95c0 2.1.55 4.16 1.6 5.97L0 24l6.26-1.64a11.9 11.9 0 0 0 5.8 1.48h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.5-8.41ZM12.06 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.22-3.72.98.99-3.62-.24-.37a9.87 9.87 0 0 1-1.52-5.24c0-5.46 4.44-9.9 9.91-9.9 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.44 9.85-9.91 9.85Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
      <span>Tanya Unit via WA</span>
    </a>
  );
}
