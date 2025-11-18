import { Layout } from 'antd';
import { AppRouter } from './router/AppRouter';
import { Header } from './components/Header';
import type { UserRole } from './components/index.ts';

const mockData = {
  role: 'client' as UserRole,
  hasUnreadMessages: true
};

function App() {
  return (
    <Layout className="min-h-screen">
      <Header role={mockData.role} hasUnreadMessages={mockData.hasUnreadMessages} />
      <AppRouter />
    </Layout>
  );
}

export default App;
