/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mac: {
          bg: "#1e1e1e",
          dock: "rgba(30, 30, 30, 0.7)",
          window: "rgba(255, 255, 255, 0.8)",
          active: "#007aff",
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
