import { Typography } from 'antd'
import { Chat } from '../../components/Chat'

const { Title } = Typography

export const Trainer = () => {
	return (
		<div className='page-container gradient-bg'>
			<div className='page-card' style={{ maxWidth: '800px' }}>
				<div className='section-header mb-4'>
					<Title level={2} className='section-title !mb-1'>
						💬 Чат с тренером
					</Title>
				</div>
				<Chat role='client' chatId='client_trainer' />
			</div>
		</div>
	)
}
