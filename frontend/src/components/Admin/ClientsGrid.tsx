import React from 'react'
import { Empty, Typography, Input, Select, Row, Col } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { ClientCard } from './ClientCard'

const { Text, Title } = Typography
const { Option } = Select

interface Client {
	id: string
	name: string
	avatarUrl?: string
	isFavorite: boolean
	hasNewReport?: boolean
	email?: string | null
	phone?: string | null
	age?: number
}

interface ClientsGridProps {
	title: string
	clients: Client[]
	onToggleStar: (clientId: string) => void
	showSearch?: boolean
	searchValue?: string
	onSearchChange?: (value: string) => void
	filterValue?: string
	onFilterChange?: (value: string) => void
	emptyText?: string
	compact?: boolean
}

export const ClientsGrid: React.FC<ClientsGridProps> = ({
	title,
	clients,
	onToggleStar,
	showSearch = false,
	searchValue = '',
	onSearchChange,
	filterValue = 'all',
	onFilterChange,
	emptyText = 'Нет клиентов',
	compact = false,
}) => {
	return (
		<div className="mb-8">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
				<Title level={4} className="!mb-0" style={{ color: 'var(--text)' }}>
					{title}
					<Text type="secondary" className="ml-2 text-base font-normal">
						({clients.length})
					</Text>
				</Title>

				{showSearch && (
					<div className="flex gap-3">
						<Input
							placeholder="Поиск по имени..."
							prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
							value={searchValue}
							onChange={(e) => onSearchChange?.(e.target.value)}
							style={{ width: 200, borderRadius: '8px' }}
							allowClear
						/>
						<Select
							value={filterValue}
							onChange={onFilterChange}
							style={{ width: 150, borderRadius: '8px' }}
						>
							<Option value="all">Все клиенты</Option>
							<Option value="favorites">Избранные</Option>
							<Option value="recent">Недавние</Option>
						</Select>
					</div>
				)}
			</div>

			{/* Grid */}
			{clients.length === 0 ? (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<Text type="secondary">{emptyText}</Text>}
					className="py-8"
				/>
			) : compact ? (
				<Row gutter={[12, 12]}>
					{clients.map((client) => (
						<Col key={client.id} xs={24} sm={12} md={8} lg={6}>
							<ClientCard
								client={client}
								onToggleStar={onToggleStar}
								compact
							/>
						</Col>
					))}
				</Row>
			) : (
				<Row gutter={[16, 16]}>
					{clients.map((client) => (
						<Col key={client.id} xs={24} sm={12} lg={8} xl={6}>
							<ClientCard
								client={client}
								onToggleStar={onToggleStar}
							/>
						</Col>
					))}
				</Row>
			)}
		</div>
	)
}

