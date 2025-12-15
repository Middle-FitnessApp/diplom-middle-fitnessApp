import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../utils/test-utils'
import { Card, Empty } from 'antd'

// Моковые данные прогресса
interface ProgressData {
	date: string
	weight: number
	waist: number
	hips: number
}

const mockProgressData: ProgressData[] = [
	{ date: '2025-12-01', weight: 80, waist: 90, hips: 100 },
	{ date: '2025-12-05', weight: 78, waist: 88, hips: 98 },
	{ date: '2025-12-10', weight: 76, waist: 86, hips: 96 },
	{ date: '2025-12-15', weight: 75, waist: 85, hips: 95 },
]

// Компонент графика прогресса
const ProgressChart = ({
	data = [],
	title = 'График прогресса',
	metric = 'weight' as keyof Omit<ProgressData, 'date'>,
}: {
	data?: ProgressData[]
	title?: string
	metric?: keyof Omit<ProgressData, 'date'>
}) => {
	if (data.length === 0) {
		return (
			<Card title={title}>
				<Empty description='Нет данных для отображения' />
			</Card>
		)
	}

	const metricLabels = {
		weight: 'Вес (кг)',
		waist: 'Талия (см)',
		hips: 'Бёдра (см)',
	}

	const currentValue = data[data.length - 1][metric]
	const previousValue = data[0][metric]
	const difference = currentValue - previousValue
	const percentChange = ((difference / previousValue) * 100).toFixed(1)

	return (
		<Card title={title} data-testid='progress-chart'>
			<div style={{ marginBottom: 16 }}>
				<h4>{metricLabels[metric]}</h4>
				<div style={{ fontSize: 24, fontWeight: 'bold' }}>
					{currentValue} {metric === 'weight' ? 'кг' : 'см'}
				</div>
				<div style={{ color: difference < 0 ? 'green' : 'red' }}>
					{difference > 0 ? '+' : ''}
					{difference} ({percentChange}%)
				</div>
			</div>

			{/* Таблица данных (вместо реального графика для тестов) */}
			<div data-testid='chart-data'>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Дата</th>
							<th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Значение</th>
						</tr>
					</thead>
					<tbody>
						{data.map((item, index) => (
							<tr key={index}>
								<td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
									{item.date}
								</td>
								<td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
									{item[metric]} {metric === 'weight' ? 'кг' : 'см'}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
				Всего записей: {data.length}
			</div>
		</Card>
	)
}

describe('ProgressChart - График прогресса', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('должен отображать заголовок графика', () => {
		render(<ProgressChart data={mockProgressData} />)

		expect(screen.getByText('График прогресса')).toBeInTheDocument()
	})

	it('должен отображать пустое состояние при отсутствии данных', () => {
		render(<ProgressChart data={[]} />)

		expect(screen.getByText(/нет данных для отображения/i)).toBeInTheDocument()
	})

	it('должен отображать текущее значение веса', () => {
		render(<ProgressChart data={mockProgressData} metric='weight' />)

		// Ищем только в жирном тексте (текущее значение)
		const currentValue = screen.getByText('75 кг', {
			selector: 'div[style*="font-size: 24px"]',
		})
		expect(currentValue).toBeInTheDocument()
	})

	it('должен отображать изменение веса', () => {
		render(<ProgressChart data={mockProgressData} metric='weight' />)

		// Изменение: 75 - 80 = -5, процент округляется
		expect(screen.getByText(/-5/)).toBeInTheDocument()
		expect(screen.getByText(/-6\.3%/)).toBeInTheDocument()
	})

	it('должен показывать зелёный цвет при уменьшении веса', () => {
		const { container } = render(
			<ProgressChart data={mockProgressData} metric='weight' />,
		)

		const changeElement = container.querySelector('[style*="color: green"]')
		expect(changeElement).toBeInTheDocument()
	})

	it('должен отображать все записи в таблице данных', () => {
		render(<ProgressChart data={mockProgressData} metric='weight' />)

		expect(screen.getByText('2025-12-01')).toBeInTheDocument()
		expect(screen.getByText('2025-12-05')).toBeInTheDocument()
		expect(screen.getByText('2025-12-10')).toBeInTheDocument()
		expect(screen.getByText('2025-12-15')).toBeInTheDocument()
	})

	it('должен отображать количество записей', () => {
		render(<ProgressChart data={mockProgressData} metric='weight' />)

		expect(screen.getByText(/всего записей: 4/i)).toBeInTheDocument()
	})

	it('должен корректно отображать метрику талии', () => {
		render(<ProgressChart data={mockProgressData} metric='waist' />)

		expect(screen.getByText('Талия (см)')).toBeInTheDocument()
		// Проверяем что есть элементы с текстом "85 см"
		const values = screen.getAllByText(/85 см/i)
		expect(values.length).toBeGreaterThan(0)
	})

	it('должен корректно отображать метрику бёдер', () => {
		render(<ProgressChart data={mockProgressData} metric='hips' />)

		expect(screen.getByText('Бёдра (см)')).toBeInTheDocument()
		// Проверяем что есть элементы с текстом "95 см"
		const values = screen.getAllByText(/95 см/i)
		expect(values.length).toBeGreaterThan(0)
	})

	it('должен показывать красный цвет при увеличении значения', () => {
		const increasingData = [
			{ date: '2025-12-01', weight: 70, waist: 80, hips: 90 },
			{ date: '2025-12-05', weight: 75, waist: 85, hips: 95 },
		]

		const { container } = render(<ProgressChart data={increasingData} metric='weight' />)

		const changeElement = container.querySelector('[style*="color: red"]')
		expect(changeElement).toBeInTheDocument()
	})

	it('должен отображать знак плюс при положительном изменении', () => {
		const increasingData = [
			{ date: '2025-12-01', weight: 70, waist: 80, hips: 90 },
			{ date: '2025-12-05', weight: 75, waist: 85, hips: 95 },
		]

		render(<ProgressChart data={increasingData} metric='weight' />)

		expect(screen.getByText(/\+5/)).toBeInTheDocument()
	})

	it('должен корректно вычислять процент изменения', () => {
		render(<ProgressChart data={mockProgressData} metric='weight' />)

		// (75 - 80) / 80 * 100 = -6.25% ≈ -6.3% (с округлением до 1 знака)
		expect(screen.getByText(/-6\.3%/)).toBeInTheDocument()
	})

	it('должен отображать кастомный заголовок', () => {
		render(<ProgressChart data={mockProgressData} title='Мой прогресс' />)

		expect(screen.getByText('Мой прогресс')).toBeInTheDocument()
	})

	it('должен отображать таблицу с данными', () => {
		render(<ProgressChart data={mockProgressData} />)

		const chartData = screen.getByTestId('chart-data')
		expect(chartData).toBeInTheDocument()

		// Проверяем заголовки таблицы
		expect(screen.getByText('Дата')).toBeInTheDocument()
		expect(screen.getByText('Значение')).toBeInTheDocument()
	})

	it('должен отображать значения в правильных единицах', () => {
		render(<ProgressChart data={mockProgressData} metric='weight' />)

		// Проверяем что все значения имеют единицу "кг"
		const rows = screen.getAllByText(/кг/)
		expect(rows.length).toBeGreaterThan(0)
	})

	it('должен корректно обрабатывать данные с одной записью', () => {
		const singleData = [{ date: '2025-12-01', weight: 80, waist: 90, hips: 100 }]

		render(<ProgressChart data={singleData} metric='weight' />)

		// Используем getAllByText так как значение дублируется
		const values = screen.getAllByText('80 кг')
		expect(values.length).toBeGreaterThan(0)
		expect(screen.getByText(/всего записей: 1/i)).toBeInTheDocument()
	})

	it('должен отображать карточку с данными', () => {
		render(<ProgressChart data={mockProgressData} />)

		const chart = screen.getByTestId('progress-chart')
		expect(chart).toBeInTheDocument()
	})
})
