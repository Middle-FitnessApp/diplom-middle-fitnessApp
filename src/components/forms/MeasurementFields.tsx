import { Form, InputNumber } from 'antd'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'

export const MeasurementFields = () => (
	<>
		{PROGRESS_METRICS.map(({ nameMetric, label, min, max }) => (
			<Form.Item key={nameMetric} name={nameMetric}>
				<InputNumber placeholder={label} style={{ width: '100%' }} min={min} max={max} />
			</Form.Item>
		))}
	</>
)
