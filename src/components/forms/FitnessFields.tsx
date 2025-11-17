import { Form, Select } from "antd";
import { REGISTRATION_FIELDS } from "../../constants/accountFields";

const goalOptions = [
  { value: "weight_loss", label: "Похудение" },
  { value: "muscle_gain", label: "Набор мышечной массы" },
  { value: "maintenance", label: "Поддержание формы" },
  { value: "endurance", label: "Развитие выносливости" },
  { value: "rehabilitation", label: "Реабилитация" },
  { value: "other", label: "Другое" },
];

const experienceOptions = [
  { value: "no_experience", label: "Нет опыта" },
  { value: "home_training", label: "Тренируюсь дома" },
  { value: "gym_less_year", label: "В зале меньше года" },
  { value: "gym_more_year", label: "В зале от 1 года" },
  { value: "other", label: "Другое" },
];

export const FitnessFields = () => (
  <>
    <Form.Item name="goal">
      <Select placeholder={REGISTRATION_FIELDS.goal} options={goalOptions} />
    </Form.Item>

    <Form.Item name="experience">
      <Select
        placeholder={REGISTRATION_FIELDS.experience}
        options={experienceOptions}
      />
    </Form.Item>
  </>
);
