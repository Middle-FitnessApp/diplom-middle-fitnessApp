import React, { useState } from 'react'
import { Layout, Typography, Button, Empty, Modal, Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import type { ProgramDay } from '../../types/nutritions'
import { mockProgramDays } from '../../mockData(удалим потом)/mockProgramDays'
import { CreateDayForm } from './components/CreateDayForm'
import { DayCard } from './components/DayCard'

const { Title } = Typography

export const NutritionPlanTrainer = () => {
  const { category, subcategory } = useParams()
  const [openedDayId, setOpenedDayId] = useState<string | null>(null)
  const [isDayFormVisible, setIsDayFormVisible] = useState(false)
  const [editingDay, setEditingDay] = useState<ProgramDay | null>(null)

  const programDays: ProgramDay[] = mockProgramDays
    .filter((day) => day.program_id === subcategory)
    .sort((a, b) => a.day_order - b.day_order)

  const handleAddDay = () => {
    setEditingDay(null)
    setIsDayFormVisible(true)
  }

  const handleEditDay = (day: ProgramDay, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingDay(day)
    setIsDayFormVisible(true)
  }

  const handleDayClick = (dayId: string) => {
    if (openedDayId === dayId) {
      setOpenedDayId(null)
    } else {
      setOpenedDayId(dayId)
    }
  }

  const handleDayFormCancel = () => {
    setIsDayFormVisible(false)
    setEditingDay(null)
  }

  const handleDayFormSubmit = (dayData: ProgramDay) => {
    console.log('Сохранение дня:', dayData)
    setIsDayFormVisible(false)
    setEditingDay(null)
  }

  return (
    <div className="page-container gradient-bg">
      <div className="page-card">
        <div className="section-header">
          <Title level={2} className="section-title">
            🍽️ Программа питания
          </Title>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="text-lg text-gray-700">
            Дни программы: <span className="font-semibold">{programDays.length}</span>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddDay}
            className="!rounded-lg !h-10"
          >
            Добавить день
          </Button>
        </div>

        {programDays.length > 0 ? (
          <div className="space-y-4">
            {programDays.map((day) => (
              <Card key={day.id} className="card-hover">
                <DayCard
                  day={day}
                  openedDayId={openedDayId}
                  onDayClick={handleDayClick}
                  onEditDay={handleEditDay}
                />
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Empty
              description="В этой программе пока нет дней"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                onClick={handleAddDay}
                className="!rounded-lg !mt-4"
              >
                Создать первый день
              </Button>
            </Empty>
          </Card>
        )}

        <Modal
          title={editingDay ? 'Редактирование дня' : 'Добавление нового дня'}
          open={isDayFormVisible}
          onCancel={handleDayFormCancel}
          footer={null}
          width={800}
          className="[&_.ant-modal-content]:rounded-xl"
        >
          <CreateDayForm
            day={editingDay}
            onSubmit={handleDayFormSubmit}
            onCancel={handleDayFormCancel}
            programDays={programDays}
          />
        </Modal>
      </div>
    </div>
  )
}