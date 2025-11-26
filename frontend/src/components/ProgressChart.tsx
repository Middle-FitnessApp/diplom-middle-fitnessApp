import { useMemo, useState } from 'react'
import { Card, Col, Layout, Row, type RadioChangeEvent } from 'antd'
import { SelectPeriod } from './SelectPeriod'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
} from 'recharts'
import type { ProgressMetric } from '../constants/progressMetrics'
import { SelectMetric } from './SelectMetric'

interface ProgressChartProps {
	data: Array<Record<string, any>>
	metrics: readonly ProgressMetric[]
	chartTitle?: string
	yLabel?: string
}

export const ProgressChart = ({
	data,
	metrics,
	yLabel = 'Объем (см)',
}: ProgressChartProps) => {
	const defaultSelected = useMemo(
		() => metrics.map((m) => m.nameMetric as string),
		[metrics],
	)
	const [selectedMetrics, setSelectedMetrics] = useState<string[]>(defaultSelected)
	const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month')

	const metricNames = useMemo(
		() => Object.fromEntries(metrics.map((m) => [m.nameMetric, m.label])),
		[metrics],
	)

	const handlePeriodChange = (e: RadioChangeEvent) => {
		setPeriod(e.target.value)
	}

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
		<Layout.Content
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '16px',
			}}
		>
			<div className='w-full'>
				<SelectPeriod period={period} handlePeriodChange={handlePeriodChange} />

				<div className='mt-6'>
					<Row gutter={[32, 24]} className='mb-6'>
						<SelectMetric
							selectedMetrics={selectedMetrics}
							setSelectedMetrics={setSelectedMetrics}
						/>

						<Col xs={24} lg={16} xl={18}>
							<Card size='small'>
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
													value: yLabel,
													angle: -90,
													position: 'insideLeft',
												}}
											/>

											<Legend formatter={(value) => metricNames[value]} />

											{metrics.map((metric) =>
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
	)
}
