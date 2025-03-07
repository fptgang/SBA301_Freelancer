import { Avatar, Button, Col, Drawer, Row, Tabs, Tag, Typography } from "antd";
import React, { useState } from "react";
import {
  ProjectCategoryDto,
  ProjectDto,
  ProjectDtoStatusEnum,
} from "../../../../generated";
import { HttpError, useList, useOne } from "@refinedev/core";
import { renderSkillTags } from "./renderSkillTags";
import { Link, useNavigate } from "react-router";
import { ArrowsAltOutlined, WindowsFilled } from "@ant-design/icons";

const ProjectDrawer: React.FC<{
  project: ProjectDto;
  isDrawerVisible: any;
  onClose: any;
}> = ({ project, isDrawerVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState("completed jobs");
  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useOne<ProjectCategoryDto, HttpError>({
    resource: "projectCategories",
    id: project?.projectCategoryId,
  });
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const onApplyJobClick = () => {
    if (project.status === ProjectDtoStatusEnum.Open) {
      navigate(`/projects/${project.projectId}`);
    } else {
      // Could add a message here that the project is no longer open
      console.log("Project is not open for applications");
    }
  };

  return (
    <Drawer
      title={`Project Details: ${project.title}`}
      placement="right"
      onClose={onClose}
      visible={isDrawerVisible}
      width={500}
    >
      <Link to={`/projects/${project.projectId}`}>
        View {project.title} on full screen <ArrowsAltOutlined />
      </Link>
      <br />
      <br />
      <Typography.Title level={5}>Description</Typography.Title>
      <Typography.Text>{project.description}</Typography.Text>

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Required Skills
      </Typography.Title>
      {project.requiredSkills && renderSkillTags(project.requiredSkills)}

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Status
      </Typography.Title>
      <Tag color={project.status === "OPEN" ? "green" : "red"}>
        {project.status}
      </Tag>

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Client
      </Typography.Title>
      <Row gutter={16} align="middle" className="my-4">
        <Col>
          <Avatar src={project.client?.avatarUrl} size={64} />
        </Col>
        <Col>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {project.client?.firstName} {project.client?.lastName}{" "}
            <Tag color={project.client?.isVerified ? "green" : "red"}>
              {project.client?.isVerified ? "Verified" : "Not Verified"}
            </Tag>
          </Typography.Title>
          <Typography.Text type="secondary">
            member since{" "}
            {new Date(project.client?.createdAt!).toLocaleDateString()}{" "}
          </Typography.Text>{" "}
          <br />
          <Typography.Text>
            Contact: &nbsp;
            <a href={`mailto:${project.client?.email}`}>
              {project.client?.email}
            </a>{" "}
          </Typography.Text>
        </Col>
      </Row>

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Project Category
      </Typography.Title>
      <Typography.Text>
        {categoryLoading ? "Loading..." : categoryData?.data?.name}
      </Typography.Text>
      {/* <Typography.Text>{categoryData?.data?.name}</Typography.Text> */}

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Visibility
      </Typography.Title>
      <Typography.Text>
        {project.isVisible ? "Visible" : "Hidden"}
      </Typography.Text>

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Created At
      </Typography.Title>
      <Typography.Text>
        {new Date(project.createdAt!).toLocaleDateString()}
      </Typography.Text>

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Last Updated
      </Typography.Title>
      <Typography.Text>
        {new Date(project.updatedAt!).toLocaleDateString()}
      </Typography.Text>
      <br />
      <br />
      {role === "CLIENT" ? (
        <Button
          block
          type="primary"
          onClick={() =>
            navigate(`/client/projects/create`, { state: { project } })
          }
        >
          Post a Project Like This
        </Button>
      ) : role === "FREELANCER" ? (
        <Button block type="primary" onClick={onApplyJobClick}>
          Apply for this Project
        </Button>
      ) : (
        <Button
          block
          type="primary"
          onClick={() =>
            // navigate(`/login`, { state: { project } })
            navigate(`/login`)
          }
        >
          Log in to apply for this project
        </Button>
      )}
    </Drawer>
  );
};

export default ProjectDrawer;
