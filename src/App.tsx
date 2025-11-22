import { ConfigProvider, Layout } from 'antd'
import { AppRouter } from './router/AppRouter'
import { Header } from './components/Header'
import type { UserRole } from './components/index.ts'
import { customTheme } from '../theme-config.ts'

const mockData = {
	role: 'client' as UserRole,
	hasUnreadMessages: true,
}

function App() {
	return (
		<ConfigProvider theme={customTheme}>
			<Layout className='min-h-screen flex flex-col'>
				<Header role={mockData.role} hasUnreadMessages={mockData.hasUnreadMessages} />
				<Layout className='pageLayout'>
					<AppRouter />
				</Layout>
			</Layout>
		</ConfigProvider>
	)
}

export default App
