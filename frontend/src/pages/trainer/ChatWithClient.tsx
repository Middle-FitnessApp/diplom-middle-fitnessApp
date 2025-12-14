import { Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { Chat } from '../../components/Chat'
import { useGetClientsQuery } from '../../store/api/trainer.api'
import { useThemeClasses } from '../../hooks/useThemeClasses'

const { Title } = Typography

export const ChatWithClient = () => {
	const classes = useThemeClasses()
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// Загружаем список клиентов тренера и ищем имя по id
	const { data: clients = [] } = useGetClientsQuery()
	const client = clients.find((c) => c.id === id)
	const clientName = client?.name || `Клиент #${id?.slice(-4) || ''}`

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div
				className={`${classes.cardBg} rounded-2xl p-10 shadow-xl border ${classes.border} w-full max-w-[800px]`}
			>
				<div className='mb-4 flex items-center gap-4'>
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => navigate('/admin')}
						type='text'
					/>
					<Title
						level={2}
						className={`${classes.title} font-semibold mb-0 pb-3 border-b-3 border-primary inline-block`}
					>
						💬 {clientName}
					</Title>
				</div>
				<Chat role='trainer' partnerId={id} partnerName={clientName} />
			</div>
		</div>
	)
}
