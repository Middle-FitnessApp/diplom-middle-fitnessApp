import { Pagination, Typography, Empty } from 'antd'
import { type Comment } from './CommentsSection'

const { Text } = Typography

interface CommentsListProps {
	comments: Comment[]
	total: number
	page: number
	pageSize: number
	onPageChange: (page: number) => void
}

export const CommentsList = ({
	comments,
	total,
	page,
	pageSize,
	onPageChange,
}: CommentsListProps) => {
	if (comments.length === 0) {
		return (
			<Empty
				description='Нет комментариев'
				style={{ marginTop: '32px', marginBottom: '32px' }}
			/>
		)
	}

	return (
		<>
			<div className='space-y-4'>
				{comments.map((comment) => (
					<div key={comment.id} className='p-4 bg-muted rounded-lg'>
						<div className='flex justify-between items-start mb-2'>
							<Text strong>{comment.author}</Text>
							<Text type='secondary' className='text-xs'>
								{new Date(comment.date).toLocaleDateString('ru-RU')}
							</Text>
						</div>

						<Text className='block'>{comment.content}</Text>
					</div>
				))}
			</div>

			{total > pageSize && (
				<div className='flex justify-center mt-6'>
					<Pagination
						current={page}
						total={total}
						pageSize={pageSize}
						onChange={onPageChange}
						showSizeChanger={false}
					/>
				</div>
			)}
		</>
	)
}
