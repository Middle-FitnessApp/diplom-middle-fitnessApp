import { ConfigProvider, Layout, App as AntApp } from 'antd'
import { AppRouter } from './router/AppRouter'
import { Header } from './components/Common/Header'
import { lightTheme, darkTheme } from '../theme-config'
import { useAppSelector } from './store/hooks'

function App() {
	const theme = useAppSelector((state) => state.ui.theme)
	const currentTheme = theme === 'dark' ? darkTheme : lightTheme

	return (
		<ConfigProvider theme={currentTheme}>
			<AntApp className='max-w-[2600px] mx-auto'>
				<Layout className='min-h-screen flex flex-col'>
					<Header />
					<AppRouter />
				</Layout>
			</AntApp>
		</ConfigProvider>
	)
}

export default App
