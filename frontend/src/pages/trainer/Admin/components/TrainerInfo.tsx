import React, { useState } from 'react'
import {
	Card,
	Form,
	Input,
	InputNumber,
	Button,
	Avatar,
	message,
	Typography,
	Upload,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { z } from 'zod'
import { createSchemaFieldRule } from 'antd-zod'
import { mockTrainer } from '../mock-data'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
	name: z.string().min(2, 'Минимум 2 символа'),
	age: z.number().min(18, 'Минимальный возраст 18'),
	phone: z.string().min(10, 'Минимум 10 цифр'),
	telegram: z.string().optional(),
})
const rule = createSchemaFieldRule(schema)

const initialTrainerValues = { ...mockTrainer }

export const TrainerInfo: React.FC = () => {
	const [form] = Form.useForm()
	const [editing, setEditing] = useState(false)
	const [trainerInfo, setTrainerInfo] = useState(initialTrainerValues)
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>(trainerInfo.avatarUrl)

	const navigate = useNavigate()

	const handleAvatarChange = (file: File) => {
		const reader = new FileReader()
		reader.onload = (e) => setAvatarUrl(e.target?.result as string)
		reader.readAsDataURL(file)
	}
	const handleLogout = () => navigate('/login')
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			setTrainerInfo({ ...trainerInfo, ...values })
			message.success('Данные сохранены!')
			setEditing(false)
		} catch {
			message.error('Проверьте, что все поля заполнены корректно')
		}
	}

	return (
		<Card
			className='mb-8 shadow-lg border border-muted rounded-xl bg-(--bg-light) '
			styles={{
				body: {
					borderBottom: '1px solid var(--border)',
					background: 'var(--bg-light)',
					borderRadius: '20px 20px 0 0',
				},
			}}
		>
			<div className='flex'>
				<div className='flex flex-col items-center justify-center gap-2 px-1'>
					<Avatar
						src={avatarUrl}
						size={92}
						className='shadow-inner mb-2 border border-muted'
					/>
					{editing && (
						<Upload
							accept='image/*'
							showUploadList={false}
							beforeUpload={(file) => {
								handleAvatarChange(file)
								return false
							}}
						>
							<Button icon={<UploadOutlined />} className='mt-1 rounded-md' size='small'>
								Загрузить фото
							</Button>
						</Upload>
					)}
				</div>
				<div className='ml-8 flex-1'>
					{editing ? (
						<Form
							form={form}
							layout='vertical'
							initialValues={trainerInfo}
							autoComplete='off'
							className='max-w-md'
						>
							<Form.Item label='Имя' name='name' rules={[rule]}>
								<Input className='rounded-md bg-(--bg-light) shadow-sm' />
							</Form.Item>
							<Form.Item label='Возраст' name='age' rules={[rule]}>
								<InputNumber
									className='w-full rounded-md bg-(--bg-light) shadow-sm'
									min={18}
								/>
							</Form.Item>
							<Form.Item label='Телефон' name='phone' rules={[rule]}>
								<Input className='rounded-md bg-(--bg-light) shadow-sm' />
							</Form.Item>
							<Form.Item label='Telegram' name='telegram' rules={[rule]}>
								<Input className='rounded-md bg-(--bg-light) shadow-sm' />
							</Form.Item>
							<Button
								type='primary'
								onClick={handleSubmit}
								className='mt-2 rounded-md px-6'
							>
								Сохранить
							</Button>
							<Button
								type='default'
								onClick={() => setEditing(false)}
								className='mt-2 ml-3 rounded-md px-6'
							>
								Отмена
							</Button>
						</Form>
					) : (
						<div>
							<Typography.Title level={4} className='mb-1 font-bold text-custom'>
								{trainerInfo.name}
							</Typography.Title>
							<div className='text-sm mb-1'>
								<span className='text-muted'>Возраст:</span>{' '}
								<span className='font-medium'>{trainerInfo.age}</span>
							</div>
							<div className='text-sm mb-1'>
								<span className='text-muted'>Телефон:</span>{' '}
								<span className='font-mono'>{trainerInfo.phone}</span>
							</div>
							<div className='text-sm mb-1'>
								<span className='text-muted'>Telegram:</span>{' '}
								<span className='text-info'>{trainerInfo.telegram || '—'}</span>
							</div>
							<Button
								type='link'
								className='mt-2 text-info px-0 hover:underline font-medium'
								onClick={() => setEditing(true)}
							>
								Редактировать
							</Button>
						</div>
					)}
				</div>
				<Button
					danger
					style={{
						background: 'var(--danger)',
						color: 'var(--highlight)',
						border: 'none',
					}}
					onClick={handleLogout}
				>
					Выйти
				</Button>
			</div>
		</Card>
	)
}
