import { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Card, Typography, Space, Tag } from 'antd'

const { Text: AntText } = Typography

// Генерируем позиции звезд один раз вне компонента
const generateStarPositions = (): Float32Array => {
	const positions = new Float32Array(200 * 3)
	for (let i = 0; i < 200; i++) {
		positions[i * 3] = (Math.random() - 0.5) * 30
		positions[i * 3 + 1] = Math.random() * 20
		positions[i * 3 + 2] = (Math.random() - 0.5) * 30
	}
	return positions
}

const STAR_POSITIONS = generateStarPositions()

interface ProgressDataPoint {
	date: string
	weight?: number
	waist?: number
	hips?: number
	chest?: number
	arm?: number
	leg?: number
	[key: string]: string | number | undefined
}

interface ProgressTower3DProps {
	data: ProgressDataPoint[]
	onBlockClick?: (data: ProgressDataPoint, index: number) => void
}

interface HoveredBlockInfo {
	data: ProgressDataPoint
	index: number
}

interface TowerBlockProps {
	position: [number, number, number]
	data: ProgressDataPoint
	index: number
	onClick: () => void
	onHover: (hovered: boolean) => void
}

// Компонент карточки с информацией о прогрессе
const ProgressCard = ({ data, index, hovered }: { data: ProgressDataPoint; index: number; hovered: boolean }) => {
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		})
	}

	return (
		<div
			style={{
				width: '300px',
				background: hovered 
					? 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,248,255,0.98) 100%)'
					: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.95) 100%)',
				borderRadius: '16px',
				padding: '16px',
				boxShadow: hovered 
					? '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(100,200,255,0.4)'
					: '0 4px 16px rgba(0,0,0,0.2)',
				border: hovered 
					? '2px solid rgba(100,200,255,0.8)'
					: '2px solid rgba(200,200,200,0.5)',
				transition: 'all 0.2s ease',
				transform: hovered ? 'scale(1.02)' : 'scale(1)',
			}}
		>
			{/* Заголовок */}
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginBottom: '12px',
				paddingBottom: '10px',
				borderBottom: '2px solid rgba(100,150,255,0.3)'
			}}>
				<span style={{
					fontSize: '18px',
					fontWeight: 'bold',
					color: '#1a1a2e',
					display: 'flex',
					alignItems: 'center',
					gap: '6px'
				}}>
					<span style={{ fontSize: '20px' }}>📊</span>
					Отчет #{index + 1}
				</span>
				<span style={{
					fontSize: '11px',
					color: '#666',
					background: 'rgba(100,150,255,0.15)',
					padding: '4px 10px',
					borderRadius: '12px',
					fontWeight: '600'
				}}>
					{formatDate(data.date)}
				</span>
			</div>

			{/* Основные метрики */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
				{data.weight && (
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '8px 12px',
						background: 'linear-gradient(90deg, rgba(255,107,107,0.15) 0%, rgba(255,107,107,0.05) 100%)',
						borderRadius: '10px',
						borderLeft: '3px solid #ff6b6b'
					}}>
						<span style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>⚖️ Вес</span>
						<span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff6b6b' }}>
							{data.weight} кг
						</span>
					</div>
				)}

				{data.waist && (
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '8px 12px',
						background: 'linear-gradient(90deg, rgba(74,144,226,0.15) 0%, rgba(74,144,226,0.05) 100%)',
						borderRadius: '10px',
						borderLeft: '3px solid #4a90e2'
					}}>
						<span style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>📏 Талия</span>
						<span style={{ fontSize: '16px', fontWeight: 'bold', color: '#4a90e2' }}>
							{data.waist} см
						</span>
					</div>
				)}

				{data.hips && (
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '8px 12px',
						background: 'linear-gradient(90deg, rgba(149,117,205,0.15) 0%, rgba(149,117,205,0.05) 100%)',
						borderRadius: '10px',
						borderLeft: '3px solid #9575cd'
					}}>
						<span style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>📐 Бедра</span>
						<span style={{ fontSize: '16px', fontWeight: 'bold', color: '#9575cd' }}>
							{data.hips} см
						</span>
					</div>
				)}

				{data.chest && data.chest > 0 && (
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '8px 12px',
						background: 'linear-gradient(90deg, rgba(255,167,38,0.15) 0%, rgba(255,167,38,0.05) 100%)',
						borderRadius: '10px',
						borderLeft: '3px solid #ffa726'
					}}>
						<span style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>💪 Грудь</span>
						<span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffa726' }}>
							{data.chest} см
						</span>
					</div>
				)}

				{data.arm && data.arm > 0 && (
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '8px 12px',
						background: 'linear-gradient(90deg, rgba(102,187,106,0.15) 0%, rgba(102,187,106,0.05) 100%)',
						borderRadius: '10px',
						borderLeft: '3px solid #66bb6a'
					}}>
						<span style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>💪 Рука</span>
						<span style={{ fontSize: '16px', fontWeight: 'bold', color: '#66bb6a' }}>
							{data.arm} см
						</span>
					</div>
				)}

				{data.leg && data.leg > 0 && (
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '8px 12px',
						background: 'linear-gradient(90deg, rgba(38,198,218,0.15) 0%, rgba(38,198,218,0.05) 100%)',
						borderRadius: '10px',
						borderLeft: '3px solid #26c6da'
					}}>
						<span style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>🦵 Нога</span>
						<span style={{ fontSize: '16px', fontWeight: 'bold', color: '#26c6da' }}>
							{data.leg} см
						</span>
					</div>
				)}
			</div>

			{/* Подсказка */}
			{hovered && (
				<div style={{
					marginTop: '12px',
					paddingTop: '10px',
					borderTop: '1px solid rgba(100,150,255,0.2)',
					textAlign: 'center',
					fontSize: '11px',
					color: '#666',
					fontStyle: 'italic'
				}}>
					Кликните для подробностей
				</div>
			)}
		</div>
	)
}

// Компонент одного "этажа" башни - только HTML карточка
const TowerBlock = ({ position, data, index, onClick, onHover }: TowerBlockProps) => {
	const [hovered, setHovered] = useState(false)

	const handlePointerOver = () => {
		setHovered(true)
		onHover(true)
	}

	const handlePointerOut = () => {
		setHovered(false)
		onHover(false)
	}

	return (
		<group position={position}>
			{/* HTML карточка */}
			<Html
				transform
				position={[0, 0, 0]}
				style={{
					pointerEvents: 'auto',
				}}
			>
				<div
					onClick={onClick}
					onMouseEnter={handlePointerOver}
					onMouseLeave={handlePointerOut}
					style={{ cursor: 'pointer' }}
				>
					<ProgressCard data={data} index={index} hovered={hovered} />
				</div>
			</Html>
		</group>
	)
}

// Частицы для эффекта звезд
const StarField = () => {
	return (
		<points>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={STAR_POSITIONS.length / 3}
					array={STAR_POSITIONS}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} />
		</points>
	)
}

// Основная сцена с башней
const TowerScene = ({ data, onBlockClick, onHover }: ProgressTower3DProps & { onHover: (info: HoveredBlockInfo | null) => void }) => {
	const handleBlockHover = (hovered: boolean, point: ProgressDataPoint, index: number) => {
		onHover(hovered ? { data: point, index } : null)
	}

	// Сортируем данные по дате
	const sortedData = useMemo(() => {
		return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	}, [data])

	// Вычисляем центр башни для камеры
	const towerCenter = (sortedData.length - 1) * 2

	return (
		<>
			{/* Фон со звездами */}
			<StarField />

			{/* Освещение */}
			<ambientLight intensity={0.8} />
			<directionalLight position={[10, 10, 5]} intensity={0.5} />

			{/* Башня из карточек */}
			<group>
				{sortedData.map((point, index) => (
					<TowerBlock
						key={`${point.date}-${index}`}
						position={[0, index * 4, 0]}
						data={point}
						index={index}
						onClick={() => onBlockClick?.(point, index)}
						onHover={(hovered) => handleBlockHover(hovered, point, index)}
					/>
				))}

				{/* Основание башни */}
				<mesh position={[0, -1.5, 0]} receiveShadow>
					<cylinderGeometry args={[3, 3, 0.3, 32]} />
					<meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
				</mesh>

				{/* Светящееся кольцо вокруг основания */}
				<mesh position={[0, -1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
					<torusGeometry args={[3.2, 0.08, 16, 100]} />
					<meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
				</mesh>
			</group>

			{/* Контроллер камеры */}
			<OrbitControls
				enablePan={true}
				enableZoom={true}
				minDistance={8}
				maxDistance={50}
				target={[0, towerCenter, 0]}
			/>
		</>
	)
}

// Главный компонент
export const ProgressTower3D = ({ data, onBlockClick }: ProgressTower3DProps) => {
	const [hoveredBlock, setHoveredBlock] = useState<HoveredBlockInfo | null>(null)

	// Вычисляем статистику
	const stats = useMemo(() => {
		if (!data || data.length === 0) return null

		const weights = data.map(d => d.weight).filter(w => w !== undefined) as number[]
		const firstWeight = weights[0]
		const lastWeight = weights[weights.length - 1]
		const weightChange = lastWeight - firstWeight

		return {
			totalReports: data.length,
			firstWeight,
			lastWeight,
			weightChange,
			weightChangePercent: ((weightChange / firstWeight) * 100).toFixed(1),
		}
	}, [data])

	if (!data || data.length === 0) {
		return (
			<Card className="h-[700px] flex items-center justify-center">
				<Space direction="vertical" align="center">
					<AntText type="secondary">Нет данных для отображения 3D визуализации</AntText>
					<Tag color="blue">Добавьте отчеты о прогрессе</Tag>
				</Space>
			</Card>
		)
	}

	return (
		<div className="relative">
			<div className="absolute top-6 left-6 z-10 bg-black/70 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10">
				<Space direction="vertical" size="small">
					<AntText style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
						🎮 Управление
					</AntText>
					<AntText style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>• Вращение: ЛКМ + движение</AntText>
					<AntText style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>• Масштаб: колесо мыши</AntText>
					<AntText style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>• Клик: подробности</AntText>
				</Space>
			</div>

			<div className="absolute top-6 right-6 z-10 bg-black/70 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10 min-w-[260px]">
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<AntText style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
						📊 Статистика
					</AntText>

					{/* Информация о наведенном блоке */}
					{hoveredBlock ? (
						<div style={{ 
							background: 'rgba(255,255,255,0.1)', 
							padding: '10px', 
							borderRadius: '8px',
							border: '1px solid rgba(255,255,255,0.2)',
							marginBottom: '8px'
						}}>
							<AntText style={{ color: '#00ffff', fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
								🎯 Этаж #{hoveredBlock.index + 1}
							</AntText>
							<AntText style={{ color: 'rgba(255,255,255,0.95)', fontSize: '12px', display: 'block' }}>
								📅 {new Date(hoveredBlock.data.date).toLocaleDateString('ru-RU', {
									day: '2-digit',
									month: 'long',
									year: 'numeric'
								})}
							</AntText>
							{hoveredBlock.data.weight && (
								<AntText style={{ color: 'rgba(255,255,255,0.95)', fontSize: '12px', display: 'block', marginTop: '4px' }}>
									⚖️ Вес: <strong>{hoveredBlock.data.weight} кг</strong>
								</AntText>
							)}
							{hoveredBlock.data.waist && (
								<AntText style={{ color: 'rgba(255,255,255,0.95)', fontSize: '12px', display: 'block' }}>
									📏 Талия: <strong>{hoveredBlock.data.waist} см</strong>
								</AntText>
							)}
							{hoveredBlock.data.hips && (
								<AntText style={{ color: 'rgba(255,255,255,0.95)', fontSize: '12px', display: 'block' }}>
									📐 Бедра: <strong>{hoveredBlock.data.hips} см</strong>
								</AntText>
							)}
							{hoveredBlock.data.chest && hoveredBlock.data.chest > 0 && (
								<AntText style={{ color: 'rgba(255,255,255,0.95)', fontSize: '12px', display: 'block' }}>
									💪 Грудь: <strong>{hoveredBlock.data.chest} см</strong>
								</AntText>
							)}
						</div>
					) : (
						<AntText style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontStyle: 'italic', display: 'block', marginBottom: '8px' }}>
							Наведите на блок для просмотра деталей
						</AntText>
					)}

					{/* Общая статистика */}
					<div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
						<AntText style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', display: 'block' }}>
							<strong>Отчетов:</strong> {data.length}
						</AntText>
						<AntText style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', display: 'block' }}>
							<strong>Высота башни:</strong> {data.length * 3}м
						</AntText>
						{stats && stats.firstWeight && stats.lastWeight && (
							<>
								<AntText style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', display: 'block', marginTop: '4px' }}>
									<strong>Вес:</strong> {stats.firstWeight} → {stats.lastWeight} кг
								</AntText>
								<AntText 
									style={{ 
										color: stats.weightChange < 0 ? '#52c41a' : '#ff4d4f', 
										fontSize: '13px',
										fontWeight: 'bold',
										display: 'block'
									}}
								>
									{stats.weightChange > 0 ? '📈' : '📉'} {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} кг ({stats.weightChangePercent}%)
								</AntText>
							</>
						)}
					</div>

					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
						<div style={{ width: '50px', height: '10px', background: 'linear-gradient(to right, hsl(0, 70%, 50%), hsl(120, 70%, 50%))', borderRadius: '5px' }} />
						<AntText style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Прогресс</AntText>
					</div>
				</Space>
			</div>

			<div style={{ width: '100%', height: '700px', position: 'relative', zIndex: 0 }}>
				<Canvas
					camera={{ position: [0, 4, 15], fov: 50 }}
					gl={{ antialias: true, alpha: false }}
					style={{ position: 'relative', zIndex: 0 }}
				>
					<color attach="background" args={['#1a1a2e']} />
					<TowerScene data={data} onBlockClick={onBlockClick} onHover={setHoveredBlock} />
				</Canvas>
			</div>
		</div>
	)
}

