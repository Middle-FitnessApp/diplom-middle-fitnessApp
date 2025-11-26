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
    <div className="page-container gradient-bg">
      <div className="page-card">
        <div className="section-header">
          <Title level={2} className="section-title">
            👤 Профиль клиента
          </Title>
        </div>

        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} lg={8}>
            <Card className="card-hover h-full">
              <ClientInfo client={mockClientData} onAddNutrition={handleAddNutrition} />
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card className="card-hover">
              <LatestReport reports={mockReports} />
              <div className="mt-4">
                <Button 
                  type="primary" 
                  onClick={() => navigate(`/me/progress/reports`)}
                  className="!rounded-lg"
                >
                  Все отчеты
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        <Card className="card-hover mb-8">
          <Title level={4} className="section-title !text-lg !mb-6">
            📈 График прогресса
          </Title>
          <ProgressChart data={mockProgressData} metrics={PROGRESS_METRICS} />
        </Card>

        <Card>
          <Title level={4} className="section-title !text-lg !mb-6">
            💬 Комментарии
          </Title>
          <CommentsSection comments={mockComments} />
        </Card>
      </div>
    </div>
  )
}