import { ConfigProvider, Layout, App as AntApp } from 'antd'
import { AppRouter } from './router/AppRouter'
import { Header } from './components/Common/Header.tsx'
import type { UserRole } from './components/index.ts'
import { customTheme } from '../theme-config.ts'

const mockData = {
	role: 'client' as UserRole,
	hasUnreadMessages: true,
}

function App() {
	return (
		<ConfigProvider theme={customTheme}>
			<AntApp>
				<Layout className='min-h-screen flex flex-col'>
					<Header role={mockData.role} hasUnreadMessages={mockData.hasUnreadMessages} />
					<AppRouter />
				</Layout>
			</AntApp>
		</ConfigProvider>
	)
}

export default App
