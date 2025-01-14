import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, Radio, Checkbox } from "antd";
import dayjs from "dayjs";

export const UsersCreate = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const { selectProps: accountSelectProps } = useSelect({
    resource: "accounts",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Email"
          name={["email"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="First Name"
          name={["firstName"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name={["lastName"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Balance"
          name={["balance"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Role"
          name={["role"]}
          rules={[
            {
              required: true,
              enum: ["ADMIN", "CLIENT"],
            },
          ]}
        >
          <Select placeholder="Select a role">
            <Select.Option value="ADMIN">Admin</Select.Option>
            <Select.Option value="CLIENT">User</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Is Verified"
          name={["isVisible"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Radio.Group defaultValue={true}>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Create>
  );
};
