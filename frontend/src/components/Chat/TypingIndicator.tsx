import React from 'react'
import { useThemeClasses } from '../../store/hooks'

export const TypingIndicator: React.FC = () => {
	const classes = useThemeClasses()

	return (
		<div className='flex items-center p-2 text-xs italic rounded-xl w-fit font-bold'>
			<div className='flex gap-1 mr-2'>
				<div className={`w-2 h-2 rounded-full ${classes.isDark ? 'bg-slate-300' : 'bg-black/90'}`} style={{ animation: 'typing 1.4s infinite ease-in-out' }} />
				<div className={`w-2 h-2 rounded-full ${classes.isDark ? 'bg-slate-300' : 'bg-black/90'}`} style={{ animation: 'typing 1.4s infinite ease-in-out 0.2s' }} />
				<div className={`w-2 h-2 rounded-full ${classes.isDark ? 'bg-slate-300' : 'bg-black/90'}`} style={{ animation: 'typing 1.4s infinite ease-in-out 0.4s' }} />
			</div>
			<span>Печатает...</span>
		</div>
	)
}
