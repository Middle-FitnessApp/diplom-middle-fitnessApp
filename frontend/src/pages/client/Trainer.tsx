import { Typography } from 'antd'
import { Chat } from '../../components/Chat'

const { Title } = Typography

export const Trainer = () => {
	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[800px]'>
				<div className='text-center mb-4'>
					<Title level={2} className='text-gray-800 font-semibold mb-1 pb-3 border-b-3 border-primary inline-block'>
						💬 Чат с тренером
					</Title>
				</div>
				<Chat role='client' chatId='client_trainer' />
			</div>
		</div>
	)
}
