import React from 'react'
import { theme } from 'antd'
import { useThemeClasses } from '../../hooks/useThemeClasses'

export const TypingIndicator: React.FC = () => {
	const classes = useThemeClasses()
	const { token: themeToken } = theme.useToken()

	return (
		<div className='flex items-center p-2 text-xs italic rounded-xl w-fit font-bold'>
			<div className='flex gap-1 mr-2'>
				<div
					className={`w-2 h-2 rounded-full ${
						classes.isDark ? 'bg-slate-300' : 'bg-black/90'
					}`}
					style={{ animation: 'typing 1.4s infinite ease-in-out' }}
				/>
				<div
					className={`w-2 h-2 rounded-full ${
						classes.isDark ? 'bg-slate-300' : 'bg-black/90'
					}`}
					style={{ animation: 'typing 1.4s infinite ease-in-out 0.2s' }}
				/>
				<div
					className={`w-2 h-2 rounded-full ${
						classes.isDark ? 'bg-slate-300' : 'bg-black/90'
					}`}
					style={{ animation: 'typing 1.4s infinite ease-in-out 0.4s' }}
				/>
			</div>
			<span style={{ color: themeToken.colorText }}>Печатает...</span>
		</div>
	)
}
