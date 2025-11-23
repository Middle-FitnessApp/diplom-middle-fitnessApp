import { Card, Divider, Tag, Button, Typography } from 'antd'
import {
	UserOutlined,
	PhoneOutlined,
	CalendarOutlined,
	PlusOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

interface ClientData {
	id: string
	name: string
	phone: string
	birthDate?: string
	experience?: string
	goal?: string
	medicalInfo?: string
	diet?: string
	age?: number
}

interface ClientInfoProps {
	client: ClientData
	onAddNutrition: () => void
}

export const ClientInfo = ({ client, onAddNutrition }: ClientInfoProps) => {
	return (
		<Card className='h-full'>
			<div className='space-y-4'>
				<div>
					<Title level={4} className='m-0 mb-4'>
						Основная информация
					</Title>
				</div>

				<div className='space-y-3'>
					<div className='flex items-center gap-3'>
						<UserOutlined className='text-lg text-primary' />
						<div>
							<Text type='secondary' className='block text-xs'>
								Имя
							</Text>
							<Text className='font-medium'>{client.name}</Text>
						</div>
					</div>

					<Divider className='my-2' />

					<div className='flex items-center gap-3'>
						<PhoneOutlined className='text-lg text-primary' />
						<div>
							<Text type='secondary' className='block text-xs'>
								Телефон
							</Text>
							<Text className='font-medium'>{client.phone}</Text>
						</div>
					</div>

					<Divider className='my-2' />

					<div className='flex items-center gap-3'>
						<CalendarOutlined className='text-lg text-primary' />
						<div>
							<Text type='secondary' className='block text-xs'>
								Возраст
							</Text>
							<Text className='font-medium'>
								{client.age ?? '-'} {client.age ? 'лет' : ''}
							</Text>
						</div>
					</div>

					<Divider className='my-2' />

					<div>
						<Text type='secondary' className='block text-xs mb-1'>
							Опыт тренировок
						</Text>
						<Tag color='blue'>
							{client.experience === 'gym_more_year'
								? 'В зале от 1 года'
								: client.experience ?? '—'}
						</Tag>
					</div>

					<Divider className='my-2' />

					<div>
						<Text type='secondary' className='block text-xs mb-1'>
							Желаемый результат
						</Text>
						<Tag color='green'>
							{client.goal === 'weight_loss' ? 'Похудение' : client.goal ?? '—'}
						</Tag>
					</div>

					<Divider className='my-2' />

					<div>
						<Text type='secondary' className='block text-xs mb-2'>
							Противопоказания
						</Text>
						<Text className='text-sm'>{client.medicalInfo ?? '—'}</Text>
					</div>

					<Divider className='my-2' />

					<div>
						<Text type='secondary' className='block text-xs mb-2'>
							Текущий рацион питания
						</Text>
						<Text className='text-sm'>{client.diet ?? '—'}</Text>
					</div>
				</div>

				<Divider />

				<Button type='primary' block icon={<PlusOutlined />} onClick={onAddNutrition}>
					Добавить план питания
				</Button>
			</div>
		</Card>
	)
}

export default ClientInfo
