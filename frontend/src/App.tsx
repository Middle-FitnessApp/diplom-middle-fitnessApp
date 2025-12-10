import { ConfigProvider, Layout, App as AntApp } from 'antd'
import { AppRouter } from './router/AppRouter'
import { Header } from './components/Common/Header'
import { customTheme } from '../theme-config'

function App() {
	return (
		<ConfigProvider theme={customTheme}>
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
