/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          light: '#f0f2f5',
          DEFAULT: '#25d366',
          dark: '#128c7e',
          teal: '#075e54',
          green: '#25d366',
          'green-dark': '#1da851',
          'green-light': '#128c7e',
          gray: '#8696a0',
          'gray-dark': '#3b4a54',
          'gray-light': '#e9edef',
          'bubble-out': '#dcf8c6',
          'bubble-in': '#ffffff',
          bg: '#e5ddd5',
          pattern: 'rgba(0,0,0,0.06)',
        }
      },
      backgroundImage: {
        'whatsapp-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f5f5f5' fill-opacity='0.4'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40l-40 40h40z'/%3E%3C/g%3E%3C/svg%3E\")",
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
