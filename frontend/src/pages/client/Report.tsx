import { useState, type FC } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, Typography, Button, Row, Col, Image } from 'antd'
import { ArrowLeftOutlined, CommentOutlined } from '@ant-design/icons'
import {
	useAddProgressCommentMutation,
	useGetProgressReportQuery,
	useGetTrainerProgressReportQuery,
} from '../../store/api/progress.api'
import { formatDate } from '../../utils/progressFunctions.ts'
import { AddCommentForm, CommentsList, MeasurementsCard } from '../../components/Admin'
import { ApiErrorState } from '../../components/errors'
import { LoadingState } from '../../components'
import { API_BASE_URL } from '../../config/api.config'
import { useThemeClasses } from '../../hooks/useThemeClasses'

const { Title } = Typography

export const Report: FC = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const classes = useThemeClasses()

	const { clientId, reportId } = useParams<{ clientId?: string; reportId?: string }>()
	const { id } = useParams<{ id?: string }>()
	const isTrainerRoute = !!clientId
	const isClientRoute = location.pathname.startsWith('/me/')

	const reportIdToUse = isTrainerRoute ? reportId : id

	// отслеживаем, какие фотографии не загрузились
	const [failedPhotos, setFailedPhotos] = useState<{
		front: boolean
		side: boolean
		back: boolean
	}>({
		front: false,
		side: false,
		back: false,
	})

	// Для клиента
	const {
		data: clientReport,
		isLoading: clientLoading,
		isError: clientError,
		error: clientErrorData,
	} = useGetProgressReportQuery(reportIdToUse || '', {
		skip: !reportIdToUse || !isClientRoute,
	})

	// Для тренера: reportId + clientId
	const {
		data: trainerReport,
		isLoading: trainerLoading,
		isError: trainerError,
		error: trainerErrorData,
	} = useGetTrainerProgressReportQuery(
		{ reportId: reportIdToUse!, clientId: clientId! },
		{
			skip: !reportIdToUse || !clientId || !isTrainerRoute,
		},
	)

	const [addComment, { isLoading: isAddingComment }] = useAddProgressCommentMutation()

	const handleAddComment = async (text: string) => {
		try {
			await addComment({ progressId: reportIdToUse!, text }).unwrap()
		} catch (err) {
			console.error('Ошибка добавления комментария:', err)
		}
	}

	const report = clientReport || trainerReport
	const isLoading = clientLoading || trainerLoading
	const isError = clientError || trainerError
	const error = clientErrorData || trainerErrorData

	const handleBack = () => {
		if (isTrainerRoute && clientId) {
			navigate(`/admin/progress/${clientId}/reports`)
		} else if (isClientRoute) {
			navigate('/me/progress/reports')
		} else {
			navigate('/')
		}
	}

	const handlePhotoError = (position: 'front' | 'side' | 'back'): void => {
		setFailedPhotos((prev) => ({ ...prev, [position]: true }))
	}

	if (!reportIdToUse) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10'>
				<ApiErrorState
					error={{ status: 400, data: { error: { message: 'ID отчета не указан или указан неверно', statusCode: 400 } } }}
					title='Ошибка загрузки'
				/>
			</div>
		)
	}

	if (isLoading) {
		return <LoadingState message='Загрузка отчета...' />
	}

	if (isError || error || !report) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10'>
				<ApiErrorState
					error={error}
					title='Ошибка загрузки'
					message='Не удалось загрузить отчет'
				/>
			</div>
		)
	}

	const showFront = !!report.photoFront && !failedPhotos.front
	const showSide = !!report.photoSide && !failedPhotos.side
	const showBack = !!report.photoBack && !failedPhotos.back
	const hasAnyPhoto = showFront || showSide || showBack

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[800px]'>
				<Button
					type='text'
					icon={<ArrowLeftOutlined />}
					onClick={handleBack}
					className='mb-4'
				>
					Назад к отчетам
				</Button>

				<Card>
					<div className='text-center mb-8'>
						<Title
							level={2}
							className='text-gray-800 font-semibold mb-4 pb-3 border-b-3 border-primary inline-block'
						>
							📄 Отчет от {formatDate(report.date)}
						</Title>
					</div>

					{/* Фотографии */}
					{hasAnyPhoto && (
						<div className='mb-8'>
							<Title level={4} className='mb-4'>
								Фотографии
							</Title>
							<Row gutter={[16, 16]} justify='center'>
								{showFront && (
									<Col xs={24} sm={8}>
										<div className='text-center'>
											<div className={`mb-2 font-semibold ${classes.textSecondary}`}>
												Спереди
											</div>
											<Image
												src={`${API_BASE_URL}${report.photoFront}`}
												alt='Фото спереди'
												className='rounded-lg'
												style={{
													width: '100%',
													maxWidth: '200px',
													height: 'auto',
												}}
												onError={() => handlePhotoError('front')}
											/>
										</div>
									</Col>
								)}
								{showSide && (
									<Col xs={24} sm={8}>
										<div className='text-center'>
											<div className={`mb-2 font-semibold ${classes.textSecondary}`}>
												Сбоку
											</div>
											<Image
												src={`${API_BASE_URL}${report.photoSide}`}
												alt='Фото сбоку'
												className='rounded-lg'
												style={{
													width: '100%',
													maxWidth: '200px',
													height: 'auto',
												}}
												onError={() => handlePhotoError('side')}
											/>
										</div>
									</Col>
								)}
								{showBack && (
									<Col xs={24} sm={8}>
										<div className='text-center'>
											<div className={`mb-2 font-semibold ${classes.textSecondary}`}>
												Сзади
											</div>
											<Image
												src={`${API_BASE_URL}${report.photoBack}`}
												alt='Фото сзади'
												className='rounded-lg'
												style={{
													width: '100%',
													maxWidth: '200px',
													height: 'auto',
												}}
												onError={() => handlePhotoError('back')}
											/>
										</div>
									</Col>
								)}
							</Row>
						</div>
					)}

					{/* Измерения */}
					<MeasurementsCard report={report} />

					{/* Комментарии тренера */}
					<div className='mt-6'>
						<Title level={4} className='flex items-center gap-2 mb-4'>
							<CommentOutlined />
							Комментарии ({report.comments?.length || 0})
						</Title>

						{isTrainerRoute && (
							<AddCommentForm onSubmit={handleAddComment} isLoading={isAddingComment} />
						)}

						<CommentsList comments={report.comments || []} isLoading={isLoading} />
					</div>
				</Card>
			</div>
		</div>
	)
}
