import { useState } from 'react'
import { AddCommentForm } from './AddCommentForm'
import { CommentsList } from './CommentsList'
import {
	useAddProgressCommentMutation,
	useGetProgressCommentsQuery,
} from '../../store/api/progress.api'
import { LoadingState } from '../Client'
import { message } from 'antd'

interface CommentsSectionProps {
	progressId: string
	isTrainer?: boolean
}

export const CommentsSection = ({
	progressId,
	isTrainer = false,
}: CommentsSectionProps) => {
	const [page, setPage] = useState(1)
	const pageSize = 5

	const {
		data: commentsData,
		isLoading,
		isFetching,
	} = useGetProgressCommentsQuery({
		progressId,
		page,
		limit: pageSize,
	})

	const [addComment, { isLoading: isAddingComment }] = useAddProgressCommentMutation()

	const handleAddComment = async (text: string) => {
		try {
			await addComment({ progressId, text }).unwrap()
		} catch (error) {
			message.error('Не удалось добавить комментарий. Попробуйте позже.')
			if (import.meta.env.DEV) {
				console.error('Ошибка добавления комментария:', error)
			}
		}
	}

	const handleLoadMore = () => {
		if (
			commentsData?.pagination.page &&
			commentsData.pagination.page < commentsData.pagination.totalPages
		) {
			setPage((p) => p + 1)
		}
	}

	const allComments = commentsData?.comments || []
	const hasMore = commentsData?.pagination.totalPages
		? page < commentsData.pagination.totalPages
		: false

	if (isLoading) {
		return <LoadingState message='Загрузка...' />
	}

	return (
		<>
			{isTrainer && (
				<AddCommentForm onSubmit={handleAddComment} isLoading={isAddingComment} />
			)}

			<CommentsList
				comments={allComments}
				isLoading={isFetching}
				hasMore={hasMore}
				onLoadMore={handleLoadMore}
			/>
		</>
	)
}
