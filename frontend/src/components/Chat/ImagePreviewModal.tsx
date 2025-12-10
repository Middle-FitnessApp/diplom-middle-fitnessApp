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
		<img src={imageUrl} alt='preview' className='image-preview-modal-img' />
	</Modal>
)
