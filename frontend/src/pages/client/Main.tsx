import React, { useState, useMemo, useEffect } from 'react'
import { Button, Typography, message, Spin, Pagination, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'
import { TeamOutlined } from '@ant-design/icons'
import { TrainerCard, TrainersList } from '../../components/Client'
import { useAppSelector, useAppDispatch, useCancelTrainerModal } from '../../store/hooks'
import {
	useGetMeQuery,
	useGetAllTrainersQuery,
	useInviteTrainerMutation,
	useCancelInviteByTrainerMutation,
} from '../../store/api/user.api'
import { setUser } from '../../store/slices/auth.slice'

const { Title, Paragraph } = Typography

// Константа для пагинации
const TRAINERS_PER_PAGE = 8

export const Main: React.FC = () => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const [selectingTrainerId, setSelectingTrainerId] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)

	// Проверяем наличие токена в Redux
	const token = useAppSelector((state) => state.auth.token)

	// Получаем данные о текущем пользователе (только если есть токен)
	const {
		data: meData,
		isLoading: isLoadingMe,
		refetch: refetchMe,
	} = useGetMeQuery(undefined, {
		skip: !token,
		pollingInterval: 5000, // Опрашиваем каждые 5 секунд для получения актуальных данных
		refetchOnFocus: true, // Обновляем данные при возврате на вкладку
		refetchOnReconnect: true, // Обновляем при восстановлении соединения
	})

	// Синхронизируем данные из RTK Query с Redux состоянием
	useEffect(() => {
		if (meData?.user) {
			// Всегда обновляем Redux состояние свежими данными из API
			dispatch(setUser(meData.user))
		}
	}, [meData?.user, dispatch])

	// Получаем список всех тренеров (с статусами приглашений для авторизованного клиента)
	const { data: trainersData, isLoading: isLoadingTrainers } = useGetAllTrainersQuery()

	// Мутации
	const [inviteTrainer] = useInviteTrainerMutation()
	const [cancelInviteByTrainer] = useCancelInviteByTrainerMutation()

	const user = meData?.user
	// Авторизован = есть токен И загружены данные пользователя
	const isAuthenticated = !!token && !!user
	// Ещё загружается = есть токен, но данных пока нет
	const isStillLoading = !!token && isLoadingMe
	const isClient = user?.role === 'CLIENT'
	const hasTrainer = isClient && !!user?.trainer
	const trainers = useMemo(() => trainersData?.trainers || [], [trainersData?.trainers])

	// Собираем статусы приглашений из данных тренеров (приходят с бэкенда)
	const inviteStatuses = useMemo(() => {
		const statuses: Record<string, 'PENDING' | 'ACCEPTED' | 'REJECTED' | null> = {}
		trainers.forEach((trainer) => {
			if (trainer.inviteStatus) {
				statuses[trainer.id] = trainer.inviteStatus
			}
		})
		return statuses
	}, [trainers])

	// Фильтруем тренеров (исключаем текущего тренера клиента)
	const availableTrainers = useMemo(() => {
		if (hasTrainer && user?.trainer) {
			return trainers.filter((t) => t.id !== user.trainer?.id)
		}
		return trainers
	}, [trainers, hasTrainer, user?.trainer])

	// Пагинация
	const paginatedTrainers = useMemo(() => {
		const startIndex = (currentPage - 1) * TRAINERS_PER_PAGE
		return availableTrainers.slice(startIndex, startIndex + TRAINERS_PER_PAGE)
	}, [availableTrainers, currentPage])

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		// Прокрутка к началу списка тренеров
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	// Обработчик выбора тренера
	const handleSelectTrainer = async (trainerId: string) => {
		if (!isAuthenticated) {
			navigate('/login')
			return
		}

		setSelectingTrainerId(trainerId)
		try {
			await inviteTrainer({ trainerId }).unwrap()
			message.success('Заявка отправлена тренеру!')
			// Обновляем данные пользователя для отображения актуального статуса приглашения
			refetchMe()
		} catch (error: unknown) {
			const apiError = error as {
				data?: { message?: string; error?: { message?: string } }
			}
			const errorMessage =
				apiError?.data?.message ||
				apiError?.data?.error?.message ||
				'Не удалось отправить заявку'

			// Обрабатываем специфичные ошибки от бэкенда
			if (errorMessage.includes('уже отклонил')) {
				message.warning(
					'Этот тренер ранее отклонил вашу заявку. Попробуйте выбрать другого тренера.',
				)
			} else if (
				errorMessage.includes('уже есть') ||
				errorMessage.includes('активный тренер')
			) {
				message.info('У вас уже есть тренер. Страница будет обновлена.')
				window.location.reload()
			} else if (errorMessage.includes('уже отправлено')) {
				message.info('Заявка этому тренеру уже отправлена и ожидает ответа.')
			} else {
				message.error(errorMessage)
			}
		} finally {
			setSelectingTrainerId(null)
		}
	}

	// Обработчик отмены заявки
	const handleCancelInvite = async (trainerId: string) => {
		try {
			await cancelInviteByTrainer({ trainerId }).unwrap()
			message.success('Заявка успешно отменена')
		} catch (error: unknown) {
			const apiError = error as { data?: { message?: string } }
			const errorMessage = apiError?.data?.message || 'Не удалось отменить заявку'
			message.error(errorMessage)
		}
	}

	const { showCancelTrainerModal } = useCancelTrainerModal()

	// Обработчик отвязки тренера
	const handleUnlinkTrainer = () => {
		showCancelTrainerModal({
			title: 'Отвязать тренера?',
			content:
				'Вы уверены, что хотите отвязать тренера? Все назначенные планы питания будут удалены.',
			okText: 'Да, отвязать',
			onSuccess: (result) => {
				message.success(result.message)
			},
			onError: (apiError) => {
				const errorMessage = apiError?.data?.message || 'Не удалось отвязать тренера'
				message.error(errorMessage)
			},
		})
	}

	// Переход в чат с тренером
	const handleGoToChat = () => {
		navigate('/trainer')
	}

	// Переход на страницу регистрации
	const handleJoin = () => {
		navigate('/signup')
	}

	// Загрузка (есть токен, но данные ещё грузятся)
	if (isStillLoading) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='flex justify-center items-center py-20'>
					<Spin size='large' />
				</div>
			</div>
		)
	}

	// Неавторизованный пользователь - показываем лендинг
	if (!isAuthenticated) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px] text-center'>
					<Title level={1} className='text-6xl! font-black! mb-6! text-gray-800!'>
						Fitness App
					</Title>
					<Paragraph className='text-xl! text-gray-700! mb-8! max-w-2xl! mx-auto!'>
						Присоединяйтесь к сообществу профессионалов и клиентов. Достигайте целей
						вместе с лучшими тренерами.
					</Paragraph>
					<Button
						type='primary'
						size='large'
						className='h-14! px-12! text-lg! font-semibold! rounded-lg!'
						onClick={handleJoin}
					>
						Присоединиться
					</Button>
				</div>
			</div>
		)
	}

	// Тренер - показываем приветствие и переход в админку
	if (user?.role === 'TRAINER') {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px] text-center'>
					<Title level={1} className='text-5xl! font-black! mb-6! text-gray-800!'>
						👋 Добро пожаловать, {user.name}!
					</Title>
					<Paragraph className='text-xl! text-gray-700! mb-8! max-w-2xl! mx-auto!'>
						Перейдите в панель тренера для управления клиентами и планами питания.
					</Paragraph>
					<Button
						type='primary'
						size='large'
						className='h-14! px-12! text-lg! font-semibold! rounded-lg!'
						onClick={() => navigate('/admin')}
					>
						Панель тренера
					</Button>
				</div>
			</div>
		)
	}

	// Клиент с привязанным тренером
	if (hasTrainer && user.trainer) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
					<div className='text-center mb-8'>
						<Title level={2} className='text-gray-800 font-semibold mb-4 pb-3 border-b-3 border-primary inline-block'>
							🏋️ Ваш тренер
						</Title>
						<Paragraph className='text-gray-600! mb-0!'>
							Вы работаете с персональным тренером
						</Paragraph>
					</div>

					<TrainerCard
						trainer={user.trainer}
						isMyTrainer
						onChat={handleGoToChat}
						onUnlink={handleUnlinkTrainer}
					/>

					{/* Список других тренеров */}
					{availableTrainers.length > 0 && (
						<>
							<Divider />
							<div className='text-center mb-8'>
								<Title
									level={3}
									className='mb-2 flex items-center justify-center gap-2'
								>
									<TeamOutlined /> Другие тренеры
								</Title>
								<Paragraph className='text-gray-600! mb-0!'>
									Вы можете отправить заявку другим тренерам
								</Paragraph>
							</div>

							<TrainersList
								trainers={paginatedTrainers}
								loading={isLoadingTrainers}
								onSelectTrainer={handleSelectTrainer}
								onCancelInvite={handleCancelInvite}
								selectingTrainerId={selectingTrainerId}
								inviteStatuses={inviteStatuses}
							/>

							{availableTrainers.length > TRAINERS_PER_PAGE && (
								<div className='flex justify-center mt-8'>
									<Pagination
										current={currentPage}
										total={availableTrainers.length}
										pageSize={TRAINERS_PER_PAGE}
										onChange={handlePageChange}
										showSizeChanger={false}
										showTotal={(total) => `Всего ${total} тренеров`}
									/>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		)
	}

	// Клиент без тренера - показываем список тренеров с пагинацией
	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
				<div className='text-center mb-8'>
					<Title level={2} className='text-gray-800 font-semibold mb-4 pb-3 border-b-3 border-primary inline-block'>
						🎯 Выберите тренера
					</Title>
					<Paragraph className='text-gray-600! mb-0!'>
						Найдите своего персонального тренера для достижения целей
					</Paragraph>
				</div>

				<TrainersList
					trainers={paginatedTrainers}
					loading={isLoadingTrainers}
					onSelectTrainer={handleSelectTrainer}
					onCancelInvite={handleCancelInvite}
					selectingTrainerId={selectingTrainerId}
					inviteStatuses={inviteStatuses}
				/>

				{availableTrainers.length > TRAINERS_PER_PAGE && (
					<div className='flex justify-center mt-8'>
						<Pagination
							current={currentPage}
							total={availableTrainers.length}
							pageSize={TRAINERS_PER_PAGE}
							onChange={handlePageChange}
							showSizeChanger={false}
							showTotal={(total) => `Всего ${total} тренеров`}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
