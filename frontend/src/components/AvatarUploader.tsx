import { Avatar, Upload, message } from 'antd'
import { UploadOutlined, UserOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useState } from 'react'

interface AvatarUploaderProps {
	size?: number
	initialUrl?: string
	onChange?: (url?: string) => void
}

export const AvatarUploader = ({ size, initialUrl, onChange }: AvatarUploaderProps) => {
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialUrl)

	const uploadProps: UploadProps = {
		showUploadList: false,
		beforeUpload: (file) => {
			const isImage = ['image/jpeg', 'image/png'].includes(file.type)
			if (!isImage) {
				message.error('Можно загружать только JPG/PNG!')
				return Upload.LIST_IGNORE
			}

			if (file.size / 1024 / 1024 >= 2) {
				message.error('Изображение должно быть меньше 2MB!')
				return Upload.LIST_IGNORE
			}

			const reader = new FileReader()
			reader.onload = () => {
				const url = reader.result as string
				setAvatarUrl(url)
				onChange?.(url)
			}
			reader.readAsDataURL(file)

			message.success('Аватар обновлен')
			return false
		},
	}

	return (
		<Upload {...uploadProps}>
			<div className='cursor-pointer relative group mb-6'>
				<Avatar
					size={size}
					src={avatarUrl}
					icon={<UserOutlined />}
					className='bg-blue-500'
				/>
				<div className='absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
					<UploadOutlined className='text-white text-xl' />
				</div>
			</div>
		</Upload>
	)
}
