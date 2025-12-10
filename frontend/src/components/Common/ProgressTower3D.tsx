import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import { Card, Typography, Tooltip as AntTooltip, Space, Tag } from 'antd'
import * as THREE from 'three'

const { Text: AntText } = Typography

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
	totalBlocks: number
	onClick: () => void
	isHovered: boolean
	onHover: (hovered: boolean) => void
}

// Компонент одного "этажа" башни
const TowerBlock = ({ position, data, index, totalBlocks, onClick, isHovered, onHover }: TowerBlockProps) => {
	const meshRef = useRef<THREE.Mesh>(null)
	const [hovered, setHovered] = useState(false)
	const [appeared, setAppeared] = useState(false)

	// Анимация появления
	useFrame((state) => {
		if (meshRef.current) {
			// Анимация появления блока
			if (!appeared && state.clock.elapsedTime > index * 0.1) {
				setAppeared(true)
			}

			if (appeared) {
				if (hovered) {
					meshRef.current.rotation.y += 0.02
					// Небольшое покачивание вверх-вниз
					meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05
				} else {
					meshRef.current.position.y = position[1]
				}
			} else {
				// Анимация появления снизу
				const targetY = position[1]
				const currentY = meshRef.current.position.y
				meshRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY, 0.1)
				meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1))
			}
		}
	})

	// Вычисляем цвет на основе прогресса (от красного к зеленому)
	const color = useMemo(() => {
		const progress = index / Math.max(totalBlocks - 1, 1)
		const hue = progress * 120 // 0 (красный) -> 120 (зеленый)
		return `hsl(${hue}, 70%, ${hovered ? 60 : 50}%)`
	}, [index, totalBlocks, hovered])

	// Размер блока зависит от веса (если есть)
	const scale = useMemo(() => {
		const baseScale = 1
		if (data.weight && typeof data.weight === 'number') {
			// Нормализуем вес (предполагаем диапазон 50-150 кг)
			const normalized = Math.max(0.7, Math.min(1.3, data.weight / 100))
			return baseScale * normalized
		}
		return baseScale
	}, [data.weight])

	// Высота блока
	const height = 0.8

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
			<mesh
				ref={meshRef}
				onClick={onClick}
				onPointerOver={handlePointerOver}
				onPointerOut={handlePointerOut}
				castShadow
				receiveShadow
				scale={0.1} // Начальный размер для анимации
			>
				<boxGeometry args={[scale, height, scale]} />
				<meshStandardMaterial
					color={color}
					roughness={0.3}
					metalness={0.6}
					emissive={hovered ? color : '#000000'}
					emissiveIntensity={hovered ? 0.3 : 0}
				/>

				{/* Светящаяся рамка при наведении - внутри mesh */}
				{hovered && (
					<mesh>
						<boxGeometry args={[scale * 1.05, height * 1.05, scale * 1.05]} />
						<meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
					</mesh>
				)}
			</mesh>

			{/* Индикатор наведения - только номер этажа */}
			{hovered && (
				<Text
					position={[0, height / 2 + 0.3, 0]}
					fontSize={0.2}
					color="white"
					anchorX="center"
					anchorY="middle"
					outlineWidth={0.02}
					outlineColor="#000000"
				>
					#{index + 1}
				</Text>
			)}
		</group>
	)
}

// Частицы для эффекта звезд
const StarField = () => {
	const points = useMemo(() => {
		const positions = new Float32Array(200 * 3)
		for (let i = 0; i < 200; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 30
			positions[i * 3 + 1] = Math.random() * 20
			positions[i * 3 + 2] = (Math.random() - 0.5) * 30
		}
		return positions
	}, [])

	return (
		<points>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={points.length / 3}
					array={points}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} />
		</points>
	)
}

// Основная сцена с башней
const TowerScene = ({ data, onBlockClick, onHover }: ProgressTower3DProps & { onHover: (info: HoveredBlockInfo | null) => void }) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const groupRef = useRef<THREE.Group>(null)

	const handleBlockHover = (hovered: boolean, point: ProgressDataPoint, index: number) => {
		setHoveredIndex(hovered ? index : null)
		onHover(hovered ? { data: point, index } : null)
	}

	// Медленное вращение всей башни
	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3
		}
	})

	// Сортируем данные по дате
	const sortedData = useMemo(() => {
		return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	}, [data])

	return (
		<>
			{/* Фон со звездами */}
			<StarField />

			{/* Освещение */}
			<ambientLight intensity={0.5} />
			<directionalLight position={[10, 10, 5]} intensity={1} castShadow />
			<pointLight position={[-10, -10, -5]} intensity={0.5} color="#4080ff" />
			<spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={0.5} castShadow />
			<pointLight position={[5, 5, 5]} intensity={0.3} color="#ff80ff" />

			{/* Башня из блоков */}
			<group ref={groupRef}>
				{sortedData.map((point, index) => (
					<TowerBlock
						key={`${point.date}-${index}`}
						position={[0, index * 0.9, 0]}
						data={point}
						index={index}
						totalBlocks={sortedData.length}
						onClick={() => onBlockClick?.(point, index)}
						isHovered={hoveredIndex === index}
						onHover={(hovered) => handleBlockHover(hovered, point, index)}
					/>
				))}

				{/* Основание башни */}
				<mesh position={[0, -0.5, 0]} receiveShadow>
					<cylinderGeometry args={[2, 2, 0.2, 32]} />
					<meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
				</mesh>

				{/* Светящееся кольцо вокруг основания */}
				<mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
					<torusGeometry args={[2.1, 0.05, 16, 100]} />
					<meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
				</mesh>
			</group>

			{/* Контроллер камеры */}
			<OrbitControls
				enablePan={false}
				enableZoom={true}
				minDistance={8}
				maxDistance={30}
				maxPolarAngle={Math.PI / 2.2}
				target={[0, sortedData.length * 0.35, 0]}
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
							<strong>Высота башни:</strong> {data.length * 1}м
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

			<div style={{ width: '100%', height: '700px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
				<Canvas
					camera={{ position: [6, 5, 10], fov: 60 }}
					shadows
					gl={{ antialias: true, alpha: false }}
				>
					<color attach="background" args={['#0f0f1e']} />
					<fog attach="fog" args={['#0f0f1e', 15, 35]} />
					<TowerScene data={data} onBlockClick={onBlockClick} onHover={setHoveredBlock} />
				</Canvas>
			</div>
		</div>
	)
}

