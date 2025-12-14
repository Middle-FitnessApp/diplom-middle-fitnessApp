import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { App as AntApp } from 'antd'
import { store, persistor } from './store'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
	<AntApp>
		<StrictMode>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</PersistGate>
			</Provider>
		</StrictMode>
	</AntApp>,
)
