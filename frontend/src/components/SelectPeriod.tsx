import { Row, Col, Radio, Space, type RadioChangeEvent } from 'antd'

interface Props {
	period: 'month' | 'year' | 'all'
	handlePeriodChange: (e: RadioChangeEvent) => void
}

export const SelectPeriod = ({ period, handlePeriodChange }: Props) => {
	return (
		<Row gutter={[16, 16]} className='mb-6'>
			<Col span={24}>
				<Space direction='vertical' className='w-full'>
					<Radio.Group value={period} onChange={handlePeriodChange}>
						<Space direction='horizontal'>
							<Radio.Button value='month'>Месяц</Radio.Button>
							<Radio.Button value='year'>Год</Radio.Button>
							<Radio.Button value='all'>Все время</Radio.Button>
						</Space>
					</Radio.Group>
				</Space>
			</Col>
		</Row>
	)
}
