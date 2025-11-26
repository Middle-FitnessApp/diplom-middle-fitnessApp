import { Button, Card, Empty, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { NutritionCategory, NutritionProgram } from '../../../types/nutritions'
import { DownOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons'

interface NutritionCategoryCardProps {
  category: NutritionCategory
  openedCategoryId: string | null
  onCategoryClick: (categoryId: string) => void
}

export const NutritionCategoryCard = ({
  category,
  openedCategoryId,
  onCategoryClick,
}: NutritionCategoryCardProps) => {
  const navigate = useNavigate()

  const { Meta } = Card

  const getCategoryIcon = (categoryId: string) => {
    return openedCategoryId === categoryId ? <DownOutlined /> : <RightOutlined />
  }

  const handleAddProgramClick = (category: NutritionCategory, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/admin/nutrition/${category.id}/create`)
  }

  const handleProgramClick = (
    category: NutritionCategory,
    program: NutritionProgram,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation()
    navigate(`/admin/nutrition/${category.id}/${program.id}`)
  }

  const handleCardClick = () => {
    onCategoryClick(category.id)
  }

  return (
    <Card
      hoverable
      className={`nutrition-category-card border-muted hover:shadow-lg transition-all duration-300 background-light ${
        openedCategoryId === category.id ? 'expanded' : ''
      }`}
      onClick={handleCardClick}
    >
      <Meta
        title={
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>{getCategoryIcon(category.id)}</span>
              <span className='text-custom hover-info-custom cursor-pointer'>
                {category.name}
              </span>
            </div>
            <span className='text-xs text-muted bg-gray-100 px-2 py-1 rounded-full'>
              {category.programs.length} программ
            </span>
          </div>
        }
        description={
          <div>
            <p className='text-muted text-sm mb-3'>
              {category.description || 'Описание отсутствует'}
            </p>

            {openedCategoryId === category.id && (
              <div className='mt-4 space-y-3'>
                {category.programs.length > 0 ? (
                  <>
                    {category.programs.map((program) => (
                      <div
                        key={program.id}
                        className='p-3 border border-muted rounded-lg hover:border-primary transition-colors cursor-pointer bg-white'
                        onClick={(e) => handleProgramClick(category, program, e)}
                      >
                        <div className='flex justify-between items-start mb-2'>
                          <span className='font-medium text-custom text-sm'>
                            {program.name}
                          </span>
                          <Tag color='blue' className='text-xs'>
                            {program.days_count} дней
                          </Tag>
                        </div>
                        <p className='text-muted text-xs mb-2'>{program.description}</p>
                        <div className='text-xs text-primary hover:text-info transition-colors'>
                          Перейти к дням →
                        </div>
                      </div>
                    ))}
                    <Button
                      type='dashed'
                      icon={<PlusOutlined />}
                      className='w-full mt-2'
                      onClick={(e) => handleAddProgramClick(category, e)}
                    >
                      Добавить программу
                    </Button>
                  </>
                ) : (
                  <div className='text-center py-4'>
                    <Empty
                      description='Нет программ'
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      className='mb-3'
                    />
                    <Button
                      type='dashed'
                      icon={<PlusOutlined />}
                      onClick={(e) => handleAddProgramClick(category, e)}
                    >
                      Создать первую программу
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        }
      />
    </Card>
  )
}