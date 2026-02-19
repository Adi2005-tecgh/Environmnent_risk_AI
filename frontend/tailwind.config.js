/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'gov-blue': '#1e3a8a',
                'gov-gold': '#fbbf24',
                'slate-850': '#1e293b',
                'slate-950': '#0f172a',
            }
        },
    },
    plugins: [],
}
