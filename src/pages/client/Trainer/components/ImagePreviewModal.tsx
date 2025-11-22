import React from 'react'
import { Modal } from 'antd'

type ImagePreviewModalProps = {
	imageUrl?: string
	onClose: () => void
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
	imageUrl,
	onClose,
}) => (
	<Modal
		open={!!imageUrl}
		footer={null}
		onCancel={onClose}
		styles={{ body: { textAlign: 'center' } }}
	>
		<img src={imageUrl} alt='preview' style={{ maxWidth: '100%', maxHeight: '100%' }} />
	</Modal>
)
