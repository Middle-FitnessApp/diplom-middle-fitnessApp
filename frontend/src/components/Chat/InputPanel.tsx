import React from 'react'
import { Form, Input, Button, Tooltip, Upload } from 'antd'
import { SmileOutlined, PictureOutlined, CloseOutlined } from '@ant-design/icons'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { EmojiPickerComponent } from './EmojiPickerComponent'
import type { ChatUploadFile } from '../../types'

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
}) => (
	<>
		<div className='input-panel'>
			<div className='input-panel-content'>
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
							className='input-panel-upload-btn'
						/>
					</Upload>
				</Tooltip>
				<Tooltip>
					<Button
						icon={<SmileOutlined />}
						type='text'
						size='large'
						className='input-panel-emoji-btn'
						onClick={onShowEmojiToggle}
					/>
				</Tooltip>

				<Form form={form} onFinish={onSend} className='input-panel-form'>
					<Form.Item name='text' className='input-panel-item'>
						<Input
							placeholder='Напишите сообщение'
							size='large'
							value={inputValue}
							onChange={(e) => {
								const value = e.target.value
								if (onInputChange) {
									onInputChange(value)
								} else {
									setInputValue(value)
									form.setFieldsValue({ text: value })
								}
							}}
							className='input-panel-input'
							autoComplete='off'
						/>
					</Form.Item>
				</Form>

				{fileList.length > 0 && (
					<div className='input-panel-image-preview'>
						<img
							src={fileList[0].url}
							alt='preview'
							className='input-panel-image-thumb'
							onClick={() => onPreviewImage(fileList[0].url)}
						/>
						<Button
							icon={<CloseOutlined />}
							type='text'
							className='input-panel-image-remove'
							onClick={onRemoveImage}
						/>
					</div>
				)}

				<Button
					type='primary'
					size='large'
					disabled={disabledSend}
					loading={loading}
					className='input-panel-send-btn'
					onClick={onSend}
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
