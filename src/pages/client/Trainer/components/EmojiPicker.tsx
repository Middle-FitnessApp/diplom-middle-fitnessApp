import React from 'react'
import { Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

const emojiList = ['😀', '😄', '😎', '😊', '🥳', '👍', '🔥', '💪', '👀']

type EmojiPickerProps = {
	onSelect: (emoji: string) => void
	onClose: () => void
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => (
	<div
		style={{
			position: 'absolute',
			bottom: 55,
			left: 5,
			background: '#f4fbff',
			borderRadius: 12,
			border: '1.5px solid #dbe4ee',
			boxShadow: '0 2px 10px 0 rgba(150,170,190,0.13)',
			zIndex: 25,
			padding: '10px 12px',
			display: 'flex',
			gap: 4,
		}}
	>
		{emojiList.map((emoji) => (
			<Button
				key={emoji}
				type='text'
				style={{ fontSize: '22px', background: 'transparent', padding: 2 }}
				onClick={() => onSelect(emoji)}
			>
				{emoji}
			</Button>
		))}
		<Button
			icon={<CloseOutlined />}
			type='text'
			style={{ fontSize: '18px', color: '#888', marginLeft: '8px' }}
			onClick={onClose}
		/>
	</div>
)
