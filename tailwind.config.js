module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'hot-pink': '#e494c3',
        'yellow': '#f3a924',
        
        // Extended brand palette
        'primary': {
          50: '#fdf4f9',
          100: '#fbe8f3',
          200: '#f8d1e7',
          300: '#f3afd6',
          400: '#ea82bd',
          500: '#e494c3', // Brand pink
          600: '#d467a0',
          700: '#b94e7f',
          800: '#984168',
          900: '#7d3958',
        },
        'accent': {
          light: '#ffb3af',
          DEFAULT: '#ff8a80', // Coral accent
          dark: '#ff5449',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        'heading': ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(228, 148, 195, 0.15)',
        'soft-lg': '0 4px 16px rgba(228, 148, 195, 0.2)',
      },
    },
  },
  plugins: [],
}