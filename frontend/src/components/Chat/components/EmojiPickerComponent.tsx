import React from 'react'
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react'

type EmojiPickerProps = {
	onSelect: (emoji: string) => void
	onClose: () => void
}

export const EmojiPickerComponent: React.FC<EmojiPickerProps> = ({
	onSelect,
	onClose,
}) => {
	const onEmojiClick = (emojiData: EmojiClickData) => {
		onSelect(emojiData.emoji)
	}

	return (
		<div style={{ position: 'relative' }}>
			<EmojiPicker onEmojiClick={onEmojiClick} />
			<button
				type='button'
				onClick={onClose}
				style={{
					position: 'absolute',
					top: 5,
					right: 5,
					background: 'transparent',
					border: 'none',
					fontSize: 18,
					cursor: 'pointer',
				}}
				aria-label='Закрыть'
			>
				✕
			</button>
		</div>
	)
}
