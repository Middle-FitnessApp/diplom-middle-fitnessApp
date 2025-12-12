import React from 'react'
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react'
import { useThemeClasses } from '../../store/hooks'

type EmojiPickerProps = {
	onSelect: (emoji: string) => void
	onClose: () => void
}

export const EmojiPickerComponent: React.FC<EmojiPickerProps> = ({
	onSelect,
	onClose,
}) => {
	const classes = useThemeClasses()

	const onEmojiClick = (emojiData: EmojiClickData) => {
		onSelect(emojiData.emoji)
	}

	return (
		<div
			className={`relative flex flex-col overflow-hidden rounded-lg ${classes.modalBg} ${classes.border} shadow-lg`}
		>
			<EmojiPicker
				onEmojiClick={onEmojiClick}
				theme={classes.isDark ? Theme.DARK : Theme.LIGHT}
				className={`rounded-b-none!`}
				previewConfig={{
					showPreview: false,
				}}
			/>
			<div className={`border-t p-2 ${classes.border} flex justify-center`}>
				<button
					type='button'
					onClick={onClose}
					className={`w-full p-2 text-sm cursor-pointer transition-all duration-200 rounded-md border ${classes.modalBg} ${classes.textLight} ${classes.hoverBg} ${classes.border}! font-medium`}
					aria-label='Закрыть'
				>
					Закрыть
				</button>
			</div>
		</div>
	)
}
