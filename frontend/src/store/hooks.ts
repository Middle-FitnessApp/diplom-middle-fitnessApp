import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'
import { createSelector } from '@reduxjs/toolkit'
import { performCancelTrainer } from './slices/auth.slice'
import type { ApiError } from './types/auth.types'
import { Modal } from 'antd'

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

export const useThemeClasses = () => {
	const isDark = useAppSelector((state) => state.ui.theme) === 'dark'

	return {
		// Общие классы
		cardBg: isDark ? 'bg-slate-800' : 'bg-light',
		bodyBg: isDark ? 'bg-[#121c26]' : 'bg-light',
		border: isDark ? 'border-slate-700' : 'border-gray-200',
		title: isDark ? 'text-slate-100' : 'text-gray-800',
		textLight: isDark ? 'text-slate-200' : 'text-gray-700',
		textSecondary: isDark ? 'text-slate-400' : 'text-gray-500',

		// Для форм/инпутов
		inputBg: isDark ? 'bg-slate-700' : 'bg-gray-50',
		inputBorder: isDark ? 'border-slate-600' : 'border-gray-300',
		inputText: isDark ? 'text-slate-100' : 'text-gray-900',
		buttonFileBg: isDark
			? 'bg-red-600 hover:bg-red-700'
			: 'bg-gray-200 hover:bg-gray-300',
		buttonFileText: isDark ? 'text-white' : 'text-gray-700',

		// Для кнопок
		buttonPrimary: isDark
			? 'bg-blue-600 hover:bg-blue-700'
			: 'bg-blue-500 hover:bg-blue-600',

		// Для карточек/модалов
		modalBg: isDark ? 'bg-slate-900' : 'bg-light',
		shadow: isDark ? 'shadow-slate-900/50' : 'shadow-gray-200',

		// Фон выделения при ховере
		hoverBg: isDark ? 'hover:bg-slate-700' : 'hover:bg-blue-50',

		// Сообщения чата, границы и фоны
		chatBorder: isDark ? 'border-slate-600' : 'border-gray-300',
		chatOwnMessageBg: isDark ? 'bg-blue-500' : 'bg-blue-500',
		chatPartnerMessageBg: isDark ? 'bg-slate-700' : 'bg-white',

		// Утилиты
		isDark, // Для дополнительных условий в компоненте
	}
}
