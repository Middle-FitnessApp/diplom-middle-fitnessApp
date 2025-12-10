import React from 'react'

export const TypingIndicator: React.FC = () => (
	<div className='typing-indicator'>
		<div className='typing-dots'>
			<div className='typing-dot typing-dot-1' />
			<div className='typing-dot typing-dot-2' />
			<div className='typing-dot typing-dot-3' />
		</div>
		<span>Печатает...</span>
	</div>
)
