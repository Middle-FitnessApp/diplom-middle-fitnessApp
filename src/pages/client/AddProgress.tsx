import { MeasurementFields } from '../../components/forms'
import { Form, Layout, Typography, DatePicker, Button } from 'antd'

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
		<Layout style={{ padding: '24px', minHeight: '100vh' }}>
			<Layout.Content
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '16px',
				}}
			>
				<Title level={3}>Добавить прогресс</Title>

				<Form
					form={form}
					style={{ maxWidth: 700 }}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
					autoComplete='off'
					layout='vertical'
				>
					<Form.Item
						name='measurementDate'
						rules={[{ required: true, message: 'Пожалуйста, выберите дату!' }]}
					>
						<DatePicker
							format='DD.MM.YYYY'
							style={{ width: '100%' }}
							placeholder='Выберите дату'
						/>
					</Form.Item>

					<MeasurementFields />

					<Form.Item>
						<Button type='primary' htmlType='submit' style={{ width: '100%' }}>
							Добавить замеры
						</Button>
					</Form.Item>
				</Form>
			</Layout.Content>
		</Layout>
	)
}
