import { DatePicker, Form, Input } from "antd";
import { REGISTRATION_FIELDS } from "../../constants/accountFields";

export const PersonalInfoFields = () => (
  <>
    <Form.Item
      name="name"
      rules={[{ required: true, message: "Введите Имя!" }]}
    >
      <Input placeholder={REGISTRATION_FIELDS.name} />
    </Form.Item>

    <Form.Item
      name="login"
      rules={[
        { required: true, message: "Пожалуйста, введите email или телефон!" },
      ]}
    >
      <Input placeholder={REGISTRATION_FIELDS.login} />
    </Form.Item>

    <Form.Item
      name="birthDate"
      rules={[
        { required: true, message: "Пожалуйста, выберите дату рождения" },
      ]}
    >
      <DatePicker
        placeholder={REGISTRATION_FIELDS.birthDate}
        format="DD.MM.YYYY"
        style={{ width: "100%" }}
      />
    </Form.Item>
  </>
);
