import { useMemo, useState } from 'react'
import { Card, Col, Row, Empty, Typography, Radio, Checkbox, Space, Tag } from 'antd'
import type { RadioChangeEvent } from 'antd'
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
import type { ChartDataPoint } from '../../utils/progressChart'

const { Text } = Typography

interface DotProps {
	cx?: number
	cy?: number
	payload?: ChartDataPoint
}

// Функция для генерации интерполированных данных между точками
const interpolateData = (
	data: ChartDataPoint[],
	period: 'month' | 'year' | 'all',
): ChartDataPoint[] => {
	if (data.length < 2) return data

	const result: ChartDataPoint[] = []
	const sortedData = [...data].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	)

	// Определяем интервал интерполяции в зависимости от периода
	const intervalDays = period === 'month' ? 3 : period === 'year' ? 14 : 7

	for (let i = 0; i < sortedData.length - 1; i++) {
		const current = sortedData[i]
		const next = sortedData[i + 1]

		result.push(current)

		const currentDate = new Date(current.date)
		const nextDate = new Date(next.date)
		const daysDiff = Math.floor(
			(nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
		)

		// Если разница больше интервала, добавляем интерполированные точки
		if (daysDiff > intervalDays * 2) {
			const numPoints = Math.floor(daysDiff / intervalDays) - 1

			for (let j = 1; j <= Math.min(numPoints, 5); j++) {
				const ratio = j / (numPoints + 1)
				const interpolatedDate = new Date(
					currentDate.getTime() + (nextDate.getTime() - currentDate.getTime()) * ratio,
				)

				const interpolatedPoint: ChartDataPoint = {
					date: interpolatedDate.toISOString().split('T')[0],
					_interpolated: true, // Помечаем как интерполированную точку
				}

				// Интерполируем числовые значения
				Object.keys(current).forEach((key) => {
					if (
						key !== 'date' &&
						typeof current[key] === 'number' &&
						typeof next[key] === 'number'
					) {
						interpolatedPoint[key] = Number(
							(current[key] + (next[key] - current[key]) * ratio).toFixed(1),
						)
					}
				})

				result.push(interpolatedPoint)
			}
		}
	}

	result.push(sortedData[sortedData.length - 1])
	return result
}

// Функция для получения описания диапазона дат
const getDateRangeDescription = (data: ChartDataPoint[]): string => {
	if (data.length === 0) return ''
	if (data.length === 1) {
		return new Date(data[0].date).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}

	const sortedData = [...data].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	)
	const firstDate = new Date(sortedData[0].date)
	const lastDate = new Date(sortedData[sortedData.length - 1].date)

	const firstStr = firstDate.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
	})
	const lastStr = lastDate.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})

	return `${firstStr} — ${lastStr}`
}

interface ProgressChartProps<
	T extends { date: string; [key: string]: string | number | boolean | undefined },
> {
	data: T[]
	metrics: readonly ProgressMetric[]
	chartTitle?: string
	compact?: boolean // Компактный режим для страницы /me
}

export const ProgressChart = <
	T extends { date: string; [key: string]: string | number | boolean | undefined },
>({
	data,
	metrics,
	compact = false,
}: ProgressChartProps<T>) => {
	// По умолчанию показываем только основные метрики
	const defaultSelected = useMemo(() => ['weight', 'waist', 'hips'], [])
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
			prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric],
		)
	}

	const filteredData = useMemo(() => {
		let filtered: ChartDataPoint[] = data

		if (period !== 'all') {
			const now = new Date()
			const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

			if (period === 'month') {
				const oneMonthAgo = new Date(currentDate)
				oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
				filtered = data.filter((item) => {
					const itemDate = new Date(item.date)
					return itemDate >= oneMonthAgo && itemDate <= currentDate
				})
			}

			if (period === 'year') {
				const oneYearAgo = new Date(currentDate)
				oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
				filtered = data.filter((item) => {
					const itemDate = new Date(item.date)
					return itemDate >= oneYearAgo && itemDate <= currentDate
				})
			}
		}

		// Применяем интерполяцию если данных мало, но больше 1
		if (filtered.length > 1 && filtered.length < 10) {
			return interpolateData(filtered, period)
		}

		return filtered
	}, [period, data])

	// Диапазон дат в отфильтрованных данных
	const dateRange = useMemo(() => {
		const realData: ChartDataPoint[] = filteredData.filter((item) => !item._interpolated)
		return getDateRangeDescription(realData)
	}, [filteredData])

	// Количество реальных точек (без интерполяции)
	const realDataCount = useMemo(() => {
		return filteredData.filter((item) => !item._interpolated).length
	}, [filteredData])

	// Компактный режим для страницы /me
	if (compact) {
		return (
			<div className='w-full'>
				{/* Период и диапазон дат */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4'>
					<Radio.Group value={period} onChange={handlePeriodChange} size='small'>
						<Radio.Button value='month'>Месяц</Radio.Button>
						<Radio.Button value='year'>Год</Radio.Button>
						<Radio.Button value='all'>Всё время</Radio.Button>
					</Radio.Group>
					{dateRange && realDataCount > 0 && (
						<Tag color='blue' className='m-0!'>
							{dateRange} ({realDataCount}{' '}
							{realDataCount === 1 ? 'отчёт' : realDataCount < 5 ? 'отчёта' : 'отчётов'})
						</Tag>
					)}
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
									: 'transparent',
							}}
						>
							<span style={{ color: metric.color, fontWeight: 500 }}>{metric.label}</span>
						</Checkbox>
					))}
				</div>

				{/* График или сообщение */}
				{filteredData.length === 0 ? (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description={<Text type='secondary'>Нет данных за выбранный период</Text>}
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
									labelFormatter={(label) => new Date(label).toLocaleDateString('ru-RU')}
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
											dot={(props: DotProps) => {
												const { cx, cy, payload } = props
												if (payload?._interpolated) {
													// Интерполированные точки - маленькие и прозрачные
													return (
														<circle
															key={`${metric.nameMetric}-${cx}-${cy}`}
															cx={cx}
															cy={cy}
															r={2}
															fill={metric.color}
															fillOpacity={0.3}
															stroke='none'
														/>
													)
												}
												// Реальные точки - крупнее
												return (
													<circle
														key={`${metric.nameMetric}-${cx}-${cy}`}
														cx={cx}
														cy={cy}
														r={4}
														fill={metric.color}
														stroke='white'
														strokeWidth={1}
													/>
												)
											}}
											activeDot={{ r: 6 }}
										/>
									) : null,
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
				<div className='flex flex-col'>
					<Text strong className='text-lg'>
						📈 Динамика измерений
					</Text>
					{dateRange && realDataCount > 0 && (
						<Text type='secondary' className='text-sm'>
							{dateRange} • {realDataCount}{' '}
							{realDataCount === 1 ? 'отчёт' : realDataCount < 5 ? 'отчёта' : 'отчётов'}
						</Text>
					)}
				</div>
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
											fontWeight: selectedMetrics.includes(metric.nameMetric) ? 600 : 400,
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
								description={<Text type='secondary'>Нет данных за выбранный период</Text>}
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
													dot={(props: DotProps) => {
														const { cx, cy, payload } = props
														if (payload?._interpolated) {
															return (
																<circle
																	key={`${metric.nameMetric}-${cx}-${cy}`}
																	cx={cx}
																	cy={cy}
																	r={2}
																	fill={metric.color}
																	fillOpacity={0.3}
																	stroke='none'
																/>
															)
														}
														return (
															<circle
																key={`${metric.nameMetric}-${cx}-${cy}`}
																cx={cx}
																cy={cy}
																r={5}
																fill={metric.color}
																stroke='white'
																strokeWidth={2}
															/>
														)
													}}
													activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
												/>
											) : null,
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
