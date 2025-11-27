/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2D9CDB', // Primary blue - for headers, navigation, main structure
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
        secondary: {
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          500: '#00BCD4', // Teal - Secondary accent for CTAs
          600: '#00ACC1',
          700: '#0097A7',
          800: '#00838F',
          900: '#006064',
        },
        accent: {
          50: '#FFF3E0',
          100: '#FFE0B2',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FFA726',
          500: '#FF9800', // Citrus Orange - Alternative accent for high-priority CTAs
          600: '#FB8C00',
          700: '#F57C00',
          800: '#EF6C00',
          900: '#E65100',
        },
        status: {
          closed: '#10B981', // Green for Closed
          urgent: '#EF4444', // Red for Urgent
          open: '#3B82F6', // Blue for Open
          inProgress: '#F59E0B', // Amber for In Progress
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 2px 8px -1px rgba(0, 0, 0, 0.06)',
        'strong': '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
