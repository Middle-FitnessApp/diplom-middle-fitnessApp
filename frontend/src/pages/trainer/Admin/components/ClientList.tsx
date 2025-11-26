import { Card, Avatar, List, Tooltip, Button } from 'antd'
import { StarFilled, StarOutlined } from '@ant-design/icons'
import type { ClientInTrainerProfile } from '../../../../types'

interface ClientListProps {
	title: string
	clients: ClientInTrainerProfile[]
	starIcon: 'filled' | 'outlined'
	onToggleStar: (clientId: string) => void
}

export const ClientList: React.FC<ClientListProps> = ({
	title,
	clients,
	starIcon,
	onToggleStar,
}) => (
	<Card
		title={<span className='text-lg font-semibold tracking-tight'>{title}</span>}
		className='shadow-lg'
		styles={{ body: { padding: '18px 14px 10px 14px', background: 'var(--bg-light)' } }}
	>
		<List
			itemLayout='horizontal'
			dataSource={clients}
			renderItem={(client) => (
				<List.Item
					className='hover:bg-blue-50 rounded-lg px-2 py-1'
					style={{ borderBottom: '1px solid var(--border)' }}
					actions={[
						client.hasNewReport ? (
							<Tooltip
								key='star'
								title='У клиента новый отчёт!'
								color='var(--info)'
								styles={{ body: { color: 'var(--highlight)' } }}
							>
								<Button
									type='default'
									size='small'
									style={{
										background: 'var(--info)',
										color: 'var(--highlight)',
										fontWeight: 600,
										fontSize: 12,
										borderRadius: 8,
										padding: '2px 12px',
										cursor: 'pointer',
										border: 'none',
									}}
									disabled
								>
									Новый отчёт
								</Button>
							</Tooltip>
						) : null,
						starIcon === 'filled' && client.starred ? (
							<StarFilled
								key='star'
								style={{ color: 'var(--warning)' }}
								onClick={() => onToggleStar(client.id)}
							/>
						) : (
							<StarOutlined key='star' onClick={() => onToggleStar(client.id)} />
						),
					]}
				>
					<List.Item.Meta
						avatar={<Avatar src={client.avatarUrl} size={32} />}
						title={<span className='font-medium text-base'>{client.name}</span>}
					/>
				</List.Item>
			)}
		/>
	</Card>
)
