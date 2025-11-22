import { useState } from 'react'
import { Layout, Typography, Button, Empty, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { NutritionCategory } from '../../types/nutritions'
import { mockCategories } from '../../mockData(удалим потом)/mockNutritionCategories'
import { NutritionCategoryCard } from './components/NutritionCategoryCard'
import { ModalForCreateCategory } from './components/ModalForCreateCategory'

const { Title } = Typography

export const NutritionTrainer = () => {
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const [openedCategoryId, setOpenedCategoryId] = useState<string | null>(null)

	//тут получим данные
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
		// тут будет запрос с создания ново категории на бек
	}

	const handleCategoryClick = (category: NutritionCategory) => {
		if (openedCategoryId === category.id) {
			setOpenedCategoryId(null)
		} else {
			setOpenedCategoryId(category.id)
		}
	}

	return (
		<Layout className='h-full'>
			<Layout.Content className='p-6'>
				<div className='max-w-6xl mx-auto'>
					<div className='flex justify-between items-center mb-6'>
						<Title level={3} className='text-custom m-0'>
							Библиотека планов питания
						</Title>
						<Button type='primary' icon={<PlusOutlined />} onClick={showModal}>
							Добавить категорию
						</Button>
					</div>

					{categories.length > 0 ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{categories.map((category) => (
								<NutritionCategoryCard
									key={category.id}
									category={category}
									openedCategoryId={openedCategoryId}
									handleCategoryClick={handleCategoryClick}
								/>
							))}
						</div>
					) : (
						<Empty
							description='Нет созданных категорий'
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						>
							<Button type='primary' onClick={showModal}>
								Создать первую категорию
							</Button>
						</Empty>
					)}

					<ModalForCreateCategory
						isModalVisible={isModalVisible}
						newCategoryName={newCategoryName}
						onCancel={handleCancel}
						onCreateCategory={handleCreateCategory}
						onChangeCategoryName={setNewCategoryName}
					/>
				</div>
			</Layout.Content>
		</Layout>
	)
}
