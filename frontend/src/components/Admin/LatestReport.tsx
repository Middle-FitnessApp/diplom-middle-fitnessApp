import { Row, Col, Image } from 'antd'
import { Typography } from 'antd'
import { buildPhotoUrl } from '../../utils/buildPhotoUrl'
import type { ProgressReport } from '../../store/types/progress.types'

const { Text, Title } = Typography

interface LatestReportProps {
	reports: ProgressReport | null
	photo: string | null
}

export const LatestReport = ({ reports, photo }: LatestReportProps) => {
	const photoUrl = buildPhotoUrl(photo)

	return (
		<>
			<div className='mb-8'>
				<Title level={4} className='m-0 mb-4'>
					Последний отчет
				</Title>
			</div>
			<div>
				{reports ? (
					<Row gutter={[24, 24]}>
						<Col xs={24} md={12}>
							<div className='space-y-3'>
								<Text type='secondary' className='block text-xs'>
									Дата отчета
								</Text>
								<Text className='font-medium block mb-4'>
									{new Date(reports.date).toLocaleDateString('ru-RU')}
								</Text>

								<div className='grid grid-cols-2 gap-4'>
									<div>
										<Text type='secondary' className='block text-xs mb-1'>
											Вес
										</Text>
										<Text className='font-medium'>{reports.weight ?? '-'} кг</Text>
									</div>
									<div>
										<Text type='secondary' className='block text-xs mb-1'>
											Талия
										</Text>
										<Text className='font-medium'>{reports.waist ?? '-'} см</Text>
									</div>
									<div>
										<Text type='secondary' className='block text-xs mb-1'>
											Бедра
										</Text>
										<Text className='font-medium'>{reports.hips ?? '-'} см</Text>
									</div>
									<div>
										<Text type='secondary' className='block text-xs mb-1'>
											Грудь
										</Text>
										<Text className='font-medium'>{reports.chest ?? '-'} см</Text>
									</div>
									<div>
										<Text type='secondary' className='block text-xs mb-1'>
											Рука
										</Text>
										<Text className='font-medium'>{reports.arm ?? '-'} см</Text>
									</div>
									<div>
										<Text type='secondary' className='block text-xs mb-1'>
											Нога
										</Text>
										<Text className='font-medium'>{reports.leg ?? '-'} см</Text>
									</div>
								</div>

								{/* Если появятся заметки, то можно будет добавить эту часть обратно */}
								{/* {reports.notes && (
								<>
									<Divider />
									<div>
										<Text type='secondary' className='block text-xs mb-1'>
											Заметки
										</Text>
										<Text className='text-sm'>{reports.notes}</Text>
									</div>
								</>
							)} */}
							</div>
						</Col>

						<Col xs={24} md={12}>
							<div className='flex justify-center'>
								<Image
									src={photoUrl}
									alt='Отчет фото'
									width={180}
									height={180}
									style={{ borderRadius: 8, objectFit: 'cover' }}
								/>
							</div>
						</Col>
					</Row>
				) : (
					<div style={{ marginTop: 32, marginBottom: 32 }}>
						<Text type='secondary'>Нет отчетов</Text>
					</div>
				)}
			</div>
		</>
	)
}

export default LatestReport
