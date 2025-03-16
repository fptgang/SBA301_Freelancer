import React, { useState } from "react";
import { Card, Col, Row, Tag, Typography, Drawer } from "antd";
import { ProjectDto } from "../../../../../generated";
import { renderSkillTags } from "../../../../utils/renderSkillTags";
import ProjectDrawer from "../drawers/projectDrawer";

const ProjectCard: React.FC<{ project: ProjectDto }> = ({ project }) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const onClose = () => {
    setIsDrawerVisible(false);
  };

  return (
    <>
      <Card className="mb-4" onClick={showDrawer} style={{ cursor: "pointer" }}>
        <Row>
          <Col span={24}>
            <Typography.Title level={4}>{project.title}</Typography.Title>
            <Typography.Text type="secondary" className="mb-2 block">
              Posted: {new Date(project.createdAt!).toLocaleDateString()}
            </Typography.Text>
            <Typography.Text className="mb-3 block">
              {project.description}
            </Typography.Text>
            {project.requiredSkills && renderSkillTags(project.requiredSkills)}
            <Tag
              className="mt-3"
              color={project.status === "OPEN" ? "green" : "red"}
            >
              {project.status}
            </Tag>
          </Col>
        </Row>
      </Card>
      {isDrawerVisible && (
        <ProjectDrawer
          project={project}
          isDrawerVisible={isDrawerVisible}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default ProjectCard;
