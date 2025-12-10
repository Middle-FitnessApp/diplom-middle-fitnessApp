import { useState, type FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Spin, Alert, Button, Row, Col, Image, List, Avatar, Divider, Empty } from 'antd'
import { LoadingOutlined, ArrowLeftOutlined, CommentOutlined, UserOutlined } from '@ant-design/icons'
import { useGetProgressReportQuery } from '../../store/api/progress.api'

const { Title, Text } = Typography

export const Report: FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

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

    const {
        data: report,
        isLoading,
        isError,
        error,
    } = useGetProgressReportQuery(id || '', {
        skip: !id,
    })

	const formatDate = (isoDate: string): string => {
		const date = new Date(isoDate)
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		return `${day}.${month}.${year}`
	}

	const formatDateTime = (isoDate: string): string => {
		const date = new Date(isoDate)
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')
		return `${day}.${month}.${year} ${hours}:${minutes}`
	}

    const handleBack = (): void => {
        navigate('/me/progress/reports')
    }

    const handlePhotoError = (position: 'front' | 'side' | 'back'): void => {
        setFailedPhotos((prev) => ({ ...prev, [position]: true }))
    }

    if (!id) {
        return (
            <div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
                <div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
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

    if (isLoading) {
        return (
            <div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
                <div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px] flex justify-center items-center min-h-[400px]'>
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                        tip='Загрузка отчета...'
                    />
                </div>
            </div>
        )
    }

    if (isError) {
        const errorMessage =
            'data' in error && typeof error.data === 'object' && error.data !== null
                ? (error.data as { message?: string }).message || 'Ошибка при загрузке отчета'
                : 'Ошибка при загрузке отчета'

        return (
            <div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
                <div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
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

    if (!report) {
        return (
            <div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
                <div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
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
                        <Title level={2} className='text-gray-800 font-semibold mb-4 pb-3 border-b-3 border-primary inline-block'>
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
                                            <div className='mb-2 font-semibold text-gray-600'>
                                                Спереди
                                            </div>
                                            <Image
                                                src={report.photoFront}
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
                                            <div className='mb-2 font-semibold text-gray-600'>
                                                Сбоку
                                            </div>
                                            <Image
                                                src={report.photoSide}
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
                                            <div className='mb-2 font-semibold text-gray-600'>
                                                Сзади
                                            </div>
                                            <Image
                                                src={report.photoBack}
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
                    <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
                        <Title level={4} className='mb-4'>
                            Измерения
                        </Title>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-lg'>
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

					{/* Комментарии тренера */}
					{report.comments && report.comments.length > 0 && (
						<>
							<Divider />
							<div className='mt-6'>
								<Title level={4} className='flex items-center gap-2 mb-4'>
									<CommentOutlined />
									Комментарии тренера ({report.comments.length})
								</Title>
								<List
									itemLayout="horizontal"
									dataSource={report.comments}
									renderItem={(comment) => (
										<List.Item className='!border-b !border-gray-100 !py-4'>
											<List.Item.Meta
												avatar={
													<Avatar 
														src={comment.trainer.photo} 
														icon={!comment.trainer.photo && <UserOutlined />}
														size="large"
													/>
												}
												title={
													<div className='flex items-center justify-between flex-wrap gap-2'>
														<Text strong>{comment.trainer.name}</Text>
														<Text type="secondary" className="text-xs">
															{formatDateTime(comment.createdAt)}
														</Text>
													</div>
												}
												description={
													<Text className="text-gray-700 whitespace-pre-wrap">
														{comment.text}
													</Text>
												}
											/>
										</List.Item>
									)}
								/>
							</div>
						</>
					)}

					{/* Если комментариев нет */}
					{(!report.comments || report.comments.length === 0) && (
						<div className='mt-6 text-center py-4'>
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={
									<Text type="secondary">
										Тренер ещё не оставил комментариев к этому отчёту
									</Text>
								}
							/>
						</div>
					)}
                </Card>
            </div>
        </div>
    )
}
