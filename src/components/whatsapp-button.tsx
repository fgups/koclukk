const WHATSAPP_NUMBER = "905540049028";
const WHATSAPP_MESSAGE = "Merhaba, Albatros Koçluk hakkında bilgi almak istiyorum.";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-3 text-white shadow-lg shadow-emerald-900/20 transition-all hover:pr-4 hover:shadow-xl"
      aria-label="WhatsApp'tan sor"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0 fill-white">
        <path d="M16.001 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.37 1.63 6.2L3.2 28.8l6.77-1.6a12.74 12.74 0 0 0 6.03 1.53c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.73-12.8-12.73zm0 23.34a10.5 10.5 0 0 1-5.36-1.47l-.38-.23-3.99.95.95-3.9-.25-.4a10.46 10.46 0 0 1-1.61-5.6c0-5.8 4.72-10.53 10.53-10.53s10.53 4.72 10.53 10.53c.01 5.81-4.71 10.53-10.42 10.65zm5.75-7.86c-.31-.16-1.86-.92-2.15-1.02-.29-.11-.5-.16-.71.16s-.81 1.02-1 1.23c-.18.21-.37.23-.68.08-.31-.16-1.32-.49-2.51-1.55-.93-.83-1.56-1.86-1.74-2.17-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55h-.6c-.21 0-.55.08-.84.39s-1.1 1.08-1.1 2.63 1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.52 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.86-.76 2.12-1.5.26-.74.26-1.37.18-1.5-.08-.14-.29-.21-.6-.36z" />
      </svg>
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all group-hover:max-w-xs sm:inline-block">
        Aklına takılanı sor
      </span>
    </a>
  );
}
