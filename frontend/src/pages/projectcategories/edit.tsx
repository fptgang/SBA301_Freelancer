import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Checkbox, DatePicker } from "antd";
import dayjs from "dayjs";

export const ProjectCategoriesEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const projectCategoriesData = query?.data?.data;

  const { selectProps: projectCategorySelectProps } = useSelect({
    resource: "projectCategories",
    defaultValue: projectCategoriesData?.projectCategoryId,
    optionLabel: "name",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Project Category"
          name={"projectCategoryId"}
          rules={[
            {
              required: true,
            },
          ]}
          hidden
        >
          {/* <Select {...projectCategorySelectProps} /> */}
        </Form.Item>
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
        {localStorage.getItem("role") == "ADMIN" ? (
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
        ) : (
          ""
        )}
      </Form>
    </Edit>
  );
};
