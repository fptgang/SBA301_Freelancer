import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Checkbox, DatePicker } from "antd";
import dayjs from "dayjs";

export const SkillsCreate = () => {
  const { formProps, saveButtonProps, query } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Name"
          name={["name"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Is Visible"
          valuePropName="checked"
          name={["isVisible"]}
          initialValue={false}
        >
          <Checkbox>Is Visible</Checkbox>
        </Form.Item>
      </Form>
    </Create>
  );
};
