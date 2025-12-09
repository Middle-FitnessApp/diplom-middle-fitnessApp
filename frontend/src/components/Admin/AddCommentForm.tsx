import { Form, Input, Button, Typography } from 'antd'
import { useState } from 'react'

const { Text } = Typography

interface AddCommentFormProps {
	onSubmit: (text: string) => Promise<void>
	isLoading?: boolean
	disabled?: boolean
}

export const AddCommentForm = ({
	onSubmit,
	isLoading = false,
	disabled = false,
}: AddCommentFormProps) => {
	const [text, setText] = useState('')

	const handleSubmit = async () => {
		if (!text.trim()) return

		try {
			await onSubmit(text)
			setText('')
		} catch (error) {
			console.error('Error:', error)
		}
	}

	const isSubmitDisabled = !text.trim() || isLoading || disabled

	return (
		<div className='mb-6 pb-6 border-b'>
			<Form layout='vertical'>
				<Form.Item label='Добавить комментарий' className='mb-0'>
					<Input.TextArea
						rows={3}
						placeholder='Введите ваш комментарий...'
						value={text}
						onChange={(e) => setText(e.target.value)}
						maxLength={500}
						disabled={isLoading || disabled}
					/>
				</Form.Item>

				<div className='flex justify-between items-center mt-3'>
					<Text type='secondary' className='text-xs'>
						{text.length}/500
					</Text>

					<Button type='primary' onClick={handleSubmit} disabled={isSubmitDisabled}>
						{isLoading ? 'Добавление...' : 'Добавить комментарий'}
					</Button>
				</div>
			</Form>
		</div>
	)
}
