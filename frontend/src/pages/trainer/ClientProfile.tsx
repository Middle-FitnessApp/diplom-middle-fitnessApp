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
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[500px]'>
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
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
				<div className='text-center mb-8'>
					<Title level={2} className='text-gray-800 font-semibold mb-4 pb-3 border-b-3 border-primary inline-block'>
						Профиль клиента
					</Title>
				</div>

				<Row gutter={[24, 24]} className='mb-8'>
					<Col xs={24} lg={8}>
						<ClientInfo client={clientData.client} onAddNutrition={handleAddNutrition} />
					</Col>

					<Col xs={24} lg={16}>
						<div className='flex flex-col h-full gap-6'>
							<Card className='hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex-1 flex flex-col'>
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
										<div className='mt-4'>
											<Button
												type='primary'
												onClick={() => navigate(`/admin/progress/${clientId}/reports`)}
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

				<Card className='hover:shadow-lg transition-all duration-300 hover:-translate-y-1 !mb-8'>
					<Title level={4} className='text-gray-800 font-semibold text-lg mb-6 pb-3 border-b-3 border-primary inline-block'>
						График прогресса
					</Title>
					<ProgressChart data={progressData} metrics={PROGRESS_METRICS} />
				</Card>

				<Card>
					<Title level={4} className='text-gray-800 font-semibold text-lg mb-6 pb-3 border-b-3 border-primary inline-block'>
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
