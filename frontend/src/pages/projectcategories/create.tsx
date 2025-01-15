import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Checkbox, DatePicker } from "antd";
import dayjs from "dayjs";

export const ProjectCategoriesCreate = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const { selectProps: projectCategorySelectProps } = useSelect({
    resource: "projectCategories",
    optionLabel: "name",
  });

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
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Checkbox>Is Visible</Checkbox>
        </Form.Item>
      </Form>
    </Create>
  );
};
