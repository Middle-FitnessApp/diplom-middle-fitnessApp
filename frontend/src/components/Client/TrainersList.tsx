import React from 'react'
import { Row, Col, Empty, Spin, Typography } from 'antd'
import { TrainerCard } from './TrainerCard'
import type { TrainerListItem } from '../../store/types/user.types'

const { Text } = Typography

type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | null

interface TrainersListProps {
	trainers: TrainerListItem[]
	loading?: boolean
	onSelectTrainer: (trainerId: string) => void
	onCancelInvite?: (trainerId: string) => void
	selectingTrainerId?: string | null
	// Карта статусов приглашений: trainerId -> status
	inviteStatuses?: Record<string, InviteStatus>
}

export const TrainersList: React.FC<TrainersListProps> = ({
	trainers,
	loading = false,
	onSelectTrainer,
	onCancelInvite,
	selectingTrainerId,
	inviteStatuses = {},
}) => {
	if (loading) {
		return (
			<div className='flex justify-center items-center py-20'>
				<Spin size='large' />
			</div>
		)
	}

	if (trainers.length === 0) {
		return (
			<Empty
				description={
					<Text type='secondary' style={{ fontSize: 16 }}>
						Пока нет доступных тренеров
					</Text>
				}
				style={{ padding: '60px 0' }}
			/>
		)
	}

	return (
		<Row gutter={[24, 24]}>
			{trainers.map((trainer) => (
				<Col xs={24} sm={12} lg={8} xl={6} key={trainer.id}>
					<TrainerCard
						trainer={trainer}
						inviteStatus={inviteStatuses[trainer.id]}
						onSelect={onSelectTrainer}
						onCancelInvite={onCancelInvite}
						loading={selectingTrainerId === trainer.id}
					/>
				</Col>
			))}
		</Row>
	)
}
