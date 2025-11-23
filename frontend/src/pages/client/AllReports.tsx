import { useState } from 'react'
import { Card, Pagination, Select } from 'antd'
import type { FC } from 'react'
import 'antd/dist/reset.css'
import type { ReportType } from '../../types'

const periodOptions = [
	{ label: 'Месяц', value: 'month' },
	{ label: 'Год', value: 'year' },
	{ label: 'Все время', value: 'all' },
	{ label: 'Выбрать интервал', value: 'custom' },
]

const reportsMock: ReportType[] = Array.from({ length: 12 }, (_, index) => ({
	id: String(index + 1),
	date: '15.04.2024',
	weight: 74,
	waist: 81,
	chest: 80,
	hips: 74,
	leg: 70,
	arm: 40,
	photoUrl: undefined,
}))

export const AllReports: FC = () => {
	const [page, setPage] = useState(1)
	const [period, setPeriod] = useState('month')
	const pageSize = 5

	const filteredReports = reportsMock

	const handlePeriodChange = (value: string) => {
		setPeriod(value)
		setPage(1)
	}

	const handlePageChange = (value: number) => setPage(value)

	return (
		<div
			className='min-h-screen flex items-center justify-center py-6'
			style={{ background: 'var(--bg)' }}
		>
			<div
				className='w-full max-w-3xl rounded-xl shadow'
				style={{
					background: 'var(--bg-light)',
					border: '1px solid var(--border-muted)',
				}}
			>
				<div className='border-b' style={{ borderColor: 'var(--border-muted)' }}>
					<div className='flex items-center px-8 py-6'>
						<span
							className='font-semibold text-2xl mr-4'
							style={{ color: 'var(--text)' }}
						>
							Ваши отчеты за:
						</span>
						<Select
							options={periodOptions}
							value={period}
							onChange={handlePeriodChange}
							popupMatchSelectWidth={false}
							className='w-40'
							style={{
								background: 'var(--bg)',
								borderColor: 'var(--border)',
								color: 'var(--text)',
							}}
						/>
					</div>
				</div>
				<div className='px-8 py-6 flex flex-col ' style={{ gap: '0.5rem' }}>
					{filteredReports.slice((page - 1) * pageSize, page * pageSize).map((report) => (
						<Card
							key={report.id}
							className='rounded-lg border transition hover:shadow-sm cursor-pointer bg-(--bg)'
							style={{
								borderColor: 'var(--border-muted)',
								background: 'var(--bg)',
							}}
							styles={{
								body: {
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									padding: '1.25rem',
									background: 'var(--bg)',
								},
							}}
							variant='borderless'
							tabIndex={0}
							onClick={() => (window.location.href = `/me/progress/reports/${report.id}`)}
						>
							<div>
								<div
									className='mb-1'
									style={{
										color: 'var(--text-muted)',
										fontSize: '1rem',
										fontWeight: 500,
									}}
								>
									{report.date}
								</div>
								<ul
									className='text-base space-y-1'
									style={{ color: 'var(--text)', fontFamily: 'inherit' }}
								>
									<li>Вес: {report.weight}</li>
									<li>Обхват талии: {report.waist}</li>
									<li>Обхват груди: {report.chest}</li>
									<li>Обхват бедер: {report.hips}</li>
									<li>Обхват ноги: {report.leg}</li>
									<li>Обхват руки: {report.arm}</li>
								</ul>
							</div>
							<div>
								{report.photoUrl ? (
									<img
										src={report.photoUrl}
										alt='Фото отчета'
										className='w-20 h-20 object-cover rounded-full border'
										style={{
											borderColor: 'var(--border)',
											background: 'var(--bg-dark)',
										}}
									/>
								) : (
									<div
										className='w-20 h-20 flex items-center justify-center rounded-full border'
										style={{
											borderColor: 'var(--border-muted)',
											background: 'var(--bg-dark)',
											fontSize: '2.5rem',
											color: 'var(--text-muted)',
										}}
									>
										<span role='img' aria-label='Нет фото'>
											🙂
										</span>
									</div>
								)}
							</div>
						</Card>
					))}
				</div>
				<div className='pb-8 flex justify-center'>
					<Pagination
						current={page}
						pageSize={pageSize}
						total={filteredReports.length}
						onChange={handlePageChange}
						showSizeChanger={false}
						style={{
							background: 'transparent',
							color: 'var(--text)',
						}}
						itemRender={(page, type, originalElement) => (
							<span
								style={{
									color: 'var(--text)',
									background: 'var(--bg)',
									borderColor: 'var(--border-muted)',
								}}
							>
								{originalElement}
							</span>
						)}
					/>
				</div>
			</div>
		</div>
	)
}
