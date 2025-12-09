import { Card, Divider, Tag, Button, Typography } from 'antd'
import {
	UserOutlined,
	PhoneOutlined,
	CalendarOutlined,
	PlusOutlined,
} from '@ant-design/icons'
import type { ClientUser } from '../../store/types/auth.types'

const { Title, Text } = Typography

interface ClientInfoProps {
	client: ClientUser
	onAddNutrition: () => void
}

export const ClientInfo = ({ client, onAddNutrition }: ClientInfoProps) => {
	return (
		<Card className='h-full card-hover'>
			<div className='space-y-4'>
				<div className='mb-8'>
					<Title level={4} className='m-0 mb-4'>
						Основная информация
					</Title>
				</div>

				<div className='space-y-3'>
					<div className='flex items-center gap-3 mb-6'>
						<UserOutlined className='text-lg text-primary' />
						<div>
							<Text type='secondary' className='block text-xs'>
								Имя и Фамилия
							</Text>
							<Text className='font-medium'>{client.name}</Text>
						</div>
					</div>

					<div className='flex items-center gap-3 mb-6'>
						{client.phone ? (
							<>
								<PhoneOutlined className='text-lg text-primary' />
								<div>
									<Text type='secondary' className='block text-xs'>
										Телефон
									</Text>
									<Text className='font-medium'>{client.phone}</Text>
								</div>
							</>
						) : (
							<>
								<UserOutlined className='text-lg text-primary' />
								<div>
									<Text type='secondary' className='block text-xs'>
										Email
									</Text>
									<Text className='font-medium'>{client.email}</Text>
								</div>
							</>
						)}
					</div>

					<div className='flex items-center gap-3 mb-6'>
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

					<div className='mb-6'>
						<Text type='secondary' className='block text-xs mb-1'>
							Опыт тренировок
						</Text>
						<Tag color='blue'>
							{client.experience === 'gym_more_year'
								? 'В зале от 1 года'
								: client.experience ?? '—'}
						</Tag>
					</div>

					<div className='mb-6'>
						<Text type='secondary' className='block text-xs mb-1'>
							Желаемый результат
						</Text>
						<Tag color='green'>
							{client.goal === 'weight_loss' ? 'Похудение' : client.goal ?? '—'}
						</Tag>
					</div>

					<div className='mb-6'>
						<Text type='secondary' className='block text-xs mb-2'>
							Противопоказания
						</Text>
						<Text className='text-sm'>{client.restrictions ?? '—'}</Text>
					</div>

					<div>
						<Text type='secondary' className='block text-xs mb-2'>
							Текущий рацион питания
						</Text>
						<Text className='text-sm'>{client.diet ?? '—'}</Text>
					</div>
				</div>

				<div className='mt-auto pt-4'>
					<Divider className='mb-4' />

					<Button
						type='primary'
						block
						icon={<PlusOutlined />}
						onClick={onAddNutrition}
						className='!rounded-lg'
					>
						Добавить план питания
					</Button>
				</div>
			</div>
		</Card>
	)
}

export default ClientInfo
