import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { addNotification, setConnected } from '../store/slices/notifications.slice'
import type { Notification } from '../types/notifications'
import { App } from 'antd'

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3000' : ''

export const useSocket = () => {
	const dispatch = useAppDispatch()
	const socketRef = useRef<Socket | null>(null)
	const token = useAppSelector((state) => state.auth.token)
	const user = useAppSelector((state) => state.auth.user)
	const { message: antdMessage } = App.useApp()

	useEffect(() => {
		if (!token || !user) {
			// Если нет токена или пользователя, отключаемся
			if (socketRef.current) {
				socketRef.current.disconnect()
				socketRef.current = null
				dispatch(setConnected(false))
			}
			return
		}

		// Создаем соединение
		socketRef.current = io(SOCKET_URL, {
			auth: {
				token: token,
			},
			transports: ['websocket', 'polling'],
		})

		const socket = socketRef.current

		// Обработчики событий
		socket.on('connect', () => {
			console.log('Connected to server')
			dispatch(setConnected(true))
		})

		socket.on('disconnect', () => {
			console.log('Disconnected from server')
			dispatch(setConnected(false))
		})

		socket.on('notification', (notification: Notification) => {
			console.log('Received notification:', notification)
			dispatch(addNotification(notification))

			// Показываем toast уведомление
			antdMessage.info({
				content: notification.message,
				duration: 4,
			})
		})

		socket.on('connect_error', (error) => {
			console.error('Connection error:', error)
			dispatch(setConnected(false))
		})

		// Очистка при размонтировании
		return () => {
			if (socket) {
				socket.disconnect()
				dispatch(setConnected(false))
			}
		}
	}, [token, user, dispatch, antdMessage])
}
