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
import { AccountDto } from "../../../generated";

const { Title } = Typography;

interface Skill {
  skillId: number;
  name: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectSkill {
  projectSkillId: number;
  skill: Skill;
  proficiency: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
}

interface ProjectDto {
  projectId: number;
  projectCategoryId: number;
  clientId: number;
  title: string;
  description: string;
  requiredSkills: ProjectSkill[];
  status: "PENDING" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
  activeProposalId: number | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ProjectsShow: React.FC = () => {
  const { queryResult } = useShow<ProjectDto>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const { data: categoryData, isLoading: categoryIsLoading } = useOne({
    resource: "projectCategories",
    id: record?.projectCategoryId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  const { data: clientData, isLoading: clientIsLoading } = useOne<AccountDto>({
    resource: "accounts",
    id: record?.clientId || "",
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

  const getProficiencyColor = (proficiency: ProjectSkill["proficiency"]) => {
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
        {record?.activeProposalId && (
          <Alert
            message="Active Proposal"
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
                {record?.requiredSkills.map((projectSkill) => (
                  <Tag
                    key={projectSkill.projectSkillId}
                    color={getProficiencyColor(projectSkill.proficiency)}
                  >
                    {projectSkill.skill.name}{" "}
                    <small>({projectSkill.proficiency.toLowerCase()})</small>
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
                format="MMMM D, YYYY HH:mm:ss"
              />
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated">
              <DateField
                value={record?.updatedAt}
                format="MMMM D, YYYY HH:mm:ss"
              />
            </Descriptions.Item>

            <Descriptions.Item label="Project ID" span={2}>
              <Tag className="font-mono">{record?.projectId}</Tag>
            </Descriptions.Item>

            {record?.activeProposalId && (
              <Descriptions.Item label="Active Proposal ID" span={2}>
                <Tag className="font-mono">{record?.activeProposalId}</Tag>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </Space>
    </Show>
  );
};
