import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'
import { createSelector } from '@reduxjs/toolkit'
import { performCancelTrainer } from './slices/auth.slice'
import type { ApiError } from './types/auth.types'
import { Modal, message } from 'antd'
import { useCancelTrainerMutation, useInviteTrainerMutation } from './api/user.api'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const selectChatMessages = createSelector(
	[
		(state: RootState, chatId?: string) =>
			chatId ? state.chat.messages[chatId] : undefined,
	],
	(messages) => messages || [],
)

export const useAuth = () => {
	const { user, token, isAuthenticated, isLoading } = useAppSelector(
		(state) => state.auth,
	)
	return { user, token, isAuthenticated, isLoading }
}

export const useUserProfile = () => {
	const profile = useAppSelector((state) => state.user.profile)
	const bodyMeasurements = useAppSelector((state) => state.user.bodyMeasurements)
	return { profile, bodyMeasurements }
}

export const useUI = () => {
	const { isSidebarOpen, currentPage, notifications, theme } = useAppSelector(
		(state) => state.ui,
	)
	return { isSidebarOpen, currentPage, notifications, theme }
}

interface CancelTrainerModalOptions {
	title?: string
	content?: string
	okText?: string
	cancelText?: string
	okType?: 'danger' | 'primary'
	onSuccess?: (result: { message: string }) => void
	onError?: (error: ApiError) => void
}

export const useCancelTrainerModal = () => {
	const dispatch = useAppDispatch()

	const showCancelTrainerModal = async (modalOptions: CancelTrainerModalOptions = {}) => {
		const {
			title = 'Отвязать тренера',
			content = 'Вы уверены, что хотите отвязать тренера? Все активные планы питания будут деактивированы.',
			okText = 'Отвязать',
			cancelText = 'Отмена',
			okType = 'danger',
			onSuccess,
			onError,
		} = modalOptions

		Modal.confirm({
			title,
			content,
			okText,
			cancelText,
			okType,
			onOk: async () => {
				try {
					const result = await dispatch(performCancelTrainer()).unwrap()
					onSuccess?.(result)
				} catch (err) {
					const apiError = err as ApiError
					onError?.(apiError)
				}
			},
		})
	}

	return { showCancelTrainerModal }
}

interface SwitchTrainerModalOptions {
	newTrainerId: string
	newTrainerName: string
	onSuccess?: () => void
	onError?: (error: unknown) => void
}

export interface ApiErrorData {
	message?: string
	error?: {
		message?: string
	}
}

export const useSwitchTrainerModal = () => {
	const [cancelTrainer] = useCancelTrainerMutation()
	const [inviteTrainer] = useInviteTrainerMutation()

	const showSwitchTrainerModal = ({
		newTrainerId,
		newTrainerName,
		onSuccess,
		onError,
	}: SwitchTrainerModalOptions) => {
		Modal.confirm({
			title: 'Заменить тренера?',
			content: `У вас уже есть активный тренер.
			Вы действительно хотите отвязаться от него и отправить приглашение ${newTrainerName}?`,
			okText: 'Да, заменить',
			okType: 'primary',
			cancelText: 'Отмена',
			async onOk() {
				try {
					await cancelTrainer().unwrap()
					await inviteTrainer({ trainerId: newTrainerId }).unwrap()

					message.success(`Приглашение отправлено тренеру ${newTrainerName}!`)
					onSuccess?.()
				} catch (err) {
					let errorMessage = 'Не удалось заменить тренера'
					if (typeof err === 'object' && err !== null && 'data' in err) {
						const errorData = err.data as ApiErrorData | undefined
						errorMessage = errorData?.message || errorData?.error?.message || errorMessage
					}
					message.error(errorMessage)
					onError?.(err)
				}
			},
		})
	}

	return { showSwitchTrainerModal }
}
