import { Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { Chat } from '../../components/Chat'

const { Title } = Typography

export const ChatWithClient = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// В будущем здесь будет запрос на получение имени клиента по ID
	// const { data: client } = useGetClientQuery(id)
	const clientName = `Клиент #${id?.slice(-4) || ''}` // Временное имя

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
