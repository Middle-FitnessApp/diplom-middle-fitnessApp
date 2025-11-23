import { useState, useMemo } from 'react'
import { Card, Space } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import { AddCommentForm } from './AddCommentForm'
import { CommentsList } from './CommentsList'

export interface Comment {
	id: string
	author: string
	content: string
	date: string
}

interface CommentsSectionProps {
	comments: Comment[]
}

export const CommentsSection = ({ comments }: CommentsSectionProps) => {
	const [commentText, setCommentText] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const pageSize = 5

	const paginated = useMemo(() => {
		const start = (currentPage - 1) * pageSize
		return comments.slice(start, start + pageSize)
	}, [currentPage, comments])

	const handleAddComment = () => {
		if (commentText.trim()) {
			console.log('Комментарий добавлен:', commentText)
			setCommentText('')
		}
	}

	return (
		<Card
			title={
				<Space>
					<FileTextOutlined />
					<span>Комментарии к отчету</span>
				</Space>
			}
		>
			<AddCommentForm
				value={commentText}
				onChange={setCommentText}
				onSubmit={handleAddComment}
			/>

			<CommentsList
				comments={paginated}
				total={comments.length}
				page={currentPage}
				pageSize={pageSize}
				onPageChange={setCurrentPage}
			/>
		</Card>
	)
}
