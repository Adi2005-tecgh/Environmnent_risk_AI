/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'gov-blue': '#1a365d',
                'gov-gold': '#c0a080',
            }
        },
    },
    plugins: [],
}
