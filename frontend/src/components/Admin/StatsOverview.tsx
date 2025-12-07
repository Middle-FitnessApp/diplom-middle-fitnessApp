import React from 'react'
import { Card, Statistic, Row, Col } from 'antd'
import {
	UserOutlined,
	StarOutlined,
	ClockCircleOutlined,
	TrophyOutlined,
} from '@ant-design/icons'

interface StatsOverviewProps {
	totalClients: number
	favoriteClients: number
	pendingInvites: number
	activeNutritionPlans?: number
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
	totalClients,
	favoriteClients,
	pendingInvites,
	activeNutritionPlans = 0,
}) => {
	return (
		<Row gutter={[16, 16]} className="mb-8">
			<Col xs={24} sm={12} lg={6}>
				<Card
					className="shadow-md hover:shadow-lg transition-shadow"
					style={{
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						border: 'none',
						borderRadius: '16px',
					}}
				>
					<Statistic
						title={<span className="text-white/80 font-medium">Всего клиентов</span>}
						value={totalClients}
						prefix={<UserOutlined style={{ color: '#fff' }} />}
						valueStyle={{ color: '#fff', fontWeight: 700, fontSize: '2rem' }}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={12} lg={6}>
				<Card
					className="shadow-md hover:shadow-lg transition-shadow"
					style={{
						background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
						border: 'none',
						borderRadius: '16px',
					}}
				>
					<Statistic
						title={<span className="text-white/80 font-medium">Избранные</span>}
						value={favoriteClients}
						prefix={<StarOutlined style={{ color: '#fff' }} />}
						valueStyle={{ color: '#fff', fontWeight: 700, fontSize: '2rem' }}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={12} lg={6}>
				<Card
					className="shadow-md hover:shadow-lg transition-shadow"
					style={{
						background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
						border: 'none',
						borderRadius: '16px',
					}}
				>
					<Statistic
						title={<span className="text-white/80 font-medium">Ожидают ответа</span>}
						value={pendingInvites}
						prefix={<ClockCircleOutlined style={{ color: '#fff' }} />}
						valueStyle={{ color: '#fff', fontWeight: 700, fontSize: '2rem' }}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={12} lg={6}>
				<Card
					className="shadow-md hover:shadow-lg transition-shadow"
					style={{
						background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
						border: 'none',
						borderRadius: '16px',
					}}
				>
					<Statistic
						title={<span className="text-white/80 font-medium">Планы питания</span>}
						value={activeNutritionPlans}
						prefix={<TrophyOutlined style={{ color: '#fff' }} />}
						valueStyle={{ color: '#fff', fontWeight: 700, fontSize: '2rem' }}
					/>
				</Card>
			</Col>
		</Row>
	)
}

