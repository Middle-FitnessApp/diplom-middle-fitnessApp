import { Modal, Input } from 'antd'

interface ModalForCreateCategoryProps {
	isModalVisible: boolean
	newCategoryName: string
	onCancel: () => void
	onCreateCategory: () => void
	onChangeCategoryName: (value: string) => void
}

export const ModalForCreateCategory = ({
	isModalVisible,
	newCategoryName,
	onCancel,
	onCreateCategory,
	onChangeCategoryName,
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
					/>
				</div>
				<p className='text-xs text-muted'>
					Категория поможет организовать ваши планы питания по целям или типам.
				</p>
			</div>
		</Modal>
	)
}
