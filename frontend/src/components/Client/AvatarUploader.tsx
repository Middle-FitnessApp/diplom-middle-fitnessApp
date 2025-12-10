import { useEffect, useState } from 'react'
import { Avatar, Upload, message } from 'antd'
import { UploadOutlined, UserOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

interface AvatarUploaderProps {
	size?: number
	initialUrl?: string | null
	onChange?: (file?: File, url?: string | null) => void
	accept?: string
	maxSizeMB?: number
}

export const AvatarUploader = ({
	size = 120,
	initialUrl = null,
	onChange,
	accept = 'image/jpeg,image/png',
	maxSizeMB = 2,
}: AvatarUploaderProps) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl)

	useEffect(() => {
		if (initialUrl === avatarUrl) return

		const t = setTimeout(() => {
			setAvatarUrl(initialUrl ?? null)
		}, 0)
		return () => clearTimeout(t)
	}, [initialUrl, avatarUrl])

	const uploadProps: UploadProps = {
		showUploadList: false,
		accept,
		beforeUpload: (file) => {
			const allowed = accept.split(',').map((s) => s.trim())
			const isAllowed = allowed.includes(file.type)
			if (!isAllowed) {
				message.error('Можно загружать только JPG/PNG!')
				return Upload.LIST_IGNORE
			}

			if (file.size / 1024 / 1024 >= maxSizeMB) {
				message.error(`Изображение должно быть меньше ${maxSizeMB}MB!`)
				return Upload.LIST_IGNORE
			}

			const reader = new FileReader()
			reader.onload = () => {
				const url = reader.result as string
				setAvatarUrl(url)
				onChange?.(file, url)
			}
			reader.readAsDataURL(file)

			message.success('Аватар обновлен')
			return false
		},
		onRemove: () => {
			setAvatarUrl(null)
			onChange?.(undefined, null)
			return true
		},
	}

	return (
		<Upload {...uploadProps}>
			<div className='cursor-pointer relative group mb-6'>
				<Avatar
					size={size}
					src={avatarUrl ? `http://localhost:3000${avatarUrl}` : '/default-avatar.png'}
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
