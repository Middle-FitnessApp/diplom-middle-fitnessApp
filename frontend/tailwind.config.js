/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			keyframes: {
				typing: {
					'0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
					'30%': { transform: 'translateY(-10px)', opacity: '1' },
				},
			},
			animation: {
				typing: 'typing 1.4s infinite ease-in-out',
				'typing-delay-200': 'typing 1.4s infinite ease-in-out 0.2s',
				'typing-delay-400': 'typing 1.4s infinite ease-in-out 0.4s',
			},
		},
	},
	plugins: [],
}
