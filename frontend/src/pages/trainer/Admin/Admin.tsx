import React, { useState } from 'react'
import { Layout, Button, Typography } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { ClientList, TrainerInfo, TrainerSidebar } from './components'
import { mockClients } from './mock-data'

const { Title } = Typography
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
    <div className="gradient-bg">
      <Layout className="admin-layout bg-transparent" style={{ minHeight: '100vh' }}>
        <Sider
          width={sidebarCollapsed ? 80 : 300}
          collapsed={sidebarCollapsed}
          className="admin-sidebar"
          theme="light"
        >
          <div className="p-4 border-b border-gray-200">
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 18 }} />}
              onClick={handleToggleSidebar}
              className="w-full flex items-center justify-center"
            >
              {!sidebarCollapsed && <span className="ml-2">Свернуть</span>}
            </Button>
          </div>
          
          {!sidebarCollapsed && (
            <div className="p-4">
              <TrainerSidebar
                clients={mockClients.map((client) => ({
                  ...client,
                  starred: starredClients.includes(client.id),
                }))}
                onToggleStar={handleToggleStar}
              />
            </div>
          )}
        </Sider>

        <Content className="admin-content p-6" style={{ overflow: 'auto' }}>
          <div className="admin-page-card h-full">
            <div className="section-header">
              <Title level={2} className="section-title">
                🏢 Панель тренера
              </Title>
            </div>

            <TrainerInfo />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <ClientList
                title="⭐ Клиенты в работе"
                clients={workingClients}
                starIcon="filled"
                onToggleStar={handleToggleStar}
              />
              <ClientList
                title="👥 Новые клиенты"
                clients={newClients}
                starIcon="outlined"
                onToggleStar={handleToggleStar}
              />
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  )
}