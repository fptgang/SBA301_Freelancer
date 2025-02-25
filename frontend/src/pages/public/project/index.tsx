import React from "react";
import { useShow, useOne, useGetIdentity } from "@refinedev/core";
import { HttpError } from "@refinedev/core";
import { Col, Row, Spin, Typography } from "antd";
import { useNavigate, useParams } from "react-router";
import { ProjectDto, ProjectCategoryDto, AccountDto } from "../../../../generated";

import { ProjectDescription } from "../../../components/project-details/ProjectDescription";
import { ProjectActivity } from "../../../components/project-details/ProjectActivity";
import { ProjectMilestones } from "../../../components/project-details/ProjectMilestones";
import { ClientInformation } from "../../../components/project-details/ClientInformation";
import { ActionCard } from "../../../components/project-details/ActionCard";
import { ProjectHeader } from "../../../components/project-details/ProjectHeader";

const ProjectDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: identity } = useGetIdentity<any>();
  const { query } = useShow<ProjectDto, HttpError>({
    resource: "projects",
    id,
  });

  const {
    data: projectData,
    isLoading: projectLoading,
    isError: projectError,
  } = query;

  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useOne<ProjectCategoryDto, HttpError>({
    resource: "projectCategories",
    id: projectData?.data?.projectCategoryId,
  });

  const role = localStorage.getItem("role");
  const project = projectData?.data;

  if (projectLoading || categoryLoading) {
    return (
      <Spin size="large" style={{ margin: "100px auto", display: "block" }} />
    );
  }

  if (projectError || categoryError) {
    return (
      <Typography.Text
        strong
        style={{
          color: "red",
          display: "block",
          textAlign: "center",
          marginTop: 100,
        }}
      >
        Error loading project details
      </Typography.Text>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <Row gutter={[32, 32]}>
        {/* Left Column */}
        <Col xs={24} md={16}>
          {project && <ProjectHeader project={project} />}
          {project && <ProjectDescription project={project} />}
          {project && (
            <>
              <ProjectActivity
                project={project}
                category={categoryData?.data}
              />
              <br />
            </>
          )}
          {project && <ProjectMilestones milestones={project.milestones} />}
        </Col>

        {/* Right Column */}
        <Col xs={24} md={8}>
          {project && <ClientInformation project={project} />}
          {project && <ActionCard project={project} role={role} freelancerId={identity?.id} />}
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDetailsScreen;
