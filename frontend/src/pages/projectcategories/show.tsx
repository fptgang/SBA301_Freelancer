import React from "react";
import { useShow, useOne } from "@refinedev/core";
import {
  Show,
  TagField,
  TextField,
  BooleanField,
  DateField,
} from "@refinedev/antd";
import { Typography, Card, Descriptions, Space, Tag, Skeleton } from "antd";
import {
  FolderOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

interface ProjectCategoryDto {
  projectCategoryId: number;
  name: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ProjectCategoriesShow: React.FC = () => {
  const { queryResult } = useShow<ProjectCategoryDto>();
  const { data, isLoading } = queryResult;
  const record = data?.data;
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <Show isLoading={isLoading}>
      <Space direction="vertical" size="large" className="w-full">
        <Card
          title={
            <Space>
              <FolderOutlined className="text-blue-500" />
              <span className="font-semibold">Category Details</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <FolderOutlined />
                  Name
                </Space>
              }
              span={2}
            >
              <span className="font-medium">{record?.name}</span>
            </Descriptions.Item>

            {isAdmin && (
              <Descriptions.Item
                label={
                  <Space>
                    <EyeOutlined />
                    Visibility
                  </Space>
                }
                span={2}
              >
                <BooleanField
                  value={record?.isVisible}
                  trueIcon={<CheckCircleOutlined className="text-green-500" />}
                  falseIcon={<ClockCircleOutlined className="text-gray-500" />}
                  valueLabelTrue="Visible"
                  valueLabelFalse="Hidden"
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <ClockCircleOutlined className="text-blue-500" />
              <span className="font-semibold">System Information</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="Created At">
              <DateField
                value={record?.createdAt}
                format="MMMM D, YYYY HH:mm:ss"
              />
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated">
              <DateField
                value={record?.updatedAt}
                format="MMMM D, YYYY HH:mm:ss"
              />
            </Descriptions.Item>

            <Descriptions.Item label="Category ID" span={2}>
              <Tag className="font-mono">{record?.projectCategoryId}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </Show>
  );
};
