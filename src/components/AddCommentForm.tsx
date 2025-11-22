import { Form, Input, Button, Typography } from 'antd'

const { Text } = Typography

interface AddCommentFormProps {
	value: string
	onChange: (value: string) => void
	onSubmit: () => void
}

export const AddCommentForm = ({ value, onChange, onSubmit }: AddCommentFormProps) => {
	return (
		<div className='mb-6 pb-6 border-b'>
			<Form layout='vertical'>
				<Form.Item label='Добавить комментарий' className='mb-0'>
					<Input.TextArea
						rows={3}
						placeholder='Введите ваш комментарий...'
						value={value}
						onChange={(e) => onChange(e.target.value)}
						maxLength={500}
					/>
				</Form.Item>

				<div className='flex justify-between items-center mt-3'>
					<Text type='secondary' className='text-xs'>
						{value.length}/500
					</Text>

					<Button type='primary' onClick={onSubmit} disabled={!value.trim()}>
						Добавить комментарий
					</Button>
				</div>
			</Form>
		</div>
	)
}
