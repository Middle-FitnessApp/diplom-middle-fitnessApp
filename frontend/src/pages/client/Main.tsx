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
    <div className="page-container gradient-bg">
      <div className="page-card text-center">
        <Title level={1} className="!text-6xl !font-black !mb-6 !text-gray-800">
          Fitness App
        </Title>
        
        {isAuth ? (
          <Card 
            className="max-w-md mx-auto card-hover"
            title={<span className="text-xl font-semibold">Ваш тренер</span>}
          >
            <div className="text-gray-600">Информация о тренере</div>
          </Card>
        ) : (
          <>
            <Paragraph className="!text-xl !text-gray-700 !mb-8 !max-w-2xl !mx-auto">
              Присоединяйтесь к сообществу профессионалов и клиентов. 
              Достигайте целей вместе с лучшими тренерами.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              className="!h-14 !px-12 !text-lg !font-semibold !rounded-lg"
              onClick={handleClick}
            >
              Присоединиться
            </Button>
          </>
        )}
      </div>
    </div>
  )
}