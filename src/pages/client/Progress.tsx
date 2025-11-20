import { Card, Row, Col, type RadioChangeEvent } from 'antd'
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
		'waist',
		'hips',
		'chest',
		'arms',
	])

	const metricColors = Object.fromEntries(
		Object.entries(PROGRESS_METRICS).map(([key, config]) => [key, config.color]),
	)

	const metricNames = Object.fromEntries(
		Object.entries(PROGRESS_METRICS).map(([key, config]) => [key, config.label]),
	)
	console.log('period', period)
	const handlePeriodChange = (e: RadioChangeEvent) => {
		setPeriod(e.target.value)
	}

	//для примера данные пока
	const data = [
		{ date: '2024-01-15', waist: 77, hips: 93, chest: 98, arms: 31 },
		{ date: '2024-01-22', waist: 76, hips: 92, chest: 97, arms: 30.5 },
		{ date: '2025-08-29', waist: 75, hips: 91, chest: 96, arms: 30 },
		{ date: '2025-09-05', waist: 74, hips: 90, chest: 95, arms: 29.5 },
		{ date: '2025-10-12', waist: 73, hips: 89, chest: 94, arms: 29 },
		{ date: '2025-11-02', waist: 72, hips: 88, chest: 93, arms: 28.5 },
		{ date: '2025-11-26', waist: 71, hips: 87, chest: 92, arms: 28 },
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
		<div className='p-4 w-full max-w-[95vw] mx-auto'>
			<div className='mb-6 pb-4 border-b'>
				<h1 className='text-2xl font-semibold m-0'>Ваш прогресс</h1>
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

											<Legend
												formatter={(value) =>
													metricNames[value as keyof typeof metricNames]
												}
											/>

											{Object.keys(PROGRESS_METRICS).map((metric) =>
												selectedMetrics.includes(metric) ? (
													<Bar
														key={metric}
														dataKey={metric}
														fill={metricColors[metric]}
														name={metric}
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
		</div>
	)
}
