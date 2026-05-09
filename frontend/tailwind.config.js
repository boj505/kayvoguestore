module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    // Add other paths if needed
  ],
  theme: {
    extend: {
      colors: {
        main:[ '#000'], // Example primary color
        secondary: '#f59e0b', // Example secondary color
        accent: '#ec4899', // Example accent color

      },
      fontFamily: {
        cormorant: ['Cormorant Garamond', 'serif'],
        clash_display: ['Clash Display', 'sans-serif'],
       

      },
     
      
     
    },
  },
}