import { useMemo, useState } from 'react'
import { Card, Col, Row, Empty, Typography, Radio, Checkbox, Space } from 'antd'
import type { RadioChangeEvent, CheckboxProps } from 'antd'
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts'
import type { ProgressMetric } from '../../constants/progressMetrics'

const { Text } = Typography

interface ProgressChartProps {
	data: Array<Record<string, any>>
	metrics: readonly ProgressMetric[]
	chartTitle?: string
	compact?: boolean // Компактный режим для страницы /me
}

export const ProgressChart = ({
	data,
	metrics,
	compact = false,
}: ProgressChartProps) => {
	// По умолчанию показываем только основные метрики
	const defaultSelected = useMemo(
		() => ['weight', 'waist', 'hips'],
		[],
	)
	const [selectedMetrics, setSelectedMetrics] = useState<string[]>(defaultSelected)
	const [period, setPeriod] = useState<'month' | 'year' | 'all'>('all')

	const metricNames = useMemo(
		() => Object.fromEntries(metrics.map((m) => [m.nameMetric, m.label])),
		[metrics],
	)

	const handlePeriodChange = (e: RadioChangeEvent) => {
		setPeriod(e.target.value)
	}

	const handleMetricToggle = (metric: string) => {
		setSelectedMetrics((prev) =>
			prev.includes(metric)
				? prev.filter((m) => m !== metric)
				: [...prev, metric]
		)
	}

	const filteredData = useMemo(() => {
		if (period === 'all') return data

		const now = new Date()
		const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

		if (period === 'month') {
			const oneMonthAgo = new Date(currentDate)
			oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
			return data.filter((item) => {
				const itemDate = new Date(item.date)
				return itemDate >= oneMonthAgo && itemDate <= currentDate
			})
		}

		if (period === 'year') {
			const oneYearAgo = new Date(currentDate)
			oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
			return data.filter((item) => {
				const itemDate = new Date(item.date)
				return itemDate >= oneYearAgo && itemDate <= currentDate
			})
		}

		return data
	}, [period, data])

	// Компактный режим для страницы /me
	if (compact) {
		return (
			<div className='w-full'>
				{/* Период */}
				<div className='flex justify-between items-center mb-4'>
					<Radio.Group value={period} onChange={handlePeriodChange} size='small'>
						<Radio.Button value='month'>Месяц</Radio.Button>
						<Radio.Button value='year'>Год</Radio.Button>
						<Radio.Button value='all'>Всё время</Radio.Button>
					</Radio.Group>
				</div>

				{/* Метрики */}
				<div className='flex flex-wrap gap-2 mb-4'>
					{metrics.slice(0, 4).map((metric) => (
						<Checkbox
							key={metric.nameMetric}
							checked={selectedMetrics.includes(metric.nameMetric)}
							onChange={() => handleMetricToggle(metric.nameMetric)}
							style={{ 
								padding: '4px 8px',
								borderRadius: 4,
								background: selectedMetrics.includes(metric.nameMetric) 
									? `${metric.color}20` 
									: 'transparent'
							}}
						>
							<span style={{ color: metric.color, fontWeight: 500 }}>
								{metric.label}
							</span>
						</Checkbox>
					))}
				</div>

				{/* График или сообщение */}
				{filteredData.length === 0 ? (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description={
							<Text type='secondary'>
								Нет данных за выбранный период
							</Text>
						}
					/>
				) : (
					<div style={{ width: '100%', height: 250 }}>
						<ResponsiveContainer>
							<LineChart
								data={filteredData}
								margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray='3 3' opacity={0.3} />
								<XAxis
									dataKey='date'
									tickFormatter={(date) => {
										const d = new Date(date)
										return `${d.getDate()}.${d.getMonth() + 1}`
									}}
									fontSize={11}
								/>
								<YAxis fontSize={11} />
								<Tooltip
									formatter={(value, name) => [
										`${value} ${name === 'weight' ? 'кг' : 'см'}`,
										metricNames[name as string] || name,
									]}
									labelFormatter={(label) =>
										new Date(label).toLocaleDateString('ru-RU')
									}
									contentStyle={{
										background: 'rgba(255,255,255,0.95)',
										border: '1px solid #e8e8e8',
										borderRadius: 8,
									}}
								/>
								<Legend 
									formatter={(value) => metricNames[value] || value}
									wrapperStyle={{ fontSize: 12 }}
								/>
								{metrics.map((metric) =>
									selectedMetrics.includes(metric.nameMetric) ? (
										<Line
											key={metric.nameMetric}
											type='monotone'
											dataKey={metric.nameMetric}
											stroke={metric.color}
											strokeWidth={2}
											dot={{ r: 3, fill: metric.color }}
											activeDot={{ r: 5 }}
										/>
									) : null
								)}
							</LineChart>
						</ResponsiveContainer>
					</div>
				)}
			</div>
		)
	}

	// Полный режим для страницы /me/progress
	return (
		<div className='w-full'>
			{/* Заголовок и выбор периода */}
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
				<Text strong className='text-lg'>📈 Динамика измерений</Text>
				<Radio.Group value={period} onChange={handlePeriodChange}>
					<Radio.Button value='month'>Месяц</Radio.Button>
					<Radio.Button value='year'>Год</Radio.Button>
					<Radio.Button value='all'>Всё время</Radio.Button>
				</Radio.Group>
			</div>

			<Row gutter={[24, 24]}>
				{/* Выбор метрик */}
				<Col xs={24} md={6}>
					<Card size='small' title='Показатели'>
						<Space direction='vertical' className='w-full'>
							{metrics.map((metric) => (
								<Checkbox
									key={metric.nameMetric}
									checked={selectedMetrics.includes(metric.nameMetric)}
									onChange={() => handleMetricToggle(metric.nameMetric)}
									className='w-full'
								>
									<span
										style={{
											color: selectedMetrics.includes(metric.nameMetric)
												? metric.color
												: 'inherit',
											fontWeight: selectedMetrics.includes(metric.nameMetric)
												? 600
												: 400,
										}}
									>
										● {metric.label}
									</span>
								</Checkbox>
							))}
						</Space>
					</Card>
				</Col>

				{/* График */}
				<Col xs={24} md={18}>
					<Card size='small'>
						{filteredData.length === 0 ? (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={
									<Text type='secondary'>
										Нет данных за выбранный период
									</Text>
								}
								style={{ padding: '40px 0' }}
							/>
						) : (
							<div style={{ width: '100%', height: 400 }}>
								<ResponsiveContainer>
									<LineChart
										data={filteredData}
										margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
									>
										<CartesianGrid strokeDasharray='3 3' opacity={0.3} />
										<XAxis
											dataKey='date'
											tickFormatter={(date) =>
												new Date(date).toLocaleDateString('ru-RU', {
													day: 'numeric',
													month: 'short',
												})
											}
											fontSize={12}
										/>
										<YAxis fontSize={12} />
										<Tooltip
											formatter={(value, name) => [
												`${value} ${name === 'weight' ? 'кг' : 'см'}`,
												metricNames[name as string] || name,
											]}
											labelFormatter={(label) =>
												`Дата: ${new Date(label).toLocaleDateString('ru-RU')}`
											}
											contentStyle={{
												background: 'rgba(255,255,255,0.95)',
												border: '1px solid #e8e8e8',
												borderRadius: 8,
												boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
											}}
										/>
										<Legend
											formatter={(value) => metricNames[value] || value}
											wrapperStyle={{ paddingTop: 20 }}
										/>
										{metrics.map((metric) =>
											selectedMetrics.includes(metric.nameMetric) ? (
												<Line
													key={metric.nameMetric}
													type='monotone'
													dataKey={metric.nameMetric}
													stroke={metric.color}
													strokeWidth={2.5}
													dot={{ r: 4, fill: metric.color, strokeWidth: 0 }}
													activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
												/>
											) : null
										)}
									</LineChart>
								</ResponsiveContainer>
							</div>
						)}
					</Card>
				</Col>
			</Row>
		</div>
	)
}
