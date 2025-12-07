import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Spin, Alert, Button, Row, Col, Image } from 'antd'
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import type { FC } from 'react'
import { useGetProgressReportQuery } from '../../store/api/progress.api'

const { Title } = Typography

export const Report: FC = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// Получаем конкретный отчет по ID
	const {
		data: report,
		isLoading,
		isError,
		error,
	} = useGetProgressReportQuery(id || '', {
		skip: !id, // Пропускаем запрос, если нет ID
	})

	// Форматирование даты из ISO в ДД.ММ.ГГГГ
	const formatDate = (isoDate: string): string => {
		const date = new Date(isoDate)
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		return `${day}.${month}.${year}`
	}

	const handleBack = (): void => {
		navigate('/me/progress/reports')
	}

	// Нет ID в параметрах
	if (!id) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card'>
					<Alert
						message='Ошибка'
						description='ID отчета не указан'
						type='error'
						showIcon
					/>
					<Button type='primary' onClick={handleBack} className='mt-4'>
						Вернуться к списку отчетов
					</Button>
				</div>
			</div>
		)
	}

	// Загрузка
	if (isLoading) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card flex justify-center items-center min-h-[400px]'>
					<Spin
						indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
						tip='Загрузка отчета...'
					/>
				</div>
			</div>
		)
	}

	// Ошибка
	if (isError) {
		const errorMessage =
			'data' in error && typeof error.data === 'object' && error.data !== null
				? (error.data as { message?: string }).message || 'Ошибка при загрузке отчета'
				: 'Ошибка при загрузке отчета'

		return (
			<div className='page-container gradient-bg'>
				<div className='page-card'>
					<Alert
						message='Ошибка загрузки'
						description={errorMessage}
						type='error'
						showIcon
					/>
					<Button
						type='primary'
						icon={<ArrowLeftOutlined />}
						onClick={handleBack}
						className='mt-4'
					>
						Вернуться к списку отчетов
					</Button>
				</div>
			</div>
		)
	}

	// Нет данных (не должно произойти, но для типизации)
	if (!report) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card'>
					<Alert message='Отчет не найден' type='warning' showIcon />
					<Button
						type='primary'
						icon={<ArrowLeftOutlined />}
						onClick={handleBack}
						className='mt-4'
					>
						Вернуться к списку отчетов
					</Button>
				</div>
			</div>
		)
	}

	// Основной контент
	return (
		<div className='page-container gradient-bg'>
			<div className='page-card' style={{ maxWidth: '800px' }}>
				<Button
					type='text'
					icon={<ArrowLeftOutlined />}
					onClick={handleBack}
					className='mb-4'
				>
					Назад к отчетам
				</Button>

				<Card>
					<div className='section-header'>
						<Title level={2} className='section-title'>
							📄 Отчет от {formatDate(report.date)}
						</Title>
					</div>

					{/* Фотографии */}
					{(report.photoFront || report.photoSide || report.photoBack) && (
						<div className='mb-8'>
							<Title level={4} className='mb-4'>
								Фотографии
							</Title>
							<Row gutter={[16, 16]} justify='center'>
								{report.photoFront && (
									<Col xs={24} sm={8}>
										<div className='text-center'>
											<div className='mb-2 font-semibold text-gray-600'>Спереди</div>
											<Image
												src={report.photoFront}
												alt='Фото спереди'
												className='rounded-lg'
												style={{
													width: '100%',
													maxWidth: '200px',
													height: 'auto',
												}}
											/>
										</div>
									</Col>
								)}
								{report.photoSide && (
									<Col xs={24} sm={8}>
										<div className='text-center'>
											<div className='mb-2 font-semibold text-gray-600'>Сбоку</div>
											<Image
												src={report.photoSide}
												alt='Фото сбоку'
												className='rounded-lg'
												style={{
													width: '100%',
													maxWidth: '200px',
													height: 'auto',
												}}
											/>
										</div>
									</Col>
								)}
								{report.photoBack && (
									<Col xs={24} sm={8}>
										<div className='text-center'>
											<div className='mb-2 font-semibold text-gray-600'>Сзади</div>
											<Image
												src={report.photoBack}
												alt='Фото сзади'
												className='rounded-lg'
												style={{
													width: '100%',
													maxWidth: '200px',
													height: 'auto',
												}}
											/>
										</div>
									</Col>
								)}
							</Row>
						</div>
					)}

					{/* Измерения */}
					<div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
						<Title level={4} className='mb-4'>
							Измерения
						</Title>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-lg'>
							{/* Обязательные поля */}
							<div className='flex justify-between py-2 border-b border-gray-200'>
								<span className='font-semibold text-gray-700'>Вес:</span>
								<span className='text-gray-900'>{report.weight} кг</span>
							</div>
							<div className='flex justify-between py-2 border-b border-gray-200'>
								<span className='font-semibold text-gray-700'>Талия:</span>
								<span className='text-gray-900'>{report.waist} см</span>
							</div>
							<div className='flex justify-between py-2 border-b border-gray-200'>
								<span className='font-semibold text-gray-700'>Бёдра:</span>
								<span className='text-gray-900'>{report.hips} см</span>
							</div>

							{/* Опциональные поля */}
							{report.height && (
								<div className='flex justify-between py-2 border-b border-gray-200'>
									<span className='font-semibold text-gray-700'>Рост:</span>
									<span className='text-gray-900'>{report.height} см</span>
								</div>
							)}
							{report.chest && (
								<div className='flex justify-between py-2 border-b border-gray-200'>
									<span className='font-semibold text-gray-700'>Грудь:</span>
									<span className='text-gray-900'>{report.chest} см</span>
								</div>
							)}
							{report.arm && (
								<div className='flex justify-between py-2 border-b border-gray-200'>
									<span className='font-semibold text-gray-700'>Рука:</span>
									<span className='text-gray-900'>{report.arm} см</span>
								</div>
							)}
							{report.leg && (
								<div className='flex justify-between py-2'>
									<span className='font-semibold text-gray-700'>Нога:</span>
									<span className='text-gray-900'>{report.leg} см</span>
								</div>
							)}
						</div>
					</div>

					{/* Комментарий тренера (если есть) */}
					{report.trainerComment && (
						<div className='mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded'>
							<Title level={5} className='mb-2 text-blue-700'>
								💬 Комментарий тренера
							</Title>
							<p className='text-gray-800 mb-2'>{report.trainerComment}</p>
							{report.commentedAt && (
								<p className='text-sm text-gray-500'>{formatDate(report.commentedAt)}</p>
							)}
						</div>
					)}
				</Card>
			</div>
		</div>
	)
}
