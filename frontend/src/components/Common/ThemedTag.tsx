import React from 'react'
import { Tag, type TagProps } from 'antd'

export interface ThemedTagProps extends TagProps {
	baseColor: string
	isDark: boolean
}

/**
 * Темизированный тег, адаптирующийся под светлую/тёмную тему.
 * - В светлой теме: полупрозрачный фон + цветной текст
 * - В тёмной теме: сплошной цвет + белый текст
 */

export const ThemedTag: React.FC<ThemedTagProps> = ({
	baseColor,
	isDark,
	children,
	className = '',
	...rest
}) => {
	return (
		<Tag
			className={`text-xs ${className}`}
			style={{
				backgroundColor: isDark ? baseColor : `${baseColor}20`,
				borderColor: baseColor,
				color: isDark ? '#ffffff' : baseColor,
			}}
			{...rest}
		>
			{children}
		</Tag>
	)
}
