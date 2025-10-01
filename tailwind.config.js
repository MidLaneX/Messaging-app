/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        theme: {
          primary: '#047857',
          'primary-dark': '#065f46',
          'primary-light': '#059669',
          secondary: '#10b981',
          'secondary-light': '#34d399',
          accent: '#6ee7b7',
          bg: '#ecfdf5',
          'bg-light': '#f0fdf4',
          'bg-secondary': '#d1fae5',
          'text-primary': '#064e3b',
          'text-secondary': '#047857',
          'text-light': '#6b7280',
          'bubble-out': '#a7f3d0',
          'bubble-in': '#ffffff',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          gray: '#6b7280',
          'gray-dark': '#374151',
          'gray-light': '#f3f4f6',
        }
      },
      backgroundImage: {
        'emerald-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ecfdf5' fill-opacity='0.6'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40l-40 40h40z'/%3E%3C/g%3E%3C/svg%3E\")",
        'emerald-gradient': 'linear-gradient(135deg, #047857 0%, #059669 100%)',
        'emerald-radial': 'radial-gradient(circle, #10b981 0%, #047857 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.3s ease-out',
        'typing': 'typing 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'scale(1)', opacity: '1' },
          '30%': { transform: 'scale(1.2)', opacity: '0.7' },
        },
      },
      fontFamily: {
        'sans': ['Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
