import React from 'react'
import { Card, Button, Typography } from 'antd'
import {
	FileTextOutlined,
	TeamOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

export const QuickActions: React.FC = () => {
	const navigate = useNavigate()

	const actions = [
		{
			icon: <FileTextOutlined style={{ fontSize: 24 }} />,
			title: 'Планы питания',
			description: 'Управление планами',
			color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			onClick: () => navigate('/admin/nutrition'),
		},
		{
			icon: <TeamOutlined style={{ fontSize: 24 }} />,
			title: 'Все клиенты',
			description: 'Просмотр списка',
			color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
			onClick: () => {
				const element = document.getElementById('clients-section')
				element?.scrollIntoView({ behavior: 'smooth' })
			},
		},
	]

	return (
		<Card
			title={
				<span className="text-lg font-semibold">⚡ Быстрые действия</span>
			}
			className="shadow-lg mb-8"
			styles={{
				body: { padding: '16px' },
			}}
		>
			<div className="grid grid-cols-2 gap-4">
				{actions.map((action, index) => (
					<Button
						key={index}
						type="text"
						className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
						style={{
							background: action.color,
							borderRadius: '12px',
							minHeight: '100px',
						}}
						onClick={action.onClick}
					>
						<div className="text-white">{action.icon}</div>
						<Text strong className="text-white text-sm">
							{action.title}
						</Text>
						<Text className="text-white/70 text-xs">
							{action.description}
						</Text>
					</Button>
				))}
			</div>
		</Card>
	)
}

