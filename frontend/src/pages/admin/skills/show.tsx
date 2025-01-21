import React from "react";
import { useShow, useOne } from "@refinedev/core";
import { Show, BooleanField, DateField } from "@refinedev/antd";
import { Typography, Card, Descriptions, Space, Skeleton, Tag } from "antd";
import {
  ToolOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export const SkillsShow: React.FC = () => {
  const { queryResult: showQuery } = useShow();
  const { data, isLoading } = showQuery;
  const record = data?.data;

  const { data: skillData, isLoading: skillIsLoading } = useOne({
    resource: "skills",
    id: record?.skillId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <Show isLoading={isLoading}>
      <Space direction="vertical" size="large" className="w-full">
        <Card
          title={
            <Space>
              <ToolOutlined style={{ color: "#1677ff" }} />
              <span className="font-semibold">Skill Details</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="Skill Name" span={2}>
              {skillIsLoading ? (
                <Skeleton.Input active size="small" />
              ) : (
                <Tag color="blue">{skillData?.data?.name}</Tag>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Display Name" span={2}>
              {record?.name}
            </Descriptions.Item>

            <Descriptions.Item label="Visible Status">
              <BooleanField
                value={record?.isVisible}
                trueIcon={<CheckCircleOutlined style={{ color: "green" }} />}
                falseIcon={<ClockCircleOutlined style={{ color: "gray" }} />}
                valueLabelTrue="Visible"
                valueLabelFalse="Hidden"
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <ClockCircleOutlined style={{ color: "#1677ff" }} />
              <span className="font-semibold">System Information</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions bordered>
            <Descriptions.Item label="Created At">
              <DateField
                value={record?.createdAt}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              <DateField
                value={record?.updatedAt}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </Show>
  );
};
