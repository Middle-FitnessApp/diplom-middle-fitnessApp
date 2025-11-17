import { Form, Input } from "antd";
import { REGISTRATION_FIELDS } from "../../constants/accountFields";

const { TextArea } = Input;

export const MedicalFields = () => (
  <>
    <Form.Item name="medicalInfo">
      <TextArea placeholder={REGISTRATION_FIELDS.medicalInfo} rows={4} />
    </Form.Item>

    <Form.Item name="diet">
      <TextArea placeholder={REGISTRATION_FIELDS.diet} rows={4} />
    </Form.Item>
  </>
);
