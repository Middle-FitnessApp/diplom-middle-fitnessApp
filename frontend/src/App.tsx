import { ConfigProvider, Layout } from 'antd'
import { AppRouter } from './router/AppRouter'
import { Header } from './components/Common/Header'
import { lightTheme, darkTheme } from '../theme-config'
import { useAppSelector } from './store/hooks'
import { useSocket } from './hooks/useSocket'

function App() {
	const theme = useAppSelector((state) => state.ui.theme)
	const currentTheme = theme === 'dark' ? darkTheme : lightTheme

	// Подключаем Socket.IO
	useSocket()

	return (
		<ConfigProvider theme={currentTheme}>
			<Layout className='min-h-screen flex flex-col'>
				<Header />
				<AppRouter />
			</Layout>
		</ConfigProvider>
	)
}

export default App
