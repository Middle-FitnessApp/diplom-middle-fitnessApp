import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  return { user, token, isAuthenticated, isLoading }
}

export const useUserProfile = () => {
  const profile = useAppSelector((state) => state.user.profile)
  const bodyMeasurements = useAppSelector((state) => state.user.bodyMeasurements)
  return { profile, bodyMeasurements }
}

export const useUI = () => {
  const { isSidebarOpen, currentPage, notifications, theme } = useAppSelector((state) => state.ui)
  return { isSidebarOpen, currentPage, notifications, theme }
}