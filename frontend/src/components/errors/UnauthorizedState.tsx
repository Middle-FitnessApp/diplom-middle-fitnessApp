import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export const UnauthorizedState = () => {
	const navigate = useNavigate()

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[500px]'>
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
