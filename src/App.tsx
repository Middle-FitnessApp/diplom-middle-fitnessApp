import { Layout } from 'antd';
import { AppRouter } from './router/AppRouter';
import { Header } from './components/Header';


function App() {
  return (
    <Layout className="min-h-screen">
      <Header />
        <AppRouter />
    </Layout>
  );
}

export default App;