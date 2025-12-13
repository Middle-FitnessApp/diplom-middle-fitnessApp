/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: 'var(--primary)',
				'primary-hover': 'var(--primary-hover)',
				'primary-light': 'var(--primary-light)',
				secondary: 'var(--secondary)',
				'secondary-hover': 'var(--secondary-hover)',
				accent: 'var(--accent)',
				'accent-hover': 'var(--accent-hover)',
				info: 'var(--info)',
				success: 'var(--success)',
				warning: 'var(--warning)',
				danger: 'var(--danger)',
				border: 'var(--border)',
				'border-muted': 'var(--border-muted)',
				text: 'var(--text)',
				'text-muted': 'var(--text-muted)',
				highlight: 'var(--highlight)',
				bg: 'var(--bg)',
				'bg-light': 'var(--bg-light)',
				'bg-dark': 'var(--bg-dark)',
			},
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
