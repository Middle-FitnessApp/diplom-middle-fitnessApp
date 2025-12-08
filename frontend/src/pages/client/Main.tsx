import React, { useState, useMemo } from 'react'
import { Button, Typography, message, Modal, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { TrainerCard, TrainersList } from '../../components/Client'
import { useAppSelector } from '../../store/hooks'
import {
	useGetMeQuery,
	useGetAllTrainersQuery,
	useInviteTrainerMutation,
	useCancelTrainerMutation,
} from '../../store/api/user.api'

const { Title, Paragraph } = Typography

export const Main: React.FC = () => {
	const navigate = useNavigate()
	const [selectingTrainerId, setSelectingTrainerId] = useState<string | null>(null)

	// Проверяем наличие токена в Redux
	const token = useAppSelector((state) => state.auth.token)

	// Получаем данные о текущем пользователе (только если есть токен)
	const { data: meData, isLoading: isLoadingMe } = useGetMeQuery(undefined, {
		skip: !token,
	})

	// Получаем список всех тренеров (с статусами приглашений для авторизованного клиента)
	const { data: trainersData, isLoading: isLoadingTrainers } = useGetAllTrainersQuery()

	// Мутации
	const [inviteTrainer] = useInviteTrainerMutation()
	const [cancelTrainer, { isLoading: isCanceling }] = useCancelTrainerMutation()

	const user = meData?.user
	// Авторизован = есть токен И загружены данные пользователя
	const isAuthenticated = !!token && !!user
	// Ещё загружается = есть токен, но данных пока нет
	const isStillLoading = !!token && isLoadingMe
	const isClient = user?.role === 'CLIENT'
	const hasTrainer = isClient && !!user?.trainer
	const trainers = trainersData?.trainers || []

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
			// Данные обновятся автоматически через invalidatesTags
		} catch (error: any) {
			const errorMessage = error?.data?.message || error?.data?.error?.message || 'Не удалось отправить заявку'
			
			// Обрабатываем специфичные ошибки от бэкенда
			if (errorMessage.includes('уже отклонил')) {
				message.warning('Этот тренер ранее отклонил вашу заявку. Попробуйте выбрать другого тренера.')
			} else if (errorMessage.includes('уже есть') || errorMessage.includes('активный тренер')) {
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
	// Примечание: бэкенд пока не поддерживает отмену PENDING приглашений
	const handleCancelInvite = (_trainerId: string) => {
		Modal.confirm({
			title: 'Отменить заявку?',
			icon: <ExclamationCircleOutlined />,
			content: 'Функция отмены заявки пока недоступна. Дождитесь ответа тренера или выберите другого.',
			okText: 'Понятно',
			cancelButtonProps: { style: { display: 'none' } },
		})
	}

	// Обработчик отвязки тренера
	const handleUnlinkTrainer = () => {
		Modal.confirm({
			title: 'Отвязать тренера?',
			icon: <ExclamationCircleOutlined />,
			content:
				'Вы уверены, что хотите отвязать тренера? Все назначенные планы питания будут удалены.',
			okText: 'Да, отвязать',
			cancelText: 'Отмена',
			okButtonProps: { danger: true },
			async onOk() {
				try {
					const result = await cancelTrainer().unwrap()
					message.success(result.message)
				} catch (error: any) {
					const errorMessage =
						error?.data?.message || 'Не удалось отвязать тренера'
					message.error(errorMessage)
				}
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
			<div className="page-container gradient-bg">
				<div className="flex justify-center items-center py-20">
					<Spin size="large" />
				</div>
			</div>
		)
	}

	// Неавторизованный пользователь - показываем лендинг
	if (!isAuthenticated) {
		return (
			<div className="page-container gradient-bg">
				<div className="page-card text-center">
					<Title
						level={1}
						className="!text-6xl !font-black !mb-6 !text-gray-800"
					>
						Fitness App
					</Title>
					<Paragraph className="!text-xl !text-gray-700 !mb-8 !max-w-2xl !mx-auto">
						Присоединяйтесь к сообществу профессионалов и клиентов.
						Достигайте целей вместе с лучшими тренерами.
					</Paragraph>
					<Button
						type="primary"
						size="large"
						className="!h-14 !px-12 !text-lg !font-semibold !rounded-lg"
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
			<div className="page-container gradient-bg">
				<div className="page-card text-center">
					<Title
						level={1}
						className="!text-5xl !font-black !mb-6 !text-gray-800"
					>
						👋 Добро пожаловать, {user.name}!
					</Title>
					<Paragraph className="!text-xl !text-gray-700 !mb-8 !max-w-2xl !mx-auto">
						Перейдите в панель тренера для управления клиентами и
						планами питания.
					</Paragraph>
					<Button
						type="primary"
						size="large"
						className="!h-14 !px-12 !text-lg !font-semibold !rounded-lg"
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
			<div className="page-container gradient-bg">
				<div className="page-card">
					<div className="section-header">
						<Title level={2} className="section-title !mb-2">
							🏋️ Ваш тренер
						</Title>
						<Paragraph className="!text-gray-600 !mb-0">
							Вы работаете с персональным тренером
						</Paragraph>
					</div>

					<TrainerCard
						trainer={user.trainer}
						isMyTrainer
						onChat={handleGoToChat}
						onUnlink={handleUnlinkTrainer}
						loading={isCanceling}
					/>
				</div>
			</div>
		)
	}

	// Клиент без тренера - показываем список тренеров
	return (
		<div className="page-container gradient-bg">
			<div className="page-card">
				<div className="section-header">
					<Title level={2} className="section-title !mb-2">
						🎯 Выберите тренера
					</Title>
					<Paragraph className="!text-gray-600 !mb-0">
						Найдите своего персонального тренера для достижения целей
					</Paragraph>
				</div>

				<TrainersList
					trainers={trainers}
					loading={isLoadingTrainers}
					onSelectTrainer={handleSelectTrainer}
					onCancelInvite={handleCancelInvite}
					selectingTrainerId={selectingTrainerId}
					inviteStatuses={inviteStatuses}
				/>
			</div>
		</div>
	)
}
