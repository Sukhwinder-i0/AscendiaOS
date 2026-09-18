/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC', // Slate 50
        surface: '#FFFFFF',    // Pure White
        border: '#E2E8F0',     // Slate 200
        primary: {
          DEFAULT: '#0F172A',  // Slate 900
          text: '#0F172A',
        },
        secondary: {
          DEFAULT: '#64748B',  // Slate 500
          text: '#64748B',
        },
        accent: {
          DEFAULT: '#3B82F6',  // Blue 500
          hover: '#2563EB',    // Blue 600
          light: '#EFF6FF',    // Blue 50
        },
        success: '#22C55E',    // Green 500
        warning: '#F59E0B',    // Amber 500
        error: '#EF4444',      // Red 500
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        elevation: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

