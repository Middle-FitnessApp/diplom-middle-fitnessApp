import { Typography } from 'antd'
import { useThemeClasses } from '../../hooks/useThemeClasses'
import type { ProgressReport } from '../../store/types/progress.types'

const { Title } = Typography

interface MeasurementsCardProps {
	report: ProgressReport
}

export const MeasurementsCard = ({ report }: MeasurementsCardProps) => {
	const classes = useThemeClasses()

	return (
		<div className={`rounded-xl p-6 border ${classes.border} ${classes.textLight} `}>
			<Title level={4} className='mb-4'>
				Измерения
			</Title>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-lg'>
				<div className={`flex justify-between py-2 border-b ${classes.border}`}>
					<span className={`font-semibold ${classes.textSecondary}`}>Вес:</span>
					<span className={`${classes.textLight}`}>{report.weight} кг</span>
				</div>
				<div className={`flex justify-between py-2 border-b ${classes.border}`}>
					<span className={`font-semibold ${classes.textSecondary}`}>Талия:</span>
					<span className={`${classes.textLight}`}>{report.waist} см</span>
				</div>
				<div className={`flex justify-between py-2 border-b ${classes.border}`}>
					<span className={`font-semibold ${classes.textSecondary}`}>Бёдра:</span>
					<span className={`${classes.textLight}`}>{report.hips} см</span>
				</div>

				{report.height && (
					<div className={`flex justify-between py-2 border-b ${classes.border}`}>
						<span className={`font-semibold ${classes.textSecondary}`}>Рост:</span>
						<span className={`${classes.textLight}`}>{report.height} см</span>
					</div>
				)}
				{report.chest && (
					<div className={`flex justify-between py-2 border-b ${classes.border}`}>
						<span className={`font-semibold ${classes.textSecondary}`}>Грудь:</span>
						<span className={`${classes.textLight}`}>{report.chest} см</span>
					</div>
				)}
				{report.arm && (
					<div className={`flex justify-between py-2 border-b ${classes.border}`}>
						<span className={`font-semibold ${classes.textSecondary}`}>Рука:</span>
						<span className={`${classes.textLight}`}>{report.arm} см</span>
					</div>
				)}
				{report.leg && (
					<div className={`flex justify-between py-2 border-b ${classes.border}`}>
						<span className={`font-semibold ${classes.textSecondary}`}>Нога:</span>
						<span className={`${classes.textLight}`}>{report.leg} см</span>
					</div>
				)}
			</div>
		</div>
	)
}
