import React from "react";
import { useShow, useOne } from "@refinedev/core";
import {
  Show,
  TagField,
  TextField,
  BooleanField,
  DateField,
} from "@refinedev/antd";
import {
  Typography,
  Card,
  Descriptions,
  Space,
  Tag,
  Skeleton,
  Alert,
  Badge,
} from "antd";
import {
  ProjectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  TagsOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  AccountDto,
  ProficiencyEnum,
  ProjectDto,
  ProjectSkillDto,
} from "../../../../generated";
import {useLocalSettings} from "../../../hooks/useLocalSettings";

const { Title } = Typography;

export const ProjectsShow: React.FC = () => {
  const [localSettings] = useLocalSettings()
  const { queryResult } = useShow<ProjectDto>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const { data: categoryData, isLoading: categoryIsLoading } = useOne({
    resource: "project-categories",
    id: record?.projectCategory?.projectCategoryId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  const { data: clientData, isLoading: clientIsLoading } = useOne<AccountDto>({
    resource: "accounts",
    id: record?.client?.accountId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  const getStatusBadge = (status: ProjectDto["status"] | undefined) => {
    const statusColorMap: Record<string, string> = {
      IN_PROGRESS: "processing",
      FINISHED: "success",
      CANCELLED: "error",
      PENDING: "warning",
    };

    if (!status) return null;
    const formattedStatus = status.replace("_", " ").toLowerCase();
    return (
      <Badge
        status={
          statusColorMap[status] as
            | "processing"
            | "success"
            | "error"
            | "warning"
        }
        text={formattedStatus}
      />
    );
  };

  const getProficiencyColor = (proficiency: ProficiencyEnum) => {
    const colorMap: Record<string, string> = {
      BEGINNER: "green",
      INTERMEDIATE: "blue",
      EXPERT: "purple",
    };
    return colorMap[proficiency];
  };

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <Show isLoading={isLoading}>
      <Space direction="vertical" size="large" className="w-full">
        {record?.contract && (
          <Alert
            message="Contract"
            description="This project has an active proposal and some details cannot be modified."
            type="info"
            showIcon
          />
        )}

        <Card
          title={
            <Space>
              <ProjectOutlined className="text-blue-500" />
              <span className="font-semibold">Project Details</span>
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
                  <FileTextOutlined />
                  Title
                </Space>
              }
              span={2}
            >
              <span className="font-medium">{record?.title}</span>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <UserOutlined />
                  Client
                </Space>
              }
            >
              {clientIsLoading ? (
                <Skeleton.Input active size="small" />
              ) : (
                <span>{clientData?.data?.email}</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <TagsOutlined />
                  Category
                </Space>
              }
            >
              {categoryIsLoading ? (
                <Skeleton.Input active size="small" />
              ) : (
                <Tag color="blue">{categoryData?.data?.name}</Tag>
              )}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <FileTextOutlined />
                  Description
                </Space>
              }
              span={2}
            >
              <TextField value={record?.description} />
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <TagsOutlined />
                  Required Skills
                </Space>
              }
              span={2}
            >
              <Space wrap>
                {record?.requiredSkills?.map((projectSkill) => (
                  <Tag
                    key={projectSkill.projectSkillId}
                    color={getProficiencyColor(
                      projectSkill.proficiency?.toUpperCase() as ProficiencyEnum
                    )}
                  >
                    {projectSkill.skill?.name}{" "}
                    <small>({projectSkill.proficiency?.toLowerCase()})</small>
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <CheckCircleOutlined />
                  Status
                </Space>
              }
            >
              {getStatusBadge(record?.status)}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <EyeOutlined />
                  Visibility
                </Space>
              }
            >
              <BooleanField
                value={record?.isVisible}
                trueIcon={<CheckCircleOutlined className="text-green-500" />}
                falseIcon={<ClockCircleOutlined className="text-gray-500" />}
                valueLabelTrue="Visible"
                valueLabelFalse="Hidden"
              />
            </Descriptions.Item>
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
                format={localSettings.dateFormat}
              />
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated">
              <DateField
                value={record?.updatedAt}
                format={localSettings.dateFormat}
              />
            </Descriptions.Item>

            <Descriptions.Item label="Project ID" span={2}>
              <Tag className="font-mono">{record?.projectId}</Tag>
            </Descriptions.Item>

            {record?.contract && (
              <Descriptions.Item label="Contract ID" span={2}>
                <Tag className="font-mono">{record?.contract?.contractId}</Tag>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </Space>
    </Show>
  );
};
