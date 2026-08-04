import type { Config } from "tailwindcss";

// Design tokens derived from the client's approved Stitch design system
// (serif wordmark, black/cream editorial palette, arch/aperture motif)
// adapted for a photography studio: charcoal + cream + aged-brass accent.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C1B19", // charcoal - primary text / CTAs
        paper: "#F7F4EE", // cream - primary background
        stone: "#EDE8DF", // secondary surface / cards
        line: "#DDD5C7", // hairline borders
        muted: "#8A8377", // secondary text
        brass: "#A6803D", // single accent - aged camera brass
        brassDark: "#8A6A30",
        success: "#3F6B4F",
        successBg: "#E7EEE7",
        danger: "#A3402F",
        dangerBg: "#F5E6E1",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: {
        wordmark: "0.22em",
        eyebrow: "0.16em",
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "3px",
      },
      maxWidth: {
        content: "1180px",
      },
      keyframes: {
        reveal: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        reveal: "reveal 0.7s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
export default config;
