/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './App.{js,jsx,ts,tsx}',
        './index.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                'seekher-bg': '#0A0A0F',
                'seekher-card': '#13131A',
                'seekher-purple': '#9945FF',
                'seekher-green': '#14F195',
                'seekher-red': '#FF4560',
                'seekher-border': '#1E1E2E',
            },
            fontFamily: {
                'sans': ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
