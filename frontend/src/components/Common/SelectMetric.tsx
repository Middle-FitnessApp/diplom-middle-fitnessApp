import { Card, Checkbox, Space } from 'antd'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'

interface SelectMetricProps {
	selectedMetrics: string[]
	setSelectedMetrics: (metrics: string[]) => void
}

export const SelectMetric = ({
	selectedMetrics,
	setSelectedMetrics,
}: SelectMetricProps) => {
	const checkboxOptions = PROGRESS_METRICS.map((metric) => ({
		label: metric.label,
		value: metric.nameMetric,
	}))

	return (
		<Card
			size='small'
			title='Выберите метрики'
			className='w-full'
			styles={{
				body: {
					padding: '16px',
					height: '100%',
				},
			}}
		>
			<Space direction='vertical' style={{ width: '100%' }}>
				<Checkbox.Group
					options={checkboxOptions}
					value={selectedMetrics}
					onChange={setSelectedMetrics}
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '12px',
						width: '100%',
					}}
				/>
			</Space>
		</Card>
	)
}
