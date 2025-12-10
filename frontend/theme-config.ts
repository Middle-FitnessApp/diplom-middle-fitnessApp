import type { ThemeConfig } from 'antd'
import { theme } from 'antd'

export const customTheme: ThemeConfig = {
	algorithm: theme.defaultAlgorithm,
	token: {
		// Основные цвета
		colorPrimary: 'var(--primary)',
		colorSuccess: 'var(--success)',
		colorWarning: 'var(--warning)',
		colorError: 'var(--danger)',
		colorInfo: 'var(--info)',

		// Фоны
		colorBgLayout: 'var(--bg)',
		colorBgContainer: 'var(--bg-light)',
		colorBgElevated: 'var(--bg-light)',
		colorBgSpotlight: 'var(--bg-dark)',

		// Текст
		colorText: 'var(--text)',
		colorTextSecondary: 'var(--text-muted)',
		colorTextTertiary: 'var(--text-muted)',
		colorTextQuaternary: 'var(--text-muted)',
		colorTextHeading: 'var(--text)',

		// Границы
		colorBorder: 'var(--border)',
		colorBorderSecondary: 'var(--border-muted)',

		// Hover/Active состояния
		colorPrimaryHover: 'var(--info)',
		colorPrimaryActive: 'var(--primary)',

		// Заливки
		colorFill: 'var(--bg)',
		colorFillSecondary: 'var(--bg)',
		colorFillTertiary: 'var(--bg-dark)',
		colorFillQuaternary: 'var(--bg-light)',

		// Скругления
		borderRadius: 8,
		borderRadiusLG: 12,
		borderRadiusSM: 6,

		// Тени
		boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
		boxShadowSecondary: '0 8px 25px rgba(0, 0, 0, 0.12)',
	},
	components: {
		Layout: {
			bodyBg: 'var(--bg)',
			headerBg: 'var(--bg-light)',
			siderBg: 'var(--bg-light)',
			triggerBg: 'var(--primary)',
			triggerColor: 'var(--highlight)',
		},
		Card: {
			colorBgContainer: 'var(--bg-light)',
			colorBorderSecondary: 'var(--border-muted)',
			borderRadiusLG: 16,
		},
		Button: {
			colorPrimary: 'var(--primary)',
			colorPrimaryHover: 'var(--info)',
			colorPrimaryActive: 'var(--primary)',
			defaultBg: 'var(--bg-light)',
			defaultColor: 'var(--text)',
			defaultBorderColor: 'var(--border)',
			defaultHoverColor: 'var(--info)',
			defaultHoverBorderColor: 'var(--info)',
			defaultHoverBg: 'var(--bg-light)',
			primaryShadow: 'none',
			textHoverBg: 'var(--bg)',
			linkHoverBg: 'transparent',
			borderRadius: 8,
			controlHeight: 40,
		},
		Input: {
			colorBgContainer: 'var(--bg-light)',
			colorBorder: 'var(--border)',
			colorPrimaryHover: 'var(--primary)',
			colorPrimary: 'var(--primary)',
			hoverBorderColor: 'var(--primary)',
			activeBorderColor: 'var(--primary)',
			addonBg: 'var(--bg)',
			borderRadius: 8,
		},
		InputNumber: {
			colorBgContainer: 'var(--bg-light)',
			colorBorder: 'var(--border)',
			colorPrimaryHover: 'var(--primary)',
			colorPrimary: 'var(--primary)',
			hoverBorderColor: 'var(--primary)',
			activeBorderColor: 'var(--primary)',
			borderRadius: 8,
		},
		DatePicker: {
			colorBgContainer: 'var(--bg-light)',
			colorBorder: 'var(--border)',
			colorPrimaryHover: 'var(--primary)',
			colorPrimary: 'var(--primary)',
			hoverBorderColor: 'var(--primary)',
			activeBorderColor: 'var(--primary)',
			borderRadius: 8,
		},
		Select: {
			colorBgContainer: 'var(--bg-light)',
			colorBorder: 'var(--border)',
			colorPrimary: 'var(--primary)',
			colorPrimaryHover: 'var(--primary)',
			optionSelectedBg: 'var(--bg)',
			optionActiveBg: 'var(--bg-dark)',
			borderRadius: 8,
		},
		Checkbox: {
			colorPrimary: 'var(--primary)',
			colorBgContainer: 'var(--bg-light)',
			borderRadiusSM: 4,
		},
		Radio: {
			colorPrimary: 'var(--primary)',
			colorBgContainer: 'var(--bg-light)',
		},
		Menu: {
			colorPrimary: 'var(--primary)',
			itemSelectedBg: 'var(--bg)',
			itemHoverBg: 'var(--bg)',
			itemColor: 'var(--text)',
			itemSelectedColor: 'var(--primary)',
			itemHoverColor: 'var(--primary)',
			itemBorderRadius: 8,
		},
		Table: {
			colorBgContainer: 'var(--bg-light)',
			borderColor: 'var(--border-muted)',
			headerBg: 'var(--bg)',
			headerColor: 'var(--text)',
			headerSplitColor: 'var(--border-muted)',
			rowHoverBg: 'var(--bg)',
			borderRadius: 12,
		},
		Modal: {
			colorBgContainer: 'var(--bg-light)',
			colorBgElevated: 'var(--bg-light)',
			headerBg: 'var(--bg-light)',
			contentBg: 'var(--bg-light)',
			borderRadiusLG: 16,
		},
		Drawer: {
			colorBgContainer: 'var(--bg-light)',
			colorBgElevated: 'var(--bg-light)',
		},
		Tabs: {
			colorBgContainer: 'transparent',
			colorBorderSecondary: 'var(--border-muted)',
			itemColor: 'var(--text-muted)',
			itemSelectedColor: 'var(--primary)',
			itemHoverColor: 'var(--primary)',
			inkBarColor: 'var(--primary)',
		},
		Form: {
			labelColor: 'var(--text)',
			labelRequiredMarkColor: 'var(--danger)',
			itemMarginBottom: 20,
		},
		Alert: {
			colorErrorBg: '#fff2f0',
			colorErrorBorder: '#ffccc7',
			colorWarningBg: '#fffbe6',
			colorWarningBorder: '#ffe58f',
			colorSuccessBg: '#f6ffed',
			colorSuccessBorder: '#b7eb8f',
			colorInfoBg: '#e6f4ff',
			colorInfoBorder: '#91caff',
			borderRadiusLG: 8,
		},
		Notification: {
			colorBgElevated: '#ffffff',
			colorText: 'var(--text)',
			colorTextHeading: 'var(--text)',
			borderRadiusLG: 12,
		},
		Message: {
			colorBgElevated: '#ffffff',
			colorText: 'var(--text)',
			borderRadiusLG: 8,
		},
		Tooltip: {
			colorBgSpotlight: 'var(--bg-dark)',
			colorText: 'var(--highlight)',
			borderRadius: 8,
		},
		Dropdown: {
			colorBgElevated: 'var(--bg-light)',
			controlItemBgHover: 'var(--primary)',
			controlItemBgActive: 'var(--primary)',
			borderRadiusLG: 12,
		},
		List: {
			colorBgContainer: 'var(--bg-light)',
			colorBorder: 'var(--border)',
		},
		Descriptions: {
			colorBgContainer: 'var(--bg-light)',
		},
		Tag: {
			borderRadiusSM: 6,
		},
		Badge: {
			colorBgContainer: 'var(--danger)',
		},
		Pagination: {
			colorPrimary: 'var(--primary)',
			colorPrimaryHover: 'var(--info)',
			borderRadius: 8,
		},
		Segmented: {
			colorBgLayout: 'var(--bg)',
			colorBgElevated: 'var(--bg-light)',
			itemSelectedBg: 'var(--primary)',
			itemSelectedColor: 'var(--highlight)',
			borderRadius: 8,
		},
		Collapse: {
			colorBgContainer: 'var(--bg-light)',
			headerBg: 'var(--bg)',
			borderRadiusLG: 12,
		},
		Empty: {
			colorText: 'var(--text-muted)',
			colorTextDescription: 'var(--text-muted)',
		},
		Spin: {
			colorPrimary: 'var(--primary)',
		},
		Divider: {
			colorSplit: 'var(--border-muted)',
		},
		Avatar: {
			colorBgContainer: 'var(--bg)',
		},
		Skeleton: {
			colorFill: 'var(--bg)',
			colorFillContent: 'var(--border-muted)',
		},
		Upload: {
			colorBgContainer: 'var(--bg-light)',
			colorBorder: 'var(--border)',
			colorPrimaryHover: 'var(--primary)',
		},
	},
}
