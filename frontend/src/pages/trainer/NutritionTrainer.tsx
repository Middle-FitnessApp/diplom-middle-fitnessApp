import { useState } from 'react'
import { Typography, Button, Empty, message, Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockCategories } from '../../mockData(удалим потом)/mockNutritionCategories'
import { NutritionCategoryCard } from './components/NutritionCategoryCard'
import { ModalForCreateCategory } from './components/ModalForCreateCategory'

const { Title } = Typography

export const NutritionTrainer = () => {
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const [openedCategoryId, setOpenedCategoryId] = useState<string | null>(null)

	const categories = mockCategories

	const showModal = () => {
		setIsModalVisible(true)
	}

	const handleCancel = () => {
		setIsModalVisible(false)
		setNewCategoryName('')
	}

	const handleCreateCategory = () => {
		if (!newCategoryName.trim()) {
			message.error('Введите название категории')
			return
		}
		// запрос на создание категории
		setIsModalVisible(false)
		setNewCategoryName('')
		message.success('Категория создана успешно')
	}

	const handleCategoryClick = (categoryId: string) => {
		setOpenedCategoryId((prev) => (prev === categoryId ? null : categoryId))
	}

	return (
		<div className='page-container gradient-bg '>
			<div className='page-card'>
				<div className='section-header'>
					<Title level={2} className='section-title'>
						📚 Библиотека планов питания
					</Title>
				</div>

				<div className='flex justify-between items-center mb-8'>
					<div className='text-lg text-gray-700'>Управляйте вашими планами питания</div>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={showModal}
						className='!rounded-lg !h-10'
					>
						Добавить категорию
					</Button>
				</div>

				{categories.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{categories.map((category) => (
							<div key={category.id} className='nutrition-category-wrapper'>
								<NutritionCategoryCard
									category={category}
									openedCategoryId={openedCategoryId}
									onCategoryClick={handleCategoryClick}
								/>
							</div>
						))}
					</div>
				) : (
					<Card className='text-center py-12'>
						<Empty
							description='Нет созданных категорий'
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						>
							<Button type='primary' onClick={showModal} className='!rounded-lg !mt-4'>
								Создать первую категорию
							</Button>
						</Empty>
					</Card>
				)}

				<ModalForCreateCategory
					isModalVisible={isModalVisible}
					newCategoryName={newCategoryName}
					onCancel={handleCancel}
					onCreateCategory={handleCreateCategory}
					onChangeCategoryName={setNewCategoryName}
				/>
			</div>
		</div>
	)
}
