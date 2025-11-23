import { Button, Card, Layout, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

export const Main = () => {
	const { Title, Paragraph } = Typography
	const isAuth = false

	const navigate = useNavigate()

	const handleClick = () => {
		navigate('/signup')
	}
	return (
		<Layout className='main w-full flex justify-center !items-start p-6'>
			<div className='max-w-2xl'>
				<Title className='!font-black !text-8xl'>Fitnes App</Title>
				{isAuth ? (
					<Card title='Ваш тренер'>информация о треннере</Card>
				) : (
					<>
						<Paragraph className='!text-highlight !text-xl !opacity-90'>
							Присоединяйтесь к сообществу профессионалов и клиентов. Достигайте целей
							вместе с лучшими тренерами.
						</Paragraph>
						<Button
							type='primary'
							size='large'
							className='!h-12 !px-10 !text-lg !font-semibold !w-fit'
							onClick={handleClick}
						>
							Присоединиться
						</Button>
					</>
				)}
			</div>
		</Layout>
	)
}
