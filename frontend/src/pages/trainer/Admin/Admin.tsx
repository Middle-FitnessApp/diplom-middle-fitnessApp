import React, { useState } from 'react'
import { Layout, Button } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { ClientList, TrainerInfo, TrainerSidebar } from './components'
import { mockClients } from './mock-data'
const { Content, Sider } = Layout

export const Admin: React.FC = () => {
	const filterStarClients = () =>
		mockClients.filter((client) => client.starred).map((client) => client.id)

	const [starredClients, setStarredClients] = useState<string[]>(filterStarClients())

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
	const workingClients = mockClients
		.filter((client) => starredClients.includes(client.id))
		.map((client) => ({ ...client, starred: true }))

	const newClients = mockClients
		.filter((client) => !starredClients.includes(client.id))
		.map((client) => ({ ...client, starred: false }))

	const handleToggleSidebar = () => setSidebarCollapsed((prev) => !prev)

	const handleToggleStar = (clientId: string) => {
		setStarredClients((prev) =>
			prev.includes(clientId)
				? prev.filter((id) => id !== clientId)
				: [...prev, clientId],
		)
	}

	return (
		<Layout
			style={{
				minHeight: 'calc(100vh - 4rem)',
			}}
		>
			<Layout>
				<Sider
					width={sidebarCollapsed ? 64 : 280}
					collapsed={sidebarCollapsed}
					style={{
						background: 'var(--bg-light)',
						borderRight: sidebarCollapsed ? 'none' : '1px solid var(--border-muted)',
						boxShadow: sidebarCollapsed ? 'none' : '1px 22px 15px 5px rgba(0, 0, 0, 0.5)',
					}}
					className='px-2 relative border-r border-(--border-muted) pt-14 overflow-auto'
				>
					<Button
						type='text'
						shape='circle'
						icon={
							<MenuOutlined
								style={{
									fontSize: sidebarCollapsed ? 32 : 18,
								}}
							/>
						}
						onClick={handleToggleSidebar}
						style={{
							position: 'absolute',
							left: sidebarCollapsed ? 16 : 16,
							top: 8,
							zIndex: 10,
							border: 'var(--border)',
							background: 'transparent',
						}}
					/>
					{!sidebarCollapsed && (
						<TrainerSidebar
							clients={mockClients.map((client) => ({
								...client,
								starred: starredClients.includes(client.id),
							}))}
							onToggleStar={handleToggleStar}
						/>
					)}
				</Sider>
				<Content className='bg-gray-50 flex flex-col items-center px-10 py-8'>
					<div className='w-full max-w-4xl'>
						<TrainerInfo />
						<div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-8'>
							<ClientList
								title='Клиенты в работе'
								clients={workingClients}
								starIcon='filled'
								onToggleStar={handleToggleStar}
							/>
							<ClientList
								title='Новые клиенты'
								clients={newClients}
								starIcon='outlined'
								onToggleStar={handleToggleStar}
							/>
						</div>
					</div>
				</Content>
			</Layout>
		</Layout>
	)
}
