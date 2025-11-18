import type { FormProps } from "antd";
import { Button, Form, Input, Typography } from "antd";

import {
  PersonalInfoFields,
  MeasurementFields,
  FitnessFields,
  MedicalFields,
} from "../../components/forms";
import { REGISTRATION_FIELDS } from "../../constants/accountFields";
import { Link } from "react-router";

const { Title } = Typography;

type FieldType = {
  name: string;
  login: string;
  password: string;
  passcheck: string;
  birthDate: string;
  height: number;
  waist: number;
  chest: number;
  hips: number;
  arm: number;
  leg: number;
  goal: string;
  experience: string;
  medicalInfo: string;
  diet: string;
};

export const Registration = () => {
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 max-w-md mx-auto">
      <Title level={3}>Регистрация</Title>

      <Form
        name="basic"
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        layout="vertical"
      >
        <PersonalInfoFields />
        <MeasurementFields />
        <FitnessFields />
        <MedicalFields />
        // тут должен быть компонент для загрузки фото
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Пожалуйста, введите Ваш пароль!" },
          ]}
        >
          <Input.Password placeholder={REGISTRATION_FIELDS.password} />
        </Form.Item>
        <Form.Item
          name="passcheck"
          rules={[
            { required: true, message: "Пожалуйста повторите Ваш пароль!" },
          ]}
        >
          <Input.Password placeholder={REGISTRATION_FIELDS.passcheck} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>
      <p className="mt-4">
        Уже есть аккаунт? <Link to="/login"> Войти </Link>
      </p>
    </div>
  );
};
