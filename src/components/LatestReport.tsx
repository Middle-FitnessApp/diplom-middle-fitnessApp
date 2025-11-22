import { Card, Row, Col, Divider, Image } from 'antd'
import type { ReactNode } from 'react'
import { Typography } from 'antd'
import { type ReportType } from '../types'

const { Text } = Typography

interface LatestReportProps {
	reports: ReportType[]
	onViewAll?: () => void
	viewAllButton?: ReactNode
}

export const LatestReport = ({ reports }: LatestReportProps) => {
	const latest = reports && reports.length ? reports[0] : null

	return (
		<Card title='Последний отчет'>
			{latest ? (
				<Row gutter={[24, 24]}>
					<Col xs={24} md={12}>
						<div className='space-y-3'>
							<Text type='secondary' className='block text-xs'>
								Дата отчета
							</Text>
							<Text className='font-medium block mb-4'>
								{new Date(latest.date).toLocaleDateString('ru-RU')}
							</Text>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Text type='secondary' className='block text-xs mb-1'>
										Вес
									</Text>
									<Text className='font-medium'>{latest.weight ?? '-'} кг</Text>
								</div>
								<div>
									<Text type='secondary' className='block text-xs mb-1'>
										Талия
									</Text>
									<Text className='font-medium'>{latest.waist ?? '-'} см</Text>
								</div>
								<div>
									<Text type='secondary' className='block text-xs mb-1'>
										Бедра
									</Text>
									<Text className='font-medium'>{latest.hips ?? '-'} см</Text>
								</div>
								<div>
									<Text type='secondary' className='block text-xs mb-1'>
										Грудь
									</Text>
									<Text className='font-medium'>{latest.chest ?? '-'} см</Text>
								</div>
								<div>
									<Text type='secondary' className='block text-xs mb-1'>
										Рука
									</Text>
									<Text className='font-medium'>{latest.arm ?? '-'} см</Text>
								</div>
								<div>
									<Text type='secondary' className='block text-xs mb-1'>
										Нога
									</Text>
									<Text className='font-medium'>{latest.leg ?? '-'} см</Text>
								</div>
							</div>

							{latest.notes && (
								<>
									<Divider />
									<div>
										<Text type='secondary' className='block text-xs mb-1'>
											Заметки
										</Text>
										<Text className='text-sm'>{latest.notes}</Text>
									</div>
								</>
							)}
						</div>
					</Col>

					<Col xs={24} md={12}>
						<div className='flex justify-center'>
							<Image
								src={latest.photoUrl || '/placeholder.svg'}
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
		</Card>
	)
}

export default LatestReport
