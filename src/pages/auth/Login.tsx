import { Card, Form, Input, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

export const Login = () => {
  const onFinish = (values: any) => {
    console.log('Login values:', values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <Title level={2} className="text-center">Вход</Title>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Введите email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Войти
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Link to="/signup">Зарегистрироваться</Link>
        </div>
      </Card>
    </div>
  );
};