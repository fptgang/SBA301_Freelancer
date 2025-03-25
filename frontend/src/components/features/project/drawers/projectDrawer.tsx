import {Avatar, Button, Col, Drawer, Row, Tag, Typography} from "antd";
import React from "react";
import {ProjectDto, ProjectStatusDto,} from "../../../../../generated";
import {renderSkillTags} from "../../../../utils/renderSkillTags";
import {Link, useNavigate} from "react-router";
import {ArrowsAltOutlined, CheckCircleOutlined, UserOutlined} from "@ant-design/icons";
import {store} from "../../../../store";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";

const ProjectDrawer: React.FC<{
  project: ProjectDto;
  isDrawerVisible: any;
  onClose: any;
}> = ({project, isDrawerVisible, onClose}) => {
  const [localSettings] = useLocalSettings();
  const navigate = useNavigate();

  const role = store.getState().auth.account?.role;

  const onApplyJobClick = () => {
    if (project.status === ProjectStatusDto.Open) {
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
        View {project.title} on full screen <ArrowsAltOutlined/>
      </Link>
      <br/>
      <br/>
      <Typography.Title level={5}>Description</Typography.Title>
      <Typography.Text>{project.description}</Typography.Text>

      <Typography.Title level={5} style={{marginTop: 16}}>
        Required Skills
      </Typography.Title>
      {project.requiredSkills && renderSkillTags(project.requiredSkills)}

      <Typography.Title level={5} style={{marginTop: 16}}>
        Status
      </Typography.Title>
      <Tag color={project.status === "OPEN" ? "green" : "red"}>
        {project.status}
      </Tag>

      <Typography.Title level={5} style={{marginTop: 16}}>
        Client
      </Typography.Title>
      <Row align="middle">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                  icon={<UserOutlined/>} 
                  src={project.client?.avatarUrl} 
                  className="bg-blue-500"
                  size={24} />
              <div style={{ marginLeft: '16px' }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {project.client?.firstName} {project.client?.lastName}
                  {project.client?.isVerified &&
                    <CheckCircleOutlined className="ml-1 text-blue-500"/>}
                </Typography.Title>
              </div>
            </div>
            </Row>
          <Row>
  <Typography.Text>
    Contact: &nbsp;
    <a href={`mailto:${project.client?.email}`}>
      {project.client?.email}
    </a>{" "}
  </Typography.Text>
          </Row>

      <Typography.Title level={5} style={{marginTop: 16}}>
        Project Category
      </Typography.Title>
      <Typography.Text>
        {project.projectCategory?.name || "Unknown"}
      </Typography.Text>
      {/* <Typography.Text>{categoryData?.data?.name}</Typography.Text> */}

      <Typography.Title level={5} style={{marginTop: 16}}>
        Created At
      </Typography.Title>
      <Typography.Text>
        {localSettings.formatDate(project.createdAt!)}
      </Typography.Text>

      <br/>
      <br/>
      {role === "CLIENT" ? (
        // <Button
        //   block
        //   type="primary"
        //   onClick={() =>
        //     navigate(`/client/projects/create`, {state: {project}})
        //   }
        // >
        //   Post a Project Like This
        // </Button>
        <></>
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
