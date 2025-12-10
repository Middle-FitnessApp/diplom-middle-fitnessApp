import { Typography, Card, Spin, Alert, Empty, Button, Space, List, Avatar, Divider } from 'antd'
import { PlusOutlined, UnorderedListOutlined, CommentOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'
import { ProgressChart } from '../../components'
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

  return (
    <div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
      <div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
        <div className='text-center mb-8'>
          <Title level={2} className='text-gray-800 font-semibold mb-4 pb-3 border-b-3 border-primary inline-block'>
            📈 Ваш прогресс
          </Title>
        </div>

        {/* Кнопки действий */}
        <div className='mb-6'>
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
            {/* График прогресса */}
            <Card className='!border !border-gray-200 mb-6'>
              <ProgressChart
                data={chartData}
                metrics={PROGRESS_METRICS}
                chartTitle='График прогресса'
              />
            </Card>

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