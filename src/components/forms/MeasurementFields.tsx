import { Form, InputNumber } from "antd";
import { REGISTRATION_FIELDS } from "../../constants/accountFields";

const measurements = [
  { name: "height", min: 100, max: 250 },
  { name: "chest", min: 50, max: 200 },
  { name: "waist", min: 40, max: 200 },
  { name: "hips", min: 50, max: 200 },
  { name: "arm", min: 10, max: 100 },
  { name: "leg", min: 20, max: 150 },
] as const;

export const MeasurementFields = () => (
  <>
    {measurements.map(({ name, min, max }) => (
      <Form.Item key={name} name={name}>
        <InputNumber
          placeholder={REGISTRATION_FIELDS[name]}
          style={{ width: "100%" }}
          min={min}
          max={max}
        />
      </Form.Item>
    ))}
  </>
);
