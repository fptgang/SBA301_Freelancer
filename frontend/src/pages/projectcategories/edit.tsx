import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox, Card, Space } from "antd";
import { FolderOutlined, EyeOutlined } from "@ant-design/icons";
import { ProjectCategoryDto } from "../../../generated";

export const ProjectCategoriesEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } =
    useForm<ProjectCategoryDto>({
      redirect: "show",
    });

  const projectCategoriesData = queryResult?.data?.data;
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          ...formProps.initialValues,
          isVisible: formProps.initialValues?.isVisible ?? true,
        }}
      >
        <Card
          title={
            <Space>
              <FolderOutlined className="text-blue-500" />
              <span className="font-semibold">Edit Category</span>
            </Space>
          }
          className="shadow-md"
        >
          {/* Hidden Project Category ID */}
          <Form.Item name="projectCategoryId" hidden>
            <Input type="hidden" />
          </Form.Item>

          {/* Category Name */}
          <Form.Item
            label="Category Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter a category name",
              },
              {
                min: 3,
                message: "Category name must be at least 3 characters",
              },
              {
                max: 50,
                message: "Category name cannot exceed 50 characters",
              },
            ]}
          >
            <Input placeholder="Enter category name" className="max-w-md" />
          </Form.Item>

          {/* Visibility Toggle - Admin Only */}
          {isAdmin && (
            <Form.Item
              label={
                <Space>
                  <EyeOutlined />
                  <span>Visibility</span>
                </Space>
              }
              name="isVisible"
              valuePropName="checked"
              tooltip="Control whether this category is visible to users"
            >
              <Checkbox>Make this category visible to users</Checkbox>
            </Form.Item>
          )}
        </Card>
      </Form>
    </Edit>
  );
};
