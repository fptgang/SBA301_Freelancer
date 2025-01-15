import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Checkbox, DatePicker } from "antd";
import dayjs from "dayjs";

export const AccountsEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const accountsData = query?.data?.data;

  const { selectProps: accountSelectProps } = useSelect({
    resource: "accounts",
    defaultValue: accountsData?.accountId,
    optionLabel: "firstName",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Account"
          name={"accountId"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...accountSelectProps} />
        </Form.Item>
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
          label="Role"
          name={["role"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select placeholder="Select a role">
            <Select.Option value="ADMIN">Admin</Select.Option>
            <Select.Option value="CLIENT">Client</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Edit>
  );
};
