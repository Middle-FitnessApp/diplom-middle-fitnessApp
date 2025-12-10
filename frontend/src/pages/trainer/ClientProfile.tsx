import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Button } from 'antd'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'
import {
	ClientInfo,
	CommentsSection,
	LatestReport,
	LoadingState,
	NutritionPlan,
	ProgressChart,
} from '../../components'
import { useAuth } from '../../store/hooks'
import { useGetClientProfileQuery } from '../../store/api/trainer.api'
import { ErrorState, UnauthorizedState } from '../../components/errors'
import { useGetProgressAnalyticsQuery } from '../../store/api/progress.api'
import type { ProgressAnalyticsResponse } from '../../store/types/progress.types'
import { transformAnalyticsToChartData } from '../../utils/progressChart'

const { Title } = Typography

export const ClientProfile = () => {
	const navigate = useNavigate()
	const params = useParams()
	const { isAuthenticated } = useAuth()
	const clientId = params.id as string

	const {
		data: clientData,
		isLoading: clientLoading,
		error: clientError,
	} = useGetClientProfileQuery({ clientId }, { skip: !clientId })

	const { data: analyticsResponse = { metrics: [] }, isLoading: progressLoading } =
		useGetProgressAnalyticsQuery({
			period: 'year',
			clientId,
			metrics: PROGRESS_METRICS.map((m) => m.nameMetric),
		})

	const progressData = transformAnalyticsToChartData(
		analyticsResponse as ProgressAnalyticsResponse,
	)

	const handleAddNutrition = () => {
		navigate(`/admin/client/${clientId}/add-nutrition`)
	}

	if (!isAuthenticated) {
		return <UnauthorizedState />
	}

	if (clientLoading) {
		return <LoadingState message='Загрузка...' />
	}

	if (clientError || !clientData) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card' style={{ maxWidth: '500px' }}>
					<ErrorState
						title='Ошибка загрузки'
						message='Не удалось загрузить данные клиента'
						onRetry={() => window.location.reload()}
						showRetryButton={true}
					/>
				</div>
			</div>
		)
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card'>
				<div className='section-header'>
					<Title level={2} className='section-title'>
						Профиль клиента
					</Title>
				</div>

				<Row gutter={[24, 24]} className='mb-8'>
					<Col xs={24} lg={8}>
						<ClientInfo client={clientData.client} onAddNutrition={handleAddNutrition} />
					</Col>

					<Col xs={24} lg={16}>
						<div className='flex flex-col h-full gap-6'>
							<Card className='card-hover flex-1 flex flex-col'>
								{progressLoading ? (
									<div className='flex justify-center py-8'>
										<LoadingState />
									</div>
								) : (
									<>
										<LatestReport
											reports={clientData.lastProgress}
											photo={clientData.client.photo}
										/>
										{/* Куда должна вести кнопка "Все отчеты"? */}
										<div className='mt-4'>
											<Button
												type='primary'
												onClick={() => navigate(`/me/progress/reports`)}
												className='!rounded-lg'
											>
												Все отчеты
											</Button>
										</div>
									</>
								)}
							</Card>

							<NutritionPlan clientId={clientId} />
						</div>
					</Col>
				</Row>

				<Card className='card-hover !mb-8'>
					<Title level={4} className='section-title !text-lg !mb-6'>
						График прогресса
					</Title>
					<ProgressChart data={progressData} metrics={PROGRESS_METRICS} />
				</Card>

				<Card>
					<Title level={4} className='section-title !text-lg !mb-6'>
						Комментарии
					</Title>
					<CommentsSection
						progressId={clientData?.lastProgress?.id || ''}
						isTrainer={true}
					/>
				</Card>
			</div>
		</div>
	)
}
