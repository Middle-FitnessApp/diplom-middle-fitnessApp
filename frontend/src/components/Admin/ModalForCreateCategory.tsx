import { Modal, Input } from 'antd'

interface ModalForCreateCategoryProps {
	isModalVisible: boolean
	newCategoryName: string
	newCategoryDescription: string
	onCancel: () => void
	onCreateCategory: () => void
	onChangeCategoryName: (value: string) => void
	onChangeCategoryDescription: (value: string) => void
	isLoading?: boolean
}

export const ModalForCreateCategory = ({
	isModalVisible,
	newCategoryName,
	newCategoryDescription,
	onCancel,
	onCreateCategory,
	onChangeCategoryName,
	onChangeCategoryDescription,
	isLoading = false,
}: ModalForCreateCategoryProps) => {
	return (
		<Modal
			title='Создание новой категории'
			open={isModalVisible}
			onOk={onCreateCategory}
			onCancel={onCancel}
			okText='Создать'
			cancelText='Отмена'
			okButtonProps={{
				className: 'bg-primary border-primary hover:bg-info hover:border-info',
				loading: isLoading,
				disabled: !newCategoryName.trim(),
			}}
			cancelButtonProps={{
				disabled: isLoading,
			}}
		>
			<div className='space-y-4'>
				<div>
					<label className='block text-sm font-medium text-custom mb-2'>
						Название категории *
					</label>
					<Input
						placeholder='Например: Похудение, Набор массы...'
						value={newCategoryName}
						onChange={(e) => onChangeCategoryName(e.target.value)}
						onPressEnter={onCreateCategory}
						autoFocus
						disabled={isLoading}
					/>
				</div>
				<div>
					<label className='block text-sm font-medium text-custom mb-2'>
						Описание категории
					</label>
					<Input.TextArea
						placeholder='Опишите назначение категории...'
						value={newCategoryDescription}
						onChange={(e) => onChangeCategoryDescription(e.target.value)}
						rows={3}
						disabled={isLoading}
					/>
				</div>
				<p className='text-xs text-muted'>
					Категория поможет организовать ваши планы питания по целям или типам.
				</p>
			</div>
		</Modal>
	)
}
