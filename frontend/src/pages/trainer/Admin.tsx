// src/pages/Admin/Admin.tsx
import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import { Layout, Button, Typography, Spin } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { ClientList, TrainerInfo, TrainerSidebar } from '../../components/Admin'
import { useGetClientsQuery, useToggleClientStarMutation } from '../../store/api/trainer.api'
import { useGetMeQuery } from '../../store/api/user.api'
import { toggleSidebar } from '../../store/slices/ui.slice'

const { Title } = Typography
const { Content, Sider } = Layout

export const Admin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()

  // текущий пользователь (для проверки загрузки)
  const { data: meData, isLoading: isLoadingMe } = useGetMeQuery()
  const trainerId = meData?.user.id

  // клиенты тренера с сервера (все CLIENT с флагом starred)
  const { 
    data: clients = [], 
    isLoading: isLoadingClients, 
    isError 
  } = useGetClientsQuery()
  const [toggleStarMutation] = useToggleClientStarMutation()

  const sidebarCollapsed = useSelector(
    (state: RootState) => state.ui.isSidebarOpen === false
  )

  const handleToggleSidebar = () => dispatch(toggleSidebar())

  const handleToggleStar = async (clientId: string) => {
    try {
      await toggleStarMutation({ clientId }).unwrap()
    } catch (error) {
      console.error('Ошибка переключения starred:', error)
    }
  }

  // разделяем на "в работе" и "новые" по серверному starred
  const { workingClients, newClients, sidebarClients } = useMemo(() => {
    const withStarFlag = clients.map((client) => ({
      ...client,
      starred: Boolean(client.starred), // гарантируем boolean
    }))

    const working = withStarFlag.filter((c) => c.starred)
    const fresh = withStarFlag.filter((c) => !c.starred)

    return {
      workingClients: working,
      newClients: fresh,
      sidebarClients: withStarFlag,
    }
  }, [clients])

  // загрузка
  if (isLoadingMe || isLoadingClients) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  // ошибка API
  if (isError) {
    return (
      <div className="p-6 text-red-500 text-center">
        Не удалось загрузить клиентов тренера
      </div>
    )
  }

  // нет тренера
  if (!trainerId) {
    return (
      <div className="p-6 text-red-500 text-center">
        Не удалось определить тренера
      </div>
    )
  }

  return (
    <div className="gradient-bg" >
      <Layout className="admin-layout bg-transparent" 
>
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
                clients={sidebarClients}
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
