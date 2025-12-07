import { Typography, Empty, Avatar } from 'antd'
import { type Comment } from '../../store/types/progress.types.ts'
import { buildPhotoUrl } from '../../utils/buildPhotoUrl.ts'

const { Text } = Typography

interface CommentsListProps {
	comments: Comment[]
	isLoading?: boolean
	hasMore?: boolean
	onLoadMore?: () => void
}

export const CommentsList = ({
	comments,
	isLoading = false,
	hasMore = false,
	onLoadMore,
}: CommentsListProps) => {
	if (comments.length === 0 && !isLoading) {
		return (
			<Empty
				description='Нет комментариев'
				style={{ marginTop: '32px', marginBottom: '32px' }}
			/>
		)
	}

	return (
		<div className='space-y-4'>
			{comments.map((comment) => (
				<div key={comment.id} className='flex gap-3 pb-4 border-b last:border-b-0'>
					<Avatar
						size={36}
						src={buildPhotoUrl(comment.trainer.photo) || undefined}
						className='mt-1'
					>
						{!comment.trainer.photo &&
							comment.trainer.name
								.split(' ')
								.map((n) => n[0])
								.join('')}
					</Avatar>

					<div className='flex-1 min-w-0'>
						<div className='flex justify-between items-start mb-2'>
							<Text strong>{comment.trainer.name}</Text>
							<Text type='secondary' className='text-xs'>
								{new Date(comment.createdAt).toLocaleDateString('ru-RU')}
							</Text>
						</div>

						<Text className='block'>{comment.text}</Text>
					</div>
				</div>
			))}

			{hasMore && (
				<button
					onClick={onLoadMore}
					disabled={isLoading}
					className='w-full text-sm text-primary hover:underline py-2'
				>
					{isLoading ? 'Загрузка...' : 'Показать ещё'}
				</button>
			)}
		</div>
	)
}
