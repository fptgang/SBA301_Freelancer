import React, {useEffect, useState} from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Space,
  Button,
  Spin,
} from "antd";
import {HttpError, useGetIdentity, useOne} from "@refinedev/core";
import { ProjectHeader } from "../../../components/features/project/details/ProjectHeader";
import { ProjectDescription } from "../../../components/features/project/details/ProjectDescription";
import {CheckCircleOutlined} from "@ant-design/icons";
import {AccountDto, ProjectDto} from "../../../../generated";

const { Title } = Typography;

const ProjectPublicDetail:  React.FC<{ project: ProjectDto }> = ({ project }) => {
  const { data: user } = useGetIdentity<AccountDto>();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <Row gutter={[32, 32]}>
        {/* Left Column */}
        <Col xs={24} md={16}>
          {project && <ProjectHeader project={project} />}
          {project && <ProjectDescription project={project} />}
          {project && (
            <>
              <Typography.Title level={5} style={{ marginBottom: 16 }}>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Project Activity
              </Typography.Title>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Proposals Received">
                  {project.proposalCount}
                </Descriptions.Item>
                <Descriptions.Item label="Category">{project.projectCategory?.name}</Descriptions.Item>
              </Descriptions>
              <br />
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProjectPublicDetail;
