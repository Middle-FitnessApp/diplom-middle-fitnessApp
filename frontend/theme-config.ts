import type { ThemeConfig } from 'antd'
import { theme } from 'antd'

// Базовые токены, общие для обеих тем
const baseTokens = {
	// Скругления
	borderRadius: 10,
	borderRadiusLG: 14,
	borderRadiusSM: 6,

	// Размеры
	controlHeight: 40,
	controlHeightLG: 48,
	controlHeightSM: 32,

	// Шрифты
	fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	fontSize: 14,
	fontSizeLG: 16,
	fontSizeSM: 12,
}

// Базовые настройки компонентов
const baseComponents = {
	Card: {
		borderRadiusLG: 16,
		paddingLG: 24,
	},
	Button: {
		primaryShadow: 'none',
		borderRadius: 10,
		controlHeight: 40,
		controlHeightLG: 48,
		fontWeight: 600,
	},
	Input: {
		borderRadius: 10,
		paddingBlock: 10,
		paddingInline: 14,
	},
	InputNumber: {
		borderRadius: 10,
	},
	DatePicker: {
		borderRadius: 10,
	},
	Select: {
		borderRadius: 10,
	},
	Checkbox: {
		borderRadiusSM: 4,
	},
	Menu: {
		itemBorderRadius: 8,
	},
	Table: {
		borderRadius: 14,
	},
	Modal: {
		borderRadiusLG: 16,
	},
	Tabs: {
		colorBgContainer: 'transparent',
	},
	Form: {
		itemMarginBottom: 20,
	},
	Alert: {
		borderRadiusLG: 10,
	},
	Notification: {
		borderRadiusLG: 14,
	},
	Message: {
		borderRadiusLG: 10,
	},
	Tooltip: {
		borderRadius: 8,
	},
	Dropdown: {
		borderRadiusLG: 14,
	},
	Tag: {
		borderRadiusSM: 6,
	},
	Pagination: {
		borderRadius: 8,
	},
	Segmented: {
		borderRadius: 10,
	},
	Collapse: {
		borderRadiusLG: 14,
	},
}

// 🌞 Светлая тема
export const lightTheme: ThemeConfig = {
	algorithm: theme.defaultAlgorithm,
	token: {
		...baseTokens,
		// Основные цвета
		colorPrimary: '#14b8a6', // Teal-500
		colorSuccess: '#22c55e', // Green-500
		colorWarning: '#f59e0b', // Amber-500
		colorError: '#ef4444', // Red-500
		colorInfo: '#3b82f6', // Blue-500

		// Фоны
		colorBgLayout: '#f8fafb',
		colorBgContainer: '#ffffff',
		colorBgElevated: '#ffffff',
		colorBgSpotlight: '#e2e8f0',

		// Текст
		colorText: '#1e293b',
		colorTextSecondary: '#64748b',
		colorTextTertiary: '#94a3b8',
		colorTextQuaternary: '#cbd5e1',
		colorTextHeading: '#0f172a',

		// Границы
		colorBorder: '#e2e8f0',
		colorBorderSecondary: '#f1f5f9',

		// Hover/Active
		colorPrimaryHover: '#0d9488',
		colorPrimaryActive: '#0f766e',

		// Заливки
		colorFill: '#f1f5f9',
		colorFillSecondary: '#f8fafc',
		colorFillTertiary: '#e2e8f0',
		colorFillQuaternary: '#ffffff',

		// Тени
		boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
		boxShadowSecondary: '0 8px 25px rgba(15, 23, 42, 0.12)',
	},
	components: {
		...baseComponents,
		Layout: {
			bodyBg: '#f8fafb',
			headerBg: '#ffffff',
			siderBg: '#ffffff',
			triggerBg: '#14b8a6',
			triggerColor: '#ffffff',
		},
		Card: {
			...baseComponents.Card,
			colorBgContainer: '#ffffff',
			colorBorderSecondary: '#f1f5f9',
		},
		Button: {
			...baseComponents.Button,
			colorPrimary: '#14b8a6',
			colorPrimaryHover: '#0d9488',
			colorPrimaryActive: '#0f766e',
			defaultBg: '#ffffff',
			defaultColor: '#334155',
			defaultBorderColor: '#e2e8f0',
			defaultHoverColor: '#14b8a6',
			defaultHoverBorderColor: '#14b8a6',
			defaultHoverBg: '#f0fdfa',
			textHoverBg: '#f1f5f9',
			linkHoverBg: 'transparent',
		},
		Input: {
			...baseComponents.Input,
			colorBgContainer: '#ffffff',
			colorBorder: '#e2e8f0',
			colorPrimaryHover: '#14b8a6',
			colorPrimary: '#14b8a6',
			hoverBorderColor: '#14b8a6',
			activeBorderColor: '#14b8a6',
			activeShadow: '0 0 0 2px rgba(20, 184, 166, 0.1)',
			addonBg: '#f8fafc',
		},
		InputNumber: {
			...baseComponents.InputNumber,
			colorBgContainer: '#ffffff',
			colorBorder: '#e2e8f0',
			colorPrimaryHover: '#14b8a6',
			colorPrimary: '#14b8a6',
			hoverBorderColor: '#14b8a6',
			activeBorderColor: '#14b8a6',
		},
		DatePicker: {
			...baseComponents.DatePicker,
			colorBgContainer: '#ffffff',
			colorBorder: '#e2e8f0',
			colorPrimaryHover: '#14b8a6',
			colorPrimary: '#14b8a6',
			hoverBorderColor: '#14b8a6',
			activeBorderColor: '#14b8a6',
		},
		Select: {
			...baseComponents.Select,
			colorBgContainer: '#ffffff',
			colorBorder: '#e2e8f0',
			colorPrimary: '#14b8a6',
			colorPrimaryHover: '#14b8a6',
			optionSelectedBg: '#f0fdfa',
			optionActiveBg: '#ccfbf1',
		},
		Checkbox: {
			...baseComponents.Checkbox,
			colorPrimary: '#14b8a6',
			colorBgContainer: '#ffffff',
		},
		Radio: {
			colorPrimary: '#14b8a6',
			colorBgContainer: '#ffffff',
		},
		Menu: {
			...baseComponents.Menu,
			colorPrimary: '#14b8a6',
			itemSelectedBg: '#f0fdfa',
			itemHoverBg: '#f8fafc',
			itemColor: '#334155',
			itemSelectedColor: '#14b8a6',
			itemHoverColor: '#14b8a6',
		},
		Table: {
			...baseComponents.Table,
			colorBgContainer: '#ffffff',
			borderColor: '#f1f5f9',
			headerBg: '#f8fafc',
			headerColor: '#334155',
			headerSplitColor: '#f1f5f9',
			rowHoverBg: '#f8fafc',
		},
		Modal: {
			...baseComponents.Modal,
			colorBgContainer: '#ffffff',
			colorBgElevated: '#ffffff',
			headerBg: '#ffffff',
			contentBg: '#ffffff',
		},
		Drawer: {
			colorBgContainer: '#ffffff',
			colorBgElevated: '#ffffff',
		},
		Tabs: {
			...baseComponents.Tabs,
			colorBorderSecondary: '#f1f5f9',
			itemColor: '#64748b',
			itemSelectedColor: '#14b8a6',
			itemHoverColor: '#14b8a6',
			inkBarColor: '#14b8a6',
		},
		Form: {
			...baseComponents.Form,
			labelColor: '#334155',
			labelRequiredMarkColor: '#ef4444',
		},
		Alert: {
			...baseComponents.Alert,
			colorErrorBg: '#fef2f2',
			colorErrorBorder: '#fecaca',
			colorWarningBg: '#fffbeb',
			colorWarningBorder: '#fde68a',
			colorSuccessBg: '#f0fdf4',
			colorSuccessBorder: '#bbf7d0',
			colorInfoBg: '#eff6ff',
			colorInfoBorder: '#bfdbfe',
		},
		Notification: {
			...baseComponents.Notification,
			colorBgElevated: '#ffffff',
			colorText: '#334155',
			colorTextHeading: '#1e293b',
		},
		Message: {
			...baseComponents.Message,
			colorBgElevated: '#ffffff',
			colorText: '#334155',
		},
		Tooltip: {
			...baseComponents.Tooltip,
			colorBgSpotlight: '#1e293b',
			colorText: '#ffffff',
		},
		Dropdown: {
			...baseComponents.Dropdown,
			colorBgElevated: '#ffffff',
			controlItemBgHover: '#f0fdfa',
			controlItemBgActive: '#ccfbf1',
		},
		List: {
			colorBgContainer: '#ffffff',
			colorBorder: '#e2e8f0',
		},
		Descriptions: {
			colorBgContainer: '#ffffff',
		},
		Badge: {
			colorBgContainer: '#ef4444',
		},
		Segmented: {
			colorBgLayout: '#f1f5f9',
			colorBgElevated: '#ffffff',
			itemSelectedBg: '#14b8a6',
			itemSelectedColor: '#ffffff',
		},
		Collapse: {
			...baseComponents.Collapse,
			colorBgContainer: '#ffffff',
			headerBg: '#f8fafc',
		},
		Empty: {
			colorText: '#94a3b8',
			colorTextDescription: '#94a3b8',
		},
		Spin: {
			colorPrimary: '#14b8a6',
		},
		Divider: {
			colorSplit: '#f1f5f9',
		},
		Avatar: {
			colorBgContainer: '#f1f5f9',
		},
		Skeleton: {
			colorFill: '#f1f5f9',
			colorFillContent: '#e2e8f0',
		},
		Upload: {
			colorBgContainer: '#ffffff',
			colorBorder: '#e2e8f0',
			colorPrimaryHover: '#14b8a6',
		},
	},
}

// 🌙 Тёмная тема
export const darkTheme: ThemeConfig = {
	algorithm: theme.darkAlgorithm,
	token: {
		...baseTokens,
		// Основные цвета (ярче для тёмной темы)
		colorPrimary: '#2dd4bf', // Teal-400
		colorSuccess: '#4ade80', // Green-400
		colorWarning: '#fbbf24', // Amber-400
		colorError: '#f87171', // Red-400
		colorInfo: '#60a5fa', // Blue-400

		// Фоны
		colorBgLayout: '#0f172a',
		colorBgContainer: '#1e293b',
		colorBgElevated: '#1e293b',
		colorBgSpotlight: '#334155',

		// Текст
		colorText: '#f1f5f9',
		colorTextSecondary: '#94a3b8',
		colorTextTertiary: '#64748b',
		colorTextQuaternary: '#475569',
		colorTextHeading: '#f8fafc',

		// Границы
		colorBorder: '#334155',
		colorBorderSecondary: '#1e293b',

		// Hover/Active
		colorPrimaryHover: '#5eead4',
		colorPrimaryActive: '#14b8a6',

		// Заливки
		colorFill: '#334155',
		colorFillSecondary: '#1e293b',
		colorFillTertiary: '#475569',
		colorFillQuaternary: '#0f172a',

		// Тени
		boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
		boxShadowSecondary: '0 8px 25px rgba(0, 0, 0, 0.5)',
	},
	components: {
		...baseComponents,
		Layout: {
			bodyBg: '#0f172a',
			headerBg: '#1e293b',
			siderBg: '#1e293b',
			triggerBg: '#2dd4bf',
			triggerColor: '#0f172a',
		},
		Card: {
			...baseComponents.Card,
			colorBgContainer: '#1e293b',
			colorBorderSecondary: '#334155',
		},
		Button: {
			...baseComponents.Button,
			colorPrimary: '#2dd4bf',
			colorPrimaryHover: '#5eead4',
			colorPrimaryActive: '#14b8a6',
			defaultBg: '#1e293b',
			defaultColor: '#e2e8f0',
			defaultBorderColor: '#334155',
			defaultHoverColor: '#2dd4bf',
			defaultHoverBorderColor: '#2dd4bf',
			defaultHoverBg: '#134e4a',
			textHoverBg: '#334155',
			linkHoverBg: 'transparent',
		},
		Input: {
			...baseComponents.Input,
			colorBgContainer: '#1e293b',
			colorBorder: '#334155',
			colorPrimaryHover: '#2dd4bf',
			colorPrimary: '#2dd4bf',
			hoverBorderColor: '#2dd4bf',
			activeBorderColor: '#2dd4bf',
			activeShadow: '0 0 0 2px rgba(45, 212, 191, 0.15)',
			addonBg: '#0f172a',
		},
		InputNumber: {
			...baseComponents.InputNumber,
			colorBgContainer: '#1e293b',
			colorBorder: '#334155',
			colorPrimaryHover: '#2dd4bf',
			colorPrimary: '#2dd4bf',
			hoverBorderColor: '#2dd4bf',
			activeBorderColor: '#2dd4bf',
		},
		DatePicker: {
			...baseComponents.DatePicker,
			colorBgContainer: '#1e293b',
			colorBorder: '#334155',
			colorPrimaryHover: '#2dd4bf',
			colorPrimary: '#2dd4bf',
			hoverBorderColor: '#2dd4bf',
			activeBorderColor: '#2dd4bf',
		},
		Select: {
			...baseComponents.Select,
			colorBgContainer: '#1e293b',
			colorBorder: '#334155',
			colorPrimary: '#2dd4bf',
			colorPrimaryHover: '#2dd4bf',
			optionSelectedBg: '#134e4a',
			optionActiveBg: '#115e59',
		},
		Checkbox: {
			...baseComponents.Checkbox,
			colorPrimary: '#2dd4bf',
			colorBgContainer: '#1e293b',
		},
		Radio: {
			colorPrimary: '#2dd4bf',
			colorBgContainer: '#1e293b',
		},
		Menu: {
			...baseComponents.Menu,
			colorPrimary: '#2dd4bf',
			itemSelectedBg: '#134e4a',
			itemHoverBg: '#334155',
			itemColor: '#e2e8f0',
			itemSelectedColor: '#2dd4bf',
			itemHoverColor: '#2dd4bf',
		},
		Table: {
			...baseComponents.Table,
			colorBgContainer: '#1e293b',
			borderColor: '#334155',
			headerBg: '#0f172a',
			headerColor: '#e2e8f0',
			headerSplitColor: '#334155',
			rowHoverBg: '#334155',
		},
		Modal: {
			...baseComponents.Modal,
			colorBgContainer: '#1e293b',
			colorBgElevated: '#1e293b',
			headerBg: '#1e293b',
			contentBg: '#1e293b',
		},
		Drawer: {
			colorBgContainer: '#1e293b',
			colorBgElevated: '#1e293b',
		},
		Tabs: {
			...baseComponents.Tabs,
			colorBorderSecondary: '#334155',
			itemColor: '#94a3b8',
			itemSelectedColor: '#2dd4bf',
			itemHoverColor: '#2dd4bf',
			inkBarColor: '#2dd4bf',
		},
		Form: {
			...baseComponents.Form,
			labelColor: '#e2e8f0',
			labelRequiredMarkColor: '#f87171',
		},
		Alert: {
			...baseComponents.Alert,
			colorErrorBg: '#450a0a',
			colorErrorBorder: '#7f1d1d',
			colorWarningBg: '#451a03',
			colorWarningBorder: '#78350f',
			colorSuccessBg: '#052e16',
			colorSuccessBorder: '#14532d',
			colorInfoBg: '#0c1929',
			colorInfoBorder: '#1e3a5f',
		},
		Notification: {
			...baseComponents.Notification,
			colorBgElevated: '#1e293b',
			colorText: '#e2e8f0',
			colorTextHeading: '#f8fafc',
		},
		Message: {
			...baseComponents.Message,
			colorBgElevated: '#1e293b',
			colorText: '#e2e8f0',
		},
		Tooltip: {
			...baseComponents.Tooltip,
			colorBgSpotlight: '#475569',
			colorText: '#f8fafc',
		},
		Dropdown: {
			...baseComponents.Dropdown,
			colorBgElevated: '#1e293b',
			controlItemBgHover: '#134e4a',
			controlItemBgActive: '#115e59',
		},
		List: {
			colorBgContainer: '#1e293b',
			colorBorder: '#334155',
		},
		Descriptions: {
			colorBgContainer: '#1e293b',
		},
		Badge: {
			colorBgContainer: '#f87171',
		},
		Segmented: {
			colorBgLayout: '#0f172a',
			colorBgElevated: '#1e293b',
			itemSelectedBg: '#2dd4bf',
			itemSelectedColor: '#0f172a',
		},
		Collapse: {
			...baseComponents.Collapse,
			colorBgContainer: '#1e293b',
			headerBg: '#0f172a',
		},
		Empty: {
			colorText: '#64748b',
			colorTextDescription: '#64748b',
		},
		Spin: {
			colorPrimary: '#2dd4bf',
		},
		Divider: {
			colorSplit: '#334155',
		},
		Avatar: {
			colorBgContainer: '#334155',
		},
		Skeleton: {
			colorFill: '#334155',
			colorFillContent: '#475569',
		},
		Upload: {
			colorBgContainer: '#1e293b',
			colorBorder: '#334155',
			colorPrimaryHover: '#2dd4bf',
		},
	},
}

// Для обратной совместимости
export const customTheme = lightTheme
