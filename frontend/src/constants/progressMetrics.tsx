import { COMMON_FIELDS } from './accountFields'

export type ProgressMetric = {
	label: string
	color: string
	nameMetric: keyof typeof COMMON_FIELDS
	min: number
	max: number
}

export const PROGRESS_METRICS = [
	{
		label: COMMON_FIELDS.weight,
		color: '#f5222d',
		nameMetric: 'weight',
		min: 20,
		max: 200,
	},
	{
		label: COMMON_FIELDS.waist,
		color: '#1890ff',
		nameMetric: 'waist',
		min: 40,
		max: 200,
	},
	{
		label: COMMON_FIELDS.hips,
		color: '#52c41a',
		nameMetric: 'hips',
		min: 50,
		max: 200,
	},
	{
		label: COMMON_FIELDS.chest,
		color: '#faad14',
		nameMetric: 'chest',
		min: 50,
		max: 200,
	},
	{
		label: COMMON_FIELDS.arm,
		color: '#722ed1',
		nameMetric: 'arm',
		min: 10,
		max: 100,
	},
	{
		label: COMMON_FIELDS.leg,
		color: '#722e00',
		nameMetric: 'leg',
		min: 20,
		max: 150,
	},
] as const
