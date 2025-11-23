import type { FC } from 'react'
import 'antd/dist/reset.css'
import type { ReportType } from '../../types'

const mockReport: ReportType = {
	id: '1',
	date: '15.04.2024',
	weight: 74,
	waist: 81,
	chest: 80,
	hips: 74,
	leg: 70,
	arm: 40,
	photoUrl: undefined,
}

export const Report: FC<{ report?: ReportType }> = ({ report = mockReport }) => {
	return (
		<div
			className='min-h-screen flex items-center justify-center p-6'
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
						<span className='font-semibold text-xl mr-4' style={{ color: 'var(--text)' }}>
							Ваш отчет за {report.date}
						</span>
					</div>
				</div>
				<div className='px-8 pt-8 pb-8 flex flex-col items-center w-full'>
					<div
						className='rounded-lg shadow-sm mb-10'
						style={{
							background: 'var(--bg)',
							border: '1px solid var(--border-muted)',
							padding: '1.5rem 2.5rem',
							color: 'var(--text)',
						}}
					>
						<div className='grid grid-cols-2 gap-x-8 gap-y-2 text-base'>
							<div>Вес: {report.weight}</div>
							<div>Обхват бедер: {report.hips}</div>
							<div>Обхват талии: {report.waist}</div>
							<div>Обхват ноги: {report.leg}</div>
							<div>Обхват груди: {report.chest}</div>
							<div>Обхват руки: {report.arm}</div>
						</div>
					</div>

					<div className='flex justify-center items-center mb-8'>
						{report.photoUrl ? (
							<img
								src={report.photoUrl}
								alt='Фото отчета'
								className='w-32 h-32 object-cover rounded-full border'
								style={{
									borderColor: 'var(--border-muted)',
									background: 'var(--bg-dark)',
								}}
							/>
						) : (
							<div
								className='w-32 h-32 flex items-center justify-center rounded-full border'
								style={{
									borderColor: 'var(--border-muted)',
									background: 'var(--bg-dark)',
									fontSize: '3rem',
									color: 'var(--text-muted)',
								}}
							>
								<span role='img' aria-label='Нет фото'>
									🙂
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
