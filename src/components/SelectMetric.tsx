import { Card, Checkbox, Col } from 'antd'
import { PROGRESS_METRICS } from '../constants/progressMetrics'

interface Props {
	selectedMetrics: string[]
	setSelectedMetrics: (metrics: string[]) => void
}

export const SelectMetric = ({ selectedMetrics, setSelectedMetrics }: Props) => {
	const checkboxOptions = PROGRESS_METRICS.map((metric) => ({
		label: metric.label,
		value: metric.nameMetric,
	}))

	return (
		<Col xs={24} lg={8} xl={6}>
			<Card size='small' title='Выберите метрики'>
				<Checkbox.Group
					options={checkboxOptions}
					value={selectedMetrics}
					onChange={setSelectedMetrics}
					className='flex flex-row flex-wrap gap-2 lg:flex-col lg:[&_.ant-checkbox-wrapper]:whitespace-nowrap'
				/>
			</Card>
		</Col>
	)
}
