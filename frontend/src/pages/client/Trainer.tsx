import { Typography } from 'antd'
import { Chat } from '../../components/Chat'
import { useThemeClasses } from '../../store/hooks'

const { Title } = Typography

export const Trainer = () => {
	const classes = useThemeClasses()

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div
				className={`${classes.cardBg} rounded-2xl p-10 shadow-xl border ${classes.border} w-full max-w-[800px]`}
			>
				<div className='text-center mb-4'>
					<Title
						level={2}
						className={`${classes.title} font-semibold mb-1 pb-3 border-b-3 border-primary inline-block`}
					>
						💬 Чат с тренером
					</Title>
				</div>
				<Chat role='client' />
			</div>
		</div>
	)
}
