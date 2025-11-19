import { useState } from 'react'
import { Form, Input, Button, Avatar, Upload, message, Card, Typography } from 'antd'
import {
	UserOutlined,
	UploadOutlined,
	EditOutlined,
	LogoutOutlined,
	SaveOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { UploadProps } from 'antd'
import { ACCOUNT_FIELDS } from '../../constants/accountFields'

const { Title, Text } = Typography

interface UserData {
	name: string
	surname: string
	login: string
	avatar?: string
}

const initialUser: UserData = {
	name: 'Иван',
	surname: 'Иванов',
	login: 'ivan@example.com',
	avatar: undefined,
}

export const PersonalAccount = () => {
	const navigate = useNavigate()
	const [form] = Form.useForm()
	const [isEditing, setIsEditing] = useState(false)
	const [user, setUser] = useState(initialUser)
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleLogout = () => navigate('/login')

	const onFinish = (values: UserData) => {
		if (values.name.toLowerCase() === 'error') {
			setErrors({ name: 'Ошибка при сохранении имени' })
			message.error('Ошибка при сохранении данных')
			return
		}

		setUser({ ...user, ...values })
		setIsEditing(false)
		setErrors({})
		message.success('Данные сохранены')
	}

	const uploadProps: UploadProps = {
		showUploadList: false,
		beforeUpload: (file) => {
			const isImage = ['image/jpeg', 'image/png'].includes(file.type)
			if (!isImage) {
				message.error('Можно загружать только JPG/PNG!')
				return Upload.LIST_IGNORE
			}

			if (file.size / 1024 / 1024 >= 2) {
				message.error('Изображение должно быть меньше 2MB!')
				return Upload.LIST_IGNORE
			}

			const reader = new FileReader()
			reader.onload = () => setAvatarUrl(reader.result as string)
			reader.readAsDataURL(file)

			message.success('Аватар обновлен')
			return false
		},
	}

	return (
		<div className='flex justify-center items-center min-h-[calc(100vh-64px)] background-light p-4'>
			<Card
				className='w-full max-w-4xl shadow-lg'
				actions={[
					<Button
						type='text'
						icon={<LogoutOutlined />}
						onClick={handleLogout}
						danger
						key='logout'
					>
						Выйти
					</Button>,
				]}
			>
				<div className='flex flex-col items-center mb-8'>
					<Upload {...uploadProps}>
						<div className='cursor-pointer relative group mb-6'>
							<Avatar
								size={120}
								src={avatarUrl}
								icon={<UserOutlined />}
								className='bg-blue-500'
							/>
							<div className='absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
								<UploadOutlined className='text-white text-xl' />
							</div>
						</div>
					</Upload>

					<Title level={4} className='mt-4 mb-0'>
						{user.name} {user.surname}
					</Title>
					<Text type='secondary'>{user.login}</Text>
				</div>

				<Form
					form={form}
					layout='vertical'
					initialValues={user}
					onFinish={onFinish}
					requiredMark={false}
				>
					<Form.Item
						label='Имя'
						name='name'
						rules={[{ required: true, message: 'Введите имя' }]}
					>
						<Input disabled={!isEditing} />
					</Form.Item>
					{errors.name && (
						<div className='ant-form-item-explain-error text-sm mb-4'>{errors.name}</div>
					)}

					<Form.Item
						label='Фамилия'
						name='surname'
						rules={[{ required: true, message: 'Введите фамилию' }]}
					>
						<Input disabled={!isEditing} />
					</Form.Item>

					<Form.Item
						label={ACCOUNT_FIELDS.login}
						name='login'
						rules={[
							{ required: true, message: 'Введите email или телефон' },
							{
								pattern: /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?[\d\s-]{10,})$/,
								message: 'Введите корректный email или телефон',
								warningOnly: true,
							},
						]}
					>
						<Input disabled={!isEditing} />
					</Form.Item>

					<Button
						type='primary'
						icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
						className='mt-6'
						block
						onClick={() => {
							if (isEditing) form.submit()
							else setIsEditing(true)
						}}
					>
						{isEditing ? 'Сохранить' : 'Редактировать'}
					</Button>
				</Form>
			</Card>
		</div>
	)
}

export default PersonalAccount
