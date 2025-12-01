import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export const UnauthorizedState = () => {
	const navigate = useNavigate()

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card' style={{ maxWidth: '500px' }}>
				<Result
					status='403'
					title='Требуется авторизация'
					subTitle='Вы не авторизованы. Пожалуйста, войдите в аккаунт для доступа к профилю'
					extra={
						<Button type='primary' size='large' onClick={() => navigate('/login')}>
							Войти
						</Button>
					}
				/>
			</div>
		</div>
	)
}
