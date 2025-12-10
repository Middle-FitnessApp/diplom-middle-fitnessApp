import { Button, Card, Empty, Tag, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { NutritionCategory, NutritionSubcategory } from '../../types/nutritions'
import {
	DownOutlined,
	PlusOutlined,
	RightOutlined,
	DeleteOutlined,
} from '@ant-design/icons'
import { useDeleteCategoryMutation } from '../../store/api/nutrition.api'

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
	const hasSubcategories = category.subcategories && category.subcategories.length > 0
	const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

	const { Meta } = Card

	const getCategoryIcon = (categoryId: string) => {
		return openedCategoryId === categoryId ? <DownOutlined /> : <RightOutlined />
	}

	const handleAddSubcategoryClick = (
		category: NutritionCategory,
		e: React.MouseEvent,
	) => {
		e.stopPropagation()
		navigate(`/admin/nutrition/${category.id}/create`)
	}

	const handleSubcategoryClick = (
		category: NutritionCategory,
		subcategory: NutritionSubcategory,
		e: React.MouseEvent,
	) => {
		e.stopPropagation()
		navigate(`/admin/nutrition/${category.id}/${subcategory.id}`)
	}

	const handleDeleteClick = async (e: React.MouseEvent) => {
		e.stopPropagation()
		e.preventDefault()
		console.log('delete')
		try {
			await deleteCategory(category.id).unwrap()
			message.success('Категория удалена')
		} catch (error) {
			console.error('Ошибка при удалении категории:', error)
			const err = error as { data?: { message?: string } }
			message.error(err?.data?.message || 'Ошибка при удалении категории')
		}
	}

	const handleCardClick = () => {
		onCategoryClick(category.id)
	}

	return (
		<Card
			hoverable
			className={`border-muted hover:shadow-lg transition-all duration-300 bg-light relative min-h-[120px] ${
				openedCategoryId === category.id ? 'min-h-[300px]' : ''
			}`}
			onClick={handleCardClick}
		>
			<Button
				type='text'
				danger
				size='small'
				loading={isDeleting}
				onClick={handleDeleteClick}
				className='mb-2'
				disabled={hasSubcategories}
				title={
					hasSubcategories ? 'Нельзя удалить не пустую категорию' : 'Удалить категорию'
				}
			>
				<DeleteOutlined />
			</Button>

			<Meta
				title={
					<div className='flex justify-between items-center'>
						<div className='flex items-center gap-2'>
							<span className='text-lg'>{getCategoryIcon(category.id)}</span>
							<span className='text-gray-800 hover:text-blue-500 cursor-pointer transition-colors'>
								{category.name}
							</span>
						</div>
						<span className='text-xs text-muted bg-gray-100 px-2 py-1 rounded-full'>
							{category.subcategories?.length || 0} подкатегорий
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
								{category.subcategories && category.subcategories.length > 0 ? (
									<>
										{category.subcategories.map((subcategory) => (
											<div
												key={subcategory.id}
												className='p-3 border border-muted rounded-lg hover:border-primary transition-colors cursor-pointer bg-white'
												onClick={(e) => handleSubcategoryClick(category, subcategory, e)}
											>
												<div className='flex justify-between items-start mb-2'>
													<span className='font-medium text-custom text-sm'>
														{subcategory.name}
													</span>
													<Tag color='blue' className='text-xs'>
														{subcategory.days?.length || 0} дней
													</Tag>
												</div>
												<p className='text-muted text-xs mb-2'>
													{subcategory.description || 'Нет описания'}
												</p>
												<div className='text-xs text-primary hover:text-info transition-colors'>
													Перейти к дням →
												</div>
											</div>
										))}
										<Button
											type='dashed'
											icon={<PlusOutlined />}
											className='w-full mt-2'
											onClick={(e) => handleAddSubcategoryClick(category, e)}
										>
											Добавить подкатегорию
										</Button>
									</>
								) : (
									<div className='text-center py-4'>
										<Empty
											description='Нет подкатегорий'
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											className='mb-3'
										/>
										<Button
											type='dashed'
											icon={<PlusOutlined />}
											onClick={(e) => handleAddSubcategoryClick(category, e)}
										>
											Создать первую подкатегорию
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
