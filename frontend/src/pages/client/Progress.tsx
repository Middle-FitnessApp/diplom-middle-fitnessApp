import { useState } from 'react'
import { Typography, Card, Spin, Alert, Empty, Button, Space, List, Avatar, Divider, Tabs, Modal, Row, Col, Statistic } from 'antd'
import { PlusOutlined, UnorderedListOutlined, CommentOutlined, UserOutlined, LineChartOutlined, BoxPlotOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'
import { ProgressChart, ProgressTower3D } from '../../components'
import { useGetProgressReportsQuery } from '../../store/api/progress.api'
import type { ProgressReport } from '../../store/api/progress.api'

const { Title, Text } = Typography

// Интерфейс для комментария от бэкенда
interface TrainerComment {
  id: string
  text: string
  createdAt: string
  trainer: {
    id: string
    name: string
    photo?: string
  }
}

// Расширяем тип ProgressReport для включения комментариев
interface ProgressReportWithComments extends ProgressReport {
  comments?: TrainerComment[]
}

export const Progress = () => {
  const navigate = useNavigate()
  const { data: reports, isLoading, error, refetch } = useGetProgressReportsQuery()
  const [activeTab, setActiveTab] = useState<string>('2d')
  const [selectedReport, setSelectedReport] = useState<(ProgressReport & { index: number }) | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  if (isLoading) {
    return (
      <div className="gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start">
        <div className="bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start">
        <div className="bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]">
          <Alert 
            message="Ошибка загрузки" 
            description="Не удалось загрузить данные о прогрессе"
            type="error" 
            showIcon
            action={
              <Button size="small" onClick={() => refetch()}>
                Повторить
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  // Преобразуем данные для графика
  const chartData = (reports || []).map(item => ({
    date: item.date.split('T')[0],
    weight: item.weight,
    waist: item.waist,
    hips: item.hips,
    chest: item.chest || 0,
    arm: item.arm || 0,
    leg: item.leg || 0,
  }))

  // Собираем все комментарии от тренера из всех отчётов
  const allComments: (TrainerComment & { reportDate: string })[] = []
  ;(reports as ProgressReportWithComments[] || []).forEach(report => {
    if (report.comments && report.comments.length > 0) {
      report.comments.forEach(comment => {
        allComments.push({
          ...comment,
          reportDate: report.date,
        })
      })
    }
  })

  // Сортируем комментарии по дате (новые первыми)
  allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  const formatDateTime = (isoDate: string): string => {
    const date = new Date(isoDate)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year} ${hours}:${minutes}`
  }

  const handleBlockClick = (data: { date: string; weight?: number; waist?: number; hips?: number; chest?: number; arm?: number; leg?: number }, index: number) => {
    // Находим полный отчет по дате
    const fullReport = reports?.find(report => report.date.split('T')[0] === data.date)
    if (fullReport) {
      setSelectedReport({ ...fullReport, index })
      setIsModalVisible(true)
    }
  }

  const handleModalClose = () => {
    setIsModalVisible(false)
    setSelectedReport(null)
  }

  return (
    <div className='gradient-bg min-h-[calc(100vh-4rem)] p-6 flex justify-center items-start'>
      <div className='bg-light rounded-2xl p-8 shadow-xl border border-gray-200 w-full max-w-[1600px]'>
        <div className='text-center mb-6'>
          <Title level={2} className='text-gray-800 font-semibold mb-3 pb-2 border-b-3 border-primary inline-block'>
            📈 Ваш прогресс
          </Title>
        </div>

        {/* Кнопки действий */}
        <div className='mb-5'>
          <Space size="middle" wrap>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/me/progress/new-report')}
            >
              Добавить прогресс
            </Button>
            <Button 
              icon={<UnorderedListOutlined />}
              size="large"
              onClick={() => navigate('/me/progress/reports')}
            >
              Все отчёты
            </Button>
          </Space>
        </div>

        {chartData.length === 0 ? (
          <Empty 
            description="Нет данных о прогрессе"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text type="secondary" className="block mb-4">
              Добавьте свой первый отчёт о прогрессе, чтобы отслеживать изменения
            </Text>
          </Empty>
        ) : (
          <>
            {/* Переключатель между 2D и 3D */}
            <Card className='!border !border-gray-200 mb-6' bodyStyle={{ padding: '16px' }}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size="large"
                items={[
                  {
                    key: '2d',
                    label: (
                      <span>
                        <LineChartOutlined /> 2D График
                      </span>
                    ),
                    children: (
                      <ProgressChart
                        data={chartData}
                        metrics={PROGRESS_METRICS}
                        chartTitle='График прогресса'
                      />
                    ),
                  },
                  {
                    key: '3d',
                    label: (
                      <span>
                        <BoxPlotOutlined /> 3D Башня прогресса
                      </span>
                    ),
                    children: (
                      <ProgressTower3D 
                        data={chartData} 
                        onBlockClick={handleBlockClick}
                      />
                    ),
                  },
                ]}
              />
            </Card>

            {/* Модальное окно с деталями отчета */}
            <Modal
              title={
                <Space>
                  <TrophyOutlined style={{ color: '#1890ff' }} />
                  <span>Отчет #{(selectedReport?.index ?? 0) + 1}</span>
                </Space>
              }
              open={isModalVisible}
              onCancel={handleModalClose}
              width={600}
              footer={[
                <Button key="close" type="primary" onClick={handleModalClose}>
                  Закрыть
                </Button>,
              ]}
            >
              {selectedReport && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* Дата */}
                  <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #adc6ff' }}>
                    <Space>
                      <CalendarOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: '#595959' }}>Дата отчета</Text>
                        <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                          {new Date(selectedReport.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Text>
                      </div>
                    </Space>
                  </Card>

                  {/* Метрики */}
                  <div>
                    <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '12px' }}>
                      📊 Измерения
                    </Text>
                    <Row gutter={[16, 16]}>
                      {selectedReport.weight && (
                        <Col xs={12} sm={8}>
                          <Card size="small" hoverable>
                            <Statistic
                              title="⚖️ Вес"
                              value={selectedReport.weight}
                              suffix="кг"
                              valueStyle={{ color: '#3f8600', fontSize: '20px' }}
                            />
                          </Card>
                        </Col>
                      )}
                      {selectedReport.waist && (
                        <Col xs={12} sm={8}>
                          <Card size="small" hoverable>
                            <Statistic
                              title="📏 Талия"
                              value={selectedReport.waist}
                              suffix="см"
                              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                            />
                          </Card>
                        </Col>
                      )}
                      {selectedReport.hips && (
                        <Col xs={12} sm={8}>
                          <Card size="small" hoverable>
                            <Statistic
                              title="📐 Бедра"
                              value={selectedReport.hips}
                              suffix="см"
                              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                            />
                          </Card>
                        </Col>
                      )}
                      {selectedReport.chest && selectedReport.chest > 0 && (
                        <Col xs={12} sm={8}>
                          <Card size="small" hoverable>
                            <Statistic
                              title="💪 Грудь"
                              value={selectedReport.chest}
                              suffix="см"
                              valueStyle={{ color: '#eb2f96', fontSize: '20px' }}
                            />
                          </Card>
                        </Col>
                      )}
                      {selectedReport.arm && selectedReport.arm > 0 && (
                        <Col xs={12} sm={8}>
                          <Card size="small" hoverable>
                            <Statistic
                              title="💪 Рука"
                              value={selectedReport.arm}
                              suffix="см"
                              valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                            />
                          </Card>
                        </Col>
                      )}
                      {selectedReport.leg && selectedReport.leg > 0 && (
                        <Col xs={12} sm={8}>
                          <Card size="small" hoverable>
                            <Statistic
                              title="🦵 Нога"
                              value={selectedReport.leg}
                              suffix="см"
                              valueStyle={{ color: '#13c2c2', fontSize: '20px' }}
                            />
                          </Card>
                        </Col>
                      )}
                    </Row>
                  </div>

                  {/* Позиция в башне */}
                  <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                    <Space>
                      <TrophyOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Позиция в башне</Text>
                        <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                          Этаж #{(selectedReport?.index ?? 0) + 1} из {chartData.length}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Space>
              )}
            </Modal>

            {/* Комментарии тренера */}
            {allComments.length > 0 && (
              <>
                <Divider />
                <div className='mt-6'>
                  <Title level={4} className='flex items-center gap-2 mb-4'>
                    <CommentOutlined />
                    Комментарии тренера
                  </Title>
                  <List
                    itemLayout="horizontal"
                    dataSource={allComments.slice(0, 5)} // Показываем последние 5 комментариев
                    renderItem={(comment) => (
                      <List.Item className='!border-b !border-gray-100'>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              src={comment.trainer.photo} 
                              icon={!comment.trainer.photo && <UserOutlined />}
                              size="large"
                            />
                          }
                          title={
                            <div className='flex items-center justify-between flex-wrap gap-2'>
                              <Text strong>{comment.trainer.name}</Text>
                              <Text type="secondary" className="text-xs">
                                {formatDateTime(comment.createdAt)}
                              </Text>
                            </div>
                          }
                          description={
                            <div>
                              <Text className="text-gray-700">{comment.text}</Text>
                              <div className="mt-1">
                                <Text type="secondary" className="text-xs">
                                  К отчёту от {formatDate(comment.reportDate)}
                                </Text>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                  {allComments.length > 5 && (
                    <div className="text-center mt-4">
                      <Button 
                        type="link" 
                        onClick={() => navigate('/me/progress/reports')}
                      >
                        Смотреть все комментарии ({allComments.length})
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}