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
		<div className='emoji-picker-wrapper'>
			<EmojiPicker
				onEmojiClick={onEmojiClick}
				previewConfig={{
					showPreview: false,
				}}
			/>
			<div className='emoji-picker-footer'>
				<button
					type='button'
					onClick={onClose}
					className='emoji-picker-close-btn'
					aria-label='Закрыть'
				>
					Закрыть
				</button>
			</div>
		</div>
	)
}
