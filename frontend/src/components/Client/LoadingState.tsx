import { Spin } from 'antd'

interface LoadingStateProps {
	message?: string
	theme?: 'light' | 'dark'
	inline?: boolean // если true — рендерим компактно для встраивания в блок
}

export const LoadingState = ({
	message = 'Загрузка...',
	theme = 'light',
	inline = false,
}: LoadingStateProps) => {
	const dark = theme === 'dark'

	if (inline) {
		return (
			<div className={`w-full flex items-center justify-center py-12 ${dark ? 'bg-gray-900/40' : ''}`}>
				<div
					className={`flex items-center gap-4 p-4 rounded-lg ${
						dark ? 'bg-gray-800 border border-gray-700 text-gray-100' : 'bg-white border border-gray-100 text-gray-700'
					}`}
				>
					<Spin size='large' />
					<span className='text-base font-medium tracking-wide'>{message}</span>
				</div>
			</div>
		)
	}

	return (
		<div className={`${dark ? 'min-h-screen flex items-center justify-center bg-gray-900' : 'min-h-screen flex items-center justify-center bg-linear-to-b from-white to-gray-50'}`}>
			<div
				className={`flex flex-col items-center gap-4 p-8 rounded-2xl shadow-md ${
					dark ? 'bg-gray-800 border border-gray-700 text-gray-100' : 'bg-white border border-gray-100 text-gray-700'
				} animate-fade-in`}
			>
				<Spin size='large' />
				<span className='text-base font-medium tracking-wide'>{message}</span>
			</div>
		</div>
	)
}
