import { Button, Form, Input, Typography } from "antd";
import { Link } from "react-router";

export const SignInPage = () => {
  const { Title } = Typography;

  type FieldType = {
    login?: string;
    password?: string;
  };

  const onFinish = (values: FieldType) => {
    console.log("Success:", values);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 max-w-md mx-auto">
      <Title level={3}>Вход</Title>

      <Form onFinish={onFinish} autoComplete="off">
        <Form.Item
          name="login"
          rules={[
            {
              required: true,
              message: "Пожалуйста, введите email или телефон",
            },
          ]}
        >
          <Input placeholder="Введите email или телефон" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Пожалуйста, введите пароль",
            },
          ]}
        >
          <Input.Password placeholder="Введите пароль" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Вход
          </Button>
        </Form.Item>
      </Form>

      <p className="mt-4">
        Нет аккаунта? <Link to="/signUp"> Зарегистрируйтесь </Link>
      </p>
      <Link to="/#"> Восстановить пароль </Link>
    </div>
  );
};
