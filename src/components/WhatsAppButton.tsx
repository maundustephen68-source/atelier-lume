"use client";

const WHATSAPP_NUMBER = "254716817495"; // <-- put your real number here, digits only
const DEFAULT_MESSAGE = "Hi! I'd like to enquire about a photography session.";

export function WhatsAppButton() {
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
      <a href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-105 focus-ring"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.702 4.607 1.912 6.472L4 29l7.72-1.876A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm6.412 16.845c-.271.766-1.343 1.4-2.2 1.583-.586.126-1.351.226-3.927-.843-3.293-1.364-5.417-4.706-5.583-4.925-.16-.219-1.34-1.783-1.34-3.402 0-1.618.842-2.414 1.14-2.744.271-.301.6-.376.8-.376.2 0 .4.002.575.011.184.008.432-.07.676.516.271.653.921 2.253.999 2.417.08.164.132.356.024.575-.106.219-.16.356-.32.548-.16.192-.336.43-.48.578-.16.164-.328.34-.14.667.184.328.82 1.354 1.762 2.192 1.211 1.081 2.234 1.417 2.562 1.578.328.16.52.137.712-.082.192-.219.82-.955 1.04-1.283.219-.328.44-.273.74-.164.3.109 1.905.899 2.232 1.062.328.164.547.246.629.383.08.137.08.792-.191 1.559Z" />
      </svg>
    </a>
  );
}