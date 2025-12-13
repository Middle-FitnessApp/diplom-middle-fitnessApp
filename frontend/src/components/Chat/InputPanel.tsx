import React, { useRef, useEffect } from 'react'
import { Form, Input, Button, Tooltip, Upload } from 'antd'
import { SmileOutlined, PictureOutlined, CloseOutlined } from '@ant-design/icons'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import type { InputRef } from 'antd'
import { EmojiPickerComponent } from './EmojiPickerComponent'
import type { ChatUploadFile } from '../../types'
import { useThemeClasses } from '../../hooks/useThemeClasses'

type InputPanelProps = {
	form: ReturnType<typeof Form.useForm>[0]
	inputValue: string
	setInputValue: (val: string) => void
	onInputChange?: (val: string) => void
	fileList: ChatUploadFile[]
	onUploadChange: (info: UploadChangeParam<UploadFile>) => void
	onRemoveImage: () => void
	onPreviewImage: (url: string) => void
	onShowEmojiToggle: () => void
	showEmoji: boolean
	onEmojiSelect: (emoji: string) => void
	onSend: () => void
	disabledSend: boolean
	loading?: boolean
}

export const InputPanel: React.FC<InputPanelProps> = ({
	form,
	inputValue,
	setInputValue,
	onInputChange,
	fileList,
	onUploadChange,
	onRemoveImage,
	onPreviewImage,
	onShowEmojiToggle,
	showEmoji,
	onEmojiSelect,
	onSend,
	disabledSend,
	loading = false,
}) => {
	const classes = useThemeClasses()
	const inputRef = useRef<InputRef>(null)

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}, [inputValue])

	return (
		<>
			<div
				className={`w-full p-5 pb-6 border-t border-solid ${classes.inputBorder} ${classes.inputBg} rounded-bl-3xl rounded-br-3xl relative`}
			>
				<div className='flex items-center gap-3 w-full'>
					<Tooltip title='Прикрепить изображение'>
						<Upload
							showUploadList={false}
							beforeUpload={() => false}
							onChange={onUploadChange}
							accept='image/*'
							multiple={false}
						>
							<Button
								icon={<PictureOutlined />}
								type='text'
								size='large'
								className={`bg-transparent border border-solid ${classes.inputBorder}! rounded-xl w-10 h-10 shadow-none hover:bg-gray-800!`}
							/>
						</Upload>
					</Tooltip>
					<Tooltip>
						<Button
							icon={<SmileOutlined />}
							type='text'
							size='large'
							className={`bg-transparent border border-solid ${classes.inputBorder}! rounded-xl w-10 h-10 shadow-none hover:bg-gray-800!`}
							onClick={onShowEmojiToggle}
						/>
					</Tooltip>

					<Form form={form} onFinish={onSend} className='flex-1 mb-0 min-w-0 '>
						<Form.Item name='text' className='mb-0! w-full'>
							<Input
								ref={inputRef}
								placeholder='Напишите сообщение'
								size='large'
								value={inputValue}
								autoFocus
								onChange={(e) => {
									const value = e.target.value
									if (onInputChange) {
										onInputChange(value)
									} else {
										setInputValue(value)
										form.setFieldsValue({ text: value })
									}
								}}
								className={`rounded-lg ${classes.inputBg} ${classes.inputBorder} ${classes.inputText} text-sm w-full`}
								autoComplete='off'
							/>
						</Form.Item>
					</Form>

					{fileList.length > 0 && (
						<div className='relative flex flex-col justify-center items-center'>
							<img
								src={fileList[0].url}
								alt='preview'
								className={`w-[46px] rounded-md border border-solid ${classes.inputBorder} cursor-pointer`}
								onClick={() => onPreviewImage(fileList[0].url)}
							/>
							<Button
								icon={<CloseOutlined />}
								type='link'
								className={`absolute! -top-2 -right-2 p-0 w-5! h-5! flex justify-center items-center rounded-full border-none shadow-md text-white! bg-red-400! hover:bg-amber-500!`}
								onClick={onRemoveImage}
							/>
						</div>
					)}

					<Button
						type='primary'
						size='large'
						disabled={disabledSend}
						loading={loading}
						className='rounded-xl px-7 font-medium h-[42px] bg-linear-to-r! from-[#569df4] to-[#6a86f1] border-none tracking-wide shrink-0!'
						onClick={() => {
							onSend()
							setTimeout(() => inputRef.current?.focus(), 0)
						}}
					>
						Отправить
					</Button>
				</div>

				{showEmoji && (
					<div className='emoji-picker-container'>
						<EmojiPickerComponent onSelect={onEmojiSelect} onClose={onShowEmojiToggle} />
					</div>
				)}
			</div>
		</>
	)
}
