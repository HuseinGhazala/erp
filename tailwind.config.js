/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
      },
      animation: {
        'in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'soft': '0 4px 24px -4px rgb(0 0 0 / 0.06)',
        'card': '0 8px 32px -8px rgb(0 0 0 / 0.08)',
        'glow': '0 0 20px -5px rgb(79 70 229 / 0.4)',
        'glow-lg': '0 0 32px -8px rgb(79 70 229 / 0.5)',
      },
      backgroundImage: {
        'gradient-border': 'linear-gradient(90deg, #4f46e5, #06b6d4, #10b981, #4f46e5)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        trackify: {
          primary: '#4f46e5',
          'primary-content': '#ffffff',
          secondary: '#64748b',
          accent: '#06b6d4',
          neutral: '#1e293b',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#f1f5f9',
          info: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        'trackify-dark': {
          primary: '#6366f1',
          'primary-content': '#ffffff',
          secondary: '#64748b',
          accent: '#22d3ee',
          neutral: '#334155',
          'base-100': '#1e293b',
          'base-200': '#0f172a',
          'base-300': '#334155',
          info: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
  },
}
