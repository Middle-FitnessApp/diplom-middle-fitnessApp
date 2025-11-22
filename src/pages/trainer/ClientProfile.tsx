import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Button } from 'antd'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'
import {
	ClientInfo,
	CommentsSection,
	LatestReport,
	ProgressChart,
} from '../../components'
import {
	mockClientData,
	mockReports,
	mockProgressData,
	mockComments,
} from '../../mocks/clientProfileMocks'

const { Title } = Typography

export const ClientProfile = () => {
	const { id: clientId } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const handleAddNutrition = () => {
		navigate(`/admin/client/${clientId}/add-nutrition`)
	}

	return (
		<div className='min-h-screen bg-background p-4 md:p-6 lg:p-8'>
			<div className='max-w-7xl mx-auto'>
				<Row gutter={[16, 16]} className='mb-8'>
					<Col span={24}>
						<Title level={2} className='m-0'>
							Профиль клиента
						</Title>
					</Col>
				</Row>

				{/* Информауия о клиенте */}
				<Row gutter={[24, 24]} className='mb-8'>
					<Col xs={24} lg={8}>
						<ClientInfo client={mockClientData} onAddNutrition={handleAddNutrition} />
					</Col>

					{/* Последний отчет*/}
					<Col xs={24} lg={16}>
						<LatestReport reports={mockReports} />
						<div style={{ marginTop: 16 }}>
							<Button type='primary' onClick={() => navigate(`/me/progress/reports`)}>
								Все отчеты
							</Button>
						</div>
					</Col>
				</Row>

				{/* График прогресса */}
				<Row gutter={[24, 24]} className='mb-8'>
					<Col span={24}>
						<Card title='График прогресса'>
							<Row gutter={[32, 24]}>
								<Col span={24}>
									<ProgressChart data={mockProgressData} metrics={PROGRESS_METRICS} />
								</Col>
							</Row>
						</Card>
					</Col>
				</Row>

				{/* Часть с комментариями */}
				<Row gutter={[24, 24]}>
					<Col span={24}>
						<CommentsSection comments={mockComments} />
					</Col>
				</Row>
			</div>
		</div>
	)
}
