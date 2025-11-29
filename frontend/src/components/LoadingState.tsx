import { Spin } from 'antd'

interface LoadingStateProps {
	message?: string
}

export const LoadingState = ({ message = 'Загрузка...' }: LoadingStateProps) => {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50'>
			<div className='flex flex-col items-center gap-4 p-8 rounded-2xl shadow-md bg-white border border-gray-100 animate-fade-in'>
				<Spin size='large' />
				<span className='text-base font-medium text-gray-600 tracking-wide'>
					{message}
				</span>
			</div>
		</div>
	)
}
