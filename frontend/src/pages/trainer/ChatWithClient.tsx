import { Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { Chat } from '../../components/Chat'
import { useGetClientsQuery } from '../../store/api/trainer.api'

const { Title } = Typography

export const ChatWithClient = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// Загружаем список клиентов тренера и ищем имя по id
	const { data: clients = [] } = useGetClientsQuery()
	const client = clients.find((c) => c.id === id)
	const clientName = client?.name || `Клиент #${id?.slice(-4) || ''}`

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card' style={{ maxWidth: '800px' }}>
				<div className='section-header mb-4 flex items-center gap-4'>
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => navigate('/admin')}
						type='text'
					/>
					<Title level={2} className='section-title !mb-0'>
						💬 {clientName}
					</Title>
				</div>
				<Chat
					role='trainer'
					chatId={`trainer_${id}`}
					partnerName={clientName}
				/>
			</div>
		</div>
	)
}
