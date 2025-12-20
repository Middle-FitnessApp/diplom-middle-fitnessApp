import React, { useState } from 'react'
import {
	Card,
	Form,
	Input,
	InputNumber,
	Button,
	Avatar,
	message,
	Typography,
	Upload,
} from 'antd'
import { UploadOutlined, EditOutlined } from '@ant-design/icons'
import { z } from 'zod'
import { createSchemaFieldRule } from 'antd-zod'
import type { ApiError } from '../../store/types/auth.types'
import {
	useGetMeQuery,
	useUpdateTrainerProfileWithPhotoMutation,
} from '../../store/api/user.api'
import { useAppDispatch } from '../../store/hooks'
import { updateUser } from '../../store/slices/auth.slice'
import { getPhotoUrl } from '../../utils/buildPhotoUrl'

const { Title } = Typography
interface TrainerFormValues {
	name: string
	age: number
	phone?: string
	email?: string
	telegram?: string
	whatsapp?: string
	instagram?: string
	bio?: string
}

const schema = z.object({
	name: z.string().min(2, 'Минимум 2 символа'),
	age: z.number().min(18, 'Минимальный возраст 18'),
	phone: z.string().min(10, 'Минимум 10 цифр').optional(),
	email: z.string().email('Введите корректный email').optional(),
	telegram: z.string().optional(),
	whatsapp: z.string().optional(),
	instagram: z.string().optional(),
	bio: z.string().optional(),
})

const rule = createSchemaFieldRule(schema)

export const TrainerInfo: React.FC = () => {
	const [form] = Form.useForm()
	const [editing, setEditing] = useState(false)
	const [avatarPreview, setAvatarPreview] = useState<string | undefined>()
	const [newPhotoFile, setNewPhotoFile] = useState<File | undefined>()

	const dispatch = useAppDispatch()
	const { data: meData, isLoading } = useGetMeQuery()
	const [updateTrainerProfileWithPhoto, { isLoading: isUpdating }] =
		useUpdateTrainerProfileWithPhotoMutation()

	const trainer = meData?.user

	const formValues =
		trainer && trainer.role === 'TRAINER'
			? {
					name: trainer.name,
					age: trainer.age,
					phone: trainer.phone ?? undefined,
					email: trainer.email ?? undefined,
					telegram: trainer.telegram ?? undefined,
					whatsapp: trainer.whatsapp ?? undefined,
					instagram: trainer.instagram ?? undefined,
					bio: trainer.bio ?? undefined,
			  }
			: {}

	const resolveAvatarSrc = () => {
		if (avatarPreview) return avatarPreview
		const photo = trainer?.photo
		return getPhotoUrl(photo) || getPhotoUrl('/uploads/default/user.png')
	}

	const currentAvatar = resolveAvatarSrc()

	const handleAvatarChange = (file: File) => {
		const reader = new FileReader()
		reader.onload = (e) => setAvatarPreview(e.target?.result as string)
		reader.readAsDataURL(file)
		setNewPhotoFile(file)
		// сюда позже можно прикрутить updateTrainerProfileWithPhoto(FormData)
	}

	const handleEdit = () => setEditing(true)

	const handleCancel = () => {
		setEditing(false)
		setAvatarPreview(undefined)
		setNewPhotoFile(undefined)
		form.resetFields()
	}

	const handleLogout = () => {
		window.location.href = '/login'
	}

	const handleSubmit = async (values: TrainerFormValues) => {
		try {
			if (!trainer) return

			const formData = new FormData()
			formData.append('name', values.name)
			formData.append('age', values.age.toString())

			const appendIfString = (key: string, val?: string) => {
				const s = typeof val === 'string' ? val.trim() : ''
				if (s) formData.append(key, s)
			}

			appendIfString('phone', values.phone)
			appendIfString('telegram', values.telegram)
			appendIfString('whatsapp', values.whatsapp)
			appendIfString('instagram', values.instagram)
			appendIfString('bio', values.bio)
			appendIfString('email', values.email)

			if (newPhotoFile) {
				formData.append('photo', newPhotoFile)
			}

			const result = await updateTrainerProfileWithPhoto(formData).unwrap()

			dispatch(updateUser(result.user))
			message.success('Данные сохранены!')
			setEditing(false)
			setAvatarPreview(undefined)
			setNewPhotoFile(undefined)
		} catch (error) {
			const apiError = error as ApiError
			message.error(
				apiError?.data?.message || 'Проверьте, что все поля заполнены корректно',
			)
		}
	}

	if (isLoading || !trainer || trainer.role !== 'TRAINER') {
		return (
			<Card className='trainer-info-card'>
				<div className='text-center py-8'>
					<div className='ant-spin ant-spin-lg' />
				</div>
			</Card>
		)
	}

	return (
		<Card
			className='mb-8 shadow-lg border border-muted rounded-xl bg-(--bg-light)'
			styles={{
				body: {
					borderBottom: '1px solid var(--border)',
					background: 'var(--bg-light)',
					borderRadius: '20px 20px 0 0',
				},
			}}
		>
			<div className='flex'>
				<div className='flex flex-col items-center justify-center gap-2 px-1'>
					<Avatar
						src={currentAvatar}
						size={92}
						className='shadow-inner mb-2 border border-muted'
					/>
					{editing && (
						<Upload
							accept='image/*'
							showUploadList={false}
							beforeUpload={(file) => {
								handleAvatarChange(file as File)
								return false
							}}
						>
							<Button icon={<UploadOutlined />} className='mt-1 rounded-md' size='small'>
								Загрузить фото
							</Button>
						</Upload>
					)}
				</div>

				<div className='ml-8 flex-1'>
					{editing ? (
						<Form
							form={form}
							layout='vertical'
							autoComplete='off'
							className='max-w-md'
							onFinish={handleSubmit}
							initialValues={formValues}
						>
							<Form.Item label='Имя' name='name' rules={[rule]}>
								<Input className='rounded-md bg-(--bg-light) shadow-sm' />
							</Form.Item>

							<Form.Item label='Возраст' name='age' rules={[rule]}>
								<InputNumber
									className='w-full rounded-md bg-(--bg-light) shadow-sm'
									min={18}
								/>
							</Form.Item>

							<Form.Item label='Телефон' name='phone' rules={[rule]}>
								<Input className='rounded-md bg-(--bg-light) shadow-sm' />
							</Form.Item>

							<Form.Item label='Email' name='email' rules={[rule]}>
								<Input className='rounded-md bg-(--bg-light) shadow-sm' />
							</Form.Item>

							<Form.Item label='Telegram' name='telegram'>
								<Input className='rounded-md bg-(--bg-light) shadow-sm' />
							</Form.Item>

							<Form.Item label='WhatsApp' name='whatsapp'>
								<Input className='rounded-md bg-(--bg-light) shadow-sm' />
							</Form.Item>

							<Form.Item label='Instagram' name='instagram'>
								<Input className='rounded-md bg-(--bg-light) shadow-sm' />
							</Form.Item>

							<Form.Item label='О себе' name='bio'>
								<Input.TextArea
									rows={3}
									className='rounded-md bg-(--bg-light) shadow-sm'
								/>
							</Form.Item>

							<div className='flex gap-3'>
								<Button
									type='primary'
									htmlType='submit'
									loading={isUpdating}
									className='rounded-md px-6'
								>
									Сохранить
								</Button>
								<Button type='default' onClick={handleCancel} className='rounded-md px-6'>
									Отмена
								</Button>
							</div>
						</Form>
					) : (
						<div>
							<Title level={4} className='mb-1 font-bold text-custom'>
								{trainer.name}
							</Title>
							<div className='text-sm mb-1'>
								<span className='text-muted'>Возраст:</span>{' '}
								<span className='font-medium'>{trainer.age}</span>
							</div>
							<div className='text-sm mb-1'>
								<span className='text-muted'>Телефон:</span>{' '}
								<span className='font-mono'>{trainer.phone ?? 'не указан'}</span>
							</div>

							<div className='text-sm mb-1'>
								<span className='text-muted'>Email:</span>{' '}
								<span className='font-medium'>{trainer.email ?? 'не указан'}</span>
							</div>
							<div className='text-sm mb-1'>
								<span className='text-muted'>Telegram:</span>{' '}
								<span className='text-info'>{trainer.telegram || '—'}</span>
							</div>
							<div className='text-sm mb-1'>
								<span className='text-muted'>WhatsApp:</span>{' '}
								<span className='text-info'>{trainer.whatsapp || '—'}</span>
							</div>
							<div className='text-sm mb-1'>
								<span className='text-muted'>Instagram:</span>{' '}
								<span className='text-info'>{trainer.instagram || '—'}</span>
							</div>
							{trainer.bio && (
								<div className='text-sm mt-2 text-gray-700 mb-6'>{trainer.bio}</div>
							)}
							<Button
								type='link'
								className='mt-4 text-info px-0 hover:underline font-medium'
								icon={<EditOutlined />}
								onClick={handleEdit}
							>
								Редактировать профиль
							</Button>
						</div>
					)}
				</div>

				<Button
					danger
					style={{
						background: 'var(--danger)',
						color: 'var(--highlight)',
						border: 'none',
					}}
					onClick={handleLogout}
					className='ml-auto rounded-md px-4'
				>
					Выйти
				</Button>
			</div>
		</Card>
	)
}
