import { MeasurementFields } from '../../components/forms'
import { Form, Layout, Typography, DatePicker, Button, Card } from 'antd'

export const AddProgress = () => {
	const { Title } = Typography
	const [form] = Form.useForm()

	const onFinish = (values: any) => {
		console.log('тут будет запрос', values)
	}

	const onFinishFailed = () => {
		console.log('тут будет ошибка')
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card' style={{ maxWidth: '600px' }}>
				<Card className=' !border-gray-200'>
					<div className='section-header'>
						<Title level={2} className='section-title'>
							📊 Добавить прогресс
						</Title>
					</div>

					<Form
						form={form}
						onFinish={onFinish}
						onFinishFailed={onFinishFailed}
						autoComplete='off'
						layout='vertical'
						size='large'
					>
						<Form.Item
							name='measurementDate'
							label='Дата замера'
							rules={[{ required: true, message: 'Пожалуйста, выберите дату!' }]}
						>
							<DatePicker
								format='DD.MM.YYYY'
								style={{ width: '100%' }}
								placeholder='Выберите дату'
								className='rounded-lg'
							/>
						</Form.Item>

						<MeasurementFields />

						<Form.Item className='!mb-0'>
							<Button
								type='primary'
								htmlType='submit'
								block
								className='!h-12 !rounded-lg !text-base !font-semibold'
							>
								Добавить замеры
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		</div>
	)
}
