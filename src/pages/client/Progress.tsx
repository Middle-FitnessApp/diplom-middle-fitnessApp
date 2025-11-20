import { Card, Row, Col, type RadioChangeEvent, Typography, Layout } from 'antd'
import { useMemo, useState } from 'react'
import { SelectPeriod } from '../../components/SelectPeriod'
import { SelectMetric } from '../../components/SelectMetric'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
} from 'recharts'

export const Progress = () => {
	const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month')
	const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
		'weight',
		'waist',
		'hips',
		'chest',
		'arm',
		'leg',
	])
	const { Title } = Typography

	const metricNames = Object.fromEntries(
		PROGRESS_METRICS.map((metric) => [metric.nameMetric, metric.label]),
	)
	console.log('period', period)
	const handlePeriodChange = (e: RadioChangeEvent) => {
		setPeriod(e.target.value)
	}

	//для примера данные пока
	const data = [
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
	const filteredData = useMemo(() => {
		if (period === 'all') return data

		const now = new Date()

		if (period === 'month') {
			const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
			return data.filter((item) => new Date(item.date) >= oneMonthAgo)
		}

		if (period === 'year') {
			const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
			return data.filter((item) => new Date(item.date) >= oneYearAgo)
		}

		return data
	}, [period, data])

	return (
		<Layout style={{ padding: '24px', minHeight: '100vh' }}>
			<Layout.Content
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '16px',
				}}
			>
				<div className='mb-6 pb-4 border-b'>
					<Title level={3}>Ваш прогресс</Title>
				</div>

				<div className='w-full'>
					<SelectPeriod period={period} handlePeriodChange={handlePeriodChange} />

					<div className='mt-6'>
						<Row gutter={[32, 24]} className='mb-6'>
							<SelectMetric
								selectedMetrics={selectedMetrics}
								setSelectedMetrics={setSelectedMetrics}
							/>

							<Col xs={24} lg={16} xl={18}>
								<Card size='small' title='График прогресса'>
									<div className='w-full h-[350px] min-h-[300px]'>
										<ResponsiveContainer width='100%' height={350}>
											<BarChart
												data={filteredData}
												margin={{
													top: 20,
													right: 30,
													left: 20,
													bottom: 15,
												}}
											>
												<CartesianGrid strokeDasharray='3 3' />
												<XAxis
													dataKey='date'
													tickFormatter={(date) => new Date(date).toLocaleDateString()}
												/>
												<YAxis
													label={{
														value: 'Объем (см)',
														angle: -90,
														position: 'insideLeft',
													}}
												/>

												<Legend formatter={(value) => metricNames[value]} />

												{PROGRESS_METRICS.map((metric) =>
													selectedMetrics.includes(metric.nameMetric) ? (
														<Bar
															key={metric.nameMetric}
															dataKey={metric.nameMetric}
															fill={metric.color}
															name={metric.nameMetric}
															maxBarSize={40}
														/>
													) : null,
												)}
											</BarChart>
										</ResponsiveContainer>
									</div>
								</Card>
							</Col>
						</Row>
					</div>
				</div>
			</Layout.Content>
		</Layout>
	)
}
