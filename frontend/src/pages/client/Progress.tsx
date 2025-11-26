import { Row, Col, Typography, Layout, Card } from 'antd'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'
import { ProgressChart } from '../../components'

const { Title } = Typography

const mockData = [
	{
		date: '2024-01-22',
		weight: 84.7,
		waist: 76,
		hips: 92,
		chest: 97,
		arm: 30.5,
		leg: 58,
	},
	{
		date: '2024-01-15',
		weight: 85.2,
		waist: 77,
		hips: 93,
		chest: 98,
		arm: 31,
		leg: 58.5,
	},
	{
		date: '2025-08-29',
		weight: 83.9,
		waist: 75,
		hips: 91,
		chest: 96,
		arm: 30,
		leg: 57.5,
	},
	{
		date: '2025-09-05',
		weight: 83.1,
		waist: 74,
		hips: 90,
		chest: 95,
		arm: 29.5,
		leg: 57,
	},
	{
		date: '2025-10-12',
		weight: 82.4,
		waist: 73,
		hips: 89,
		chest: 94,
		arm: 29,
		leg: 56.5,
	},
	{
		date: '2025-11-02',
		weight: 81.8,
		waist: 72,
		hips: 88,
		chest: 93,
		arm: 28.5,
		leg: 56,
	},
	{
		date: '2025-11-26',
		weight: 81.2,
		waist: 71,
		hips: 87,
		chest: 92,
		arm: 28,
		leg: 55.5,
	},
]

export const Progress = () => {
	return (
		<div className="page-container gradient-bg">
      <div className="page-card">
        <div className="section-header">
          <Title level={2} className="section-title">
            📈 Ваш прогресс
          </Title>
        </div>

        <Card className="!border !border-gray-200">
          <ProgressChart
            data={mockData}
            metrics={PROGRESS_METRICS}
            chartTitle="График прогресса"
          />
        </Card>
      </div>
    </div>
	)
}
