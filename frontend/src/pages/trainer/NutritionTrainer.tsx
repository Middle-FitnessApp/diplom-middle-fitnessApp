import { useState } from 'react'
import {
	Typography,
	Button,
	Empty,
	Card,
	Spin,
	Tag,
	message,
	Tooltip,
	Popconfirm,
	Input,
} from 'antd'
import {
	PlusOutlined,
	FolderOutlined,
	RightOutlined,
	DeleteOutlined,
	SearchOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
	useGetCategoriesQuery,
	useCreateCategoryMutation,
	useDeleteCategoryMutation,
	useDeleteSubcategoryMutation,
} from '../../store/api/nutrition.api'
import { ModalForCreateCategory } from '../../components/Admin/ModalForCreateCategory'
import type { NutritionCategory, NutritionSubcategory } from '../../types/nutritions'
import type { ApiError } from '../../store/types/auth.types'

const { Title, Text, Paragraph } = Typography
const { Search } = Input

export const NutritionTrainer = () => {
	const navigate = useNavigate()
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const [newCategoryDescription, setNewCategoryDescription] = useState('')
	const [searchQuery, setSearchQuery] = useState('')

	const {
		data: categories = [],
		isLoading: isLoadingCategories,
		isError: isErrorCategories,
		refetch: refetchCategories,
	} = useGetCategoriesQuery()

	const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation()
	const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation()
	const [deleteSubcategory, { isLoading: isDeletingSubcategory }] =
		useDeleteSubcategoryMutation()

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
			message.success('Категория создана')
			refetchCategories()
		} catch (error: unknown) {
			const apiError = error as ApiError
			console.error('Ошибка при создании категории:', error)
			message.error(apiError?.data?.message || 'Ошибка при создании категории')
		}
	}

	const handleDeleteCategory = async (categoryId: string, e: React.MouseEvent) => {
		e.stopPropagation()
		try {
			await deleteCategory(categoryId).unwrap()
			message.success('Категория удалена')
		} catch (error: unknown) {
			const apiError = error as ApiError
			message.error(apiError?.data?.message || 'Ошибка при удалении категории')
		}
	}

	const handleDeleteSubcategory = async (subcategoryId: string, e: React.MouseEvent) => {
		e.stopPropagation()
		try {
			await deleteSubcategory(subcategoryId).unwrap()
			message.success('План удалён')
		} catch (error: unknown) {
			const apiError = error as ApiError
			message.error(apiError?.data?.message || 'Ошибка при удалении плана')
		}
	}

	const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
		navigate(`/admin/nutrition/${categoryId}/${subcategoryId}`)
	}

	const handleCreateSubcategory = (categoryId: string) => {
		navigate(`/admin/nutrition/${categoryId}/create`)
	}

	// Фильтрация категорий по поиску
	const filteredCategories = categories.filter((category) => {
		const searchLower = searchQuery.toLowerCase()
		const categoryMatch = category.name.toLowerCase().includes(searchLower)
		const subcategoryMatch = category.subcategories?.some((sub) =>
			sub.name.toLowerCase().includes(searchLower),
		)
		return categoryMatch || subcategoryMatch
	})

	// Подсчёт общей статистики
	const totalSubcategories = categories.reduce(
		(acc, cat) => acc + (cat.subcategories?.length || 0),
		0,
	)

	if (isLoadingCategories) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Spin size='large' />
			</div>
		)
	}

	if (isErrorCategories) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
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
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-6xl'>
				{/* Header */}
				<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
					<div>
						<Title level={2} className='text-gray-800 font-semibold m-0 pb-3 border-b-3 border-primary inline-block'>
							📚 Библиотека планов питания
						</Title>
						<Text type='secondary' className='text-sm mt-1 block'>
							Создавайте и управляйте планами питания для ваших клиентов
						</Text>
					</div>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={showModal}
						loading={isCreatingCategory}
						size='large'
					>
						Новая категория
					</Button>
				</div>

				{/* Stats */}
				<div className='grid grid-cols-2 gap-4 mb-6'>
					<Card size='small' className='text-center'>
						<div className='text-2xl font-bold text-primary'>{categories.length}</div>
						<Text type='secondary'>Категорий</Text>
					</Card>
					<Card size='small' className='text-center'>
						<div className='text-2xl font-bold text-green-600'>{totalSubcategories}</div>
						<Text type='secondary'>Планов</Text>
					</Card>
				</div>

				{/* Search */}
				{categories.length > 0 && (
					<div className='mb-6'>
						<Search
							placeholder='Поиск по категориям и планам...'
							allowClear
							size='large'
							prefix={<SearchOutlined className='text-gray-400' />}
							onChange={(e) => setSearchQuery(e.target.value)}
							value={searchQuery}
						/>
					</div>
				)}

				{/* Categories */}
				{filteredCategories.length > 0 ? (
					<div className='space-y-6'>
						{filteredCategories.map((category: NutritionCategory) => (
							<Card
								key={category.id}
								className='overflow-hidden'
								title={
									<div className='flex justify-between items-center'>
										<div className='flex items-center gap-3'>
											<FolderOutlined className='text-xl text-primary' />
											<div>
												<Text strong className='text-lg'>
													{category.name}
												</Text>
												<Text type='secondary' className='text-sm ml-2'>
													{category.subcategories?.length || 0} планов
												</Text>
											</div>
										</div>
										<div className='flex items-center gap-2'>
											<Button
												type='primary'
												ghost
												size='small'
												icon={<PlusOutlined />}
												onClick={() => handleCreateSubcategory(category.id)}
											>
												Добавить план
											</Button>
											<Popconfirm
												title='Удалить категорию?'
												description={
													category.subcategories?.length
														? 'Сначала удалите все планы в этой категории'
														: 'Это действие нельзя отменить'
												}
												onConfirm={(e) =>
													e && handleDeleteCategory(category.id, e as React.MouseEvent)
												}
												okText='Удалить'
												cancelText='Отмена'
												disabled={Boolean(category.subcategories?.length)}
											>
												<Tooltip
													title={
														category.subcategories?.length
															? 'Нельзя удалить категорию с планами'
															: 'Удалить категорию'
													}
												>
													<Button
														type='text'
														danger
														size='small'
														icon={<DeleteOutlined />}
														loading={isDeletingCategory}
														disabled={Boolean(category.subcategories?.length)}
													/>
												</Tooltip>
											</Popconfirm>
										</div>
									</div>
								}
							>
								{category.description && (
									<Paragraph type='secondary' className='mb-4'>
										{category.description}
									</Paragraph>
								)}

								{category.subcategories && category.subcategories.length > 0 ? (
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
										{category.subcategories.map((subcategory: NutritionSubcategory) => (
											<Card
												key={subcategory.id}
												size='small'
												hoverable
												className='cursor-pointer transition-all duration-200 border-gray-200 hover:border-primary hover:shadow-md'
												onClick={() =>
													handleSubcategoryClick(category.id, subcategory.id)
												}
											>
												<div className='flex justify-between items-start'>
													<div className='flex-1 min-w-0'>
														<Text strong className='block truncate'>
															{subcategory.name}
														</Text>
														{subcategory.description && (
															<Text
																type='secondary'
																className='text-xs mt-1 block line-clamp-2'
															>
																{subcategory.description}
															</Text>
														)}
														<div className='flex items-center gap-2 mt-2'>
															<Tag color='blue' className='text-xs'>
																{subcategory.days?.length || 0} дней
															</Tag>
														</div>
													</div>
													<div className='flex items-center gap-1 ml-2'>
														<Popconfirm
															title='Удалить план?'
															description='Это действие нельзя отменить'
															onConfirm={(e) => {
																e?.stopPropagation()
																handleDeleteSubcategory(
																	subcategory.id,
																	e as React.MouseEvent,
																)
															}}
															onCancel={(e) => e?.stopPropagation()}
															okText='Удалить'
															cancelText='Отмена'
														>
															<Button
																type='text'
																danger
																size='small'
																icon={<DeleteOutlined />}
																onClick={(e) => e.stopPropagation()}
																loading={isDeletingSubcategory}
															/>
														</Popconfirm>
														<RightOutlined className='text-gray-400' />
													</div>
												</div>
											</Card>
										))}
									</div>
								) : (
									<Empty
										image={Empty.PRESENTED_IMAGE_SIMPLE}
										description='Нет планов в этой категории'
										className='py-4'
									>
										<Button
											type='dashed'
											icon={<PlusOutlined />}
											onClick={() => handleCreateSubcategory(category.id)}
										>
											Создать первый план
										</Button>
									</Empty>
								)}
							</Card>
						))}
					</div>
				) : searchQuery ? (
					<Card className='text-center py-12'>
						<Empty
							description={`Ничего не найдено по запросу "${searchQuery}"`}
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						>
							<Button onClick={() => setSearchQuery('')}>Сбросить поиск</Button>
						</Empty>
					</Card>
				) : (
					<Card className='text-center py-12'>
						<Empty
							description='Нет созданных категорий'
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						>
							<Button
								type='primary'
								size='large'
								icon={<PlusOutlined />}
								onClick={showModal}
								loading={isCreatingCategory}
							>
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
