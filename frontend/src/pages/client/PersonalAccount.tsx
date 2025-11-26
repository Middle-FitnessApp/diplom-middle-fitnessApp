import { useState } from 'react'
import { Form, Input, Button, message, Card, Typography } from 'antd'
import { EditOutlined, LogoutOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ACCOUNT_FIELDS } from '../../constants/accountFields'
import { AvatarUploader } from '../../components/AvatarUploader'

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

		setUser({ ...user, ...values, avatar: avatarUrl })
		setIsEditing(false)
		setErrors({})
		message.success('Данные сохранены')
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card' style={{ maxWidth: '600px' }}>
				<Card
					className='!border !border-gray-200'
					actions={[
						<Button
							type='text'
							icon={<LogoutOutlined />}
							onClick={handleLogout}
							danger
							key='logout'
							size='large'
						>
							Выйти
						</Button>,
					]}
				>
					<div className='text-center mb-8'>
						<AvatarUploader size={120} initialUrl={avatarUrl} onChange={setAvatarUrl} />

						<Title level={3} className='!mt-4 !mb-1 !text-gray-800'>
							{user.name} {user.surname}
						</Title>
						<Text type='secondary' className='text-lg'>
							{user.login}
						</Text>
					</div>

					<Form
						form={form}
						layout='vertical'
						initialValues={user}
						onFinish={onFinish}
						requiredMark={false}
						size='large'
					>
						<Form.Item
							label='Имя'
							name='name'
							rules={[{ required: true, message: 'Введите имя' }]}
						>
							<Input disabled={!isEditing} className='rounded-lg' />
						</Form.Item>

						{errors.name && (
							<div className='ant-form-item-explain-error text-sm mb-4'>
								{errors.name}
							</div>
						)}

						<Form.Item
							label='Фамилия'
							name='surname'
							rules={[{ required: true, message: 'Введите фамилию' }]}
						>
							<Input disabled={!isEditing} className='rounded-lg' />
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
							<Input disabled={!isEditing} className='rounded-lg' />
						</Form.Item>

						<Button
							type='primary'
							icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
							className='!h-12 !rounded-lg !text-base !font-semibold'
							block
							onClick={() => {
								if (isEditing) form.submit()
								else setIsEditing(true)
							}}
						>
							{isEditing ? 'Сохранить изменения' : 'Редактировать профиль'}
						</Button>
					</Form>
				</Card>
			</div>
		</div>
	)
}

export default PersonalAccount
