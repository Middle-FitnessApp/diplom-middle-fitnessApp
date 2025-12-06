import { useState } from 'react'
import { Typography, Button, Empty, Card, Spin } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import {
	useGetCategoriesQuery,
	useCreateCategoryMutation,
} from '../../store/api/nutrition.api'
import { NutritionCategoryCard } from '../../components/Admin/NutritionCategoryCard'
import { ModalForCreateCategory } from '../../components/Admin/ModalForCreateCategory'
import type { NutritionCategory } from '../../types/nutritions'

const { Title } = Typography

export const NutritionTrainer = () => {
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const [newCategoryDescription, setNewCategoryDescription] = useState('')
	const [openedCategoryId, setOpenedCategoryId] = useState<string | null>(null)

	const {
		data: categories = [],
		isLoading: isLoadingCategories,
		isError: isErrorCategories,
		refetch: refetchCategories,
	} = useGetCategoriesQuery()

	const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation()

	const showModal = () => {
		setIsModalVisible(true)
	}

	const handleCancel = () => {
		setIsModalVisible(false)
		setNewCategoryName('')
		setNewCategoryDescription('')
	}

	const handleCreateCategory = async () => {
		if (!newCategoryName.trim()) return

		try {
			await createCategory({
				name: newCategoryName.trim(),
				description: newCategoryDescription.trim() || undefined,
			}).unwrap()

			setIsModalVisible(false)
			setNewCategoryName('')
			setNewCategoryDescription('')
			refetchCategories()
		} catch (error: any) {
			console.error('Ошибка при создании категории:', error)
		}
	}

	const handleCategoryClick = (categoryId: string) => {
		setOpenedCategoryId((prev) => (prev === categoryId ? null : categoryId))
	}

	if (isLoadingCategories) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Spin size='large' />
			</div>
		)
	}

	if (isErrorCategories) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card'>
					<div className='text-center py-12'>
						<Empty
							description='Ошибка при загрузке категорий'
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						>
							<Button type='primary' onClick={() => refetchCategories()}>
								Попробовать снова
							</Button>
						</Empty>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card'>
				<div className='section-header'>
					<Title level={2} className='section-title'>
						📚 Библиотека планов питания
					</Title>
				</div>

				<div className='flex justify-between items-center mb-8'>
					<div>
						Управляйте вашими планами питания
						{categories.length > 0 && (
							<span className='ml-2 text-primary font-semibold'>
								({categories.length} категорий)
							</span>
						)}
					</div>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={showModal}
						loading={isCreatingCategory}
					>
						Добавить категорию
					</Button>
				</div>

				{categories.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{categories.map((category: NutritionCategory) => (
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
							<Button type='primary' onClick={showModal} loading={isCreatingCategory}>
								Создать первую категорию
							</Button>
						</Empty>
					</Card>
				)}

				<ModalForCreateCategory
					isModalVisible={isModalVisible}
					newCategoryName={newCategoryName}
					newCategoryDescription={newCategoryDescription}
					onCancel={handleCancel}
					onCreateCategory={handleCreateCategory}
					onChangeCategoryName={setNewCategoryName}
					onChangeCategoryDescription={setNewCategoryDescription}
					isLoading={isCreatingCategory}
				/>
			</div>
		</div>
	)
}
