import {Avatar, Button, Col, Drawer, Row, Tabs, Tag, Typography} from "antd";
import React, {useState} from "react";
import {
  ProfileDto,
  ProjectDto,
  ProjectStatusDto,
} from "../../../../../generated";
import {HttpError, useList} from "@refinedev/core";
import {renderSkillTags} from "../../../../utils/renderSkillTags";
import {useNavigate} from "react-router";
import {store} from "../../../../store";
import { CheckCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useLocalSettings } from "../../../../hooks/useLocalSettings";

const ProfileDrawer: React.FC<{
  profile: ProfileDto;
  isDrawerVisible: any;
  onClose: any;
}> = ({profile, isDrawerVisible, onClose}) => {
  const [localSettings] = useLocalSettings();
  const [activeTab, setActiveTab] = useState("completed jobs");
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = profile &&
  useList<ProjectDto, HttpError>({
    resource: "projects",
    pagination: {pageSize: 100},
    filters: [
      {
        field: "activeProposal.freelancer.accountId",
        operator: "eq",
        value: profile.account?.accountId,
      },
      {
        field: "status",
        operator: "in",
        value: [ProjectStatusDto.Finished, ProjectStatusDto.InProgress],
      },
    ],
  });

  const navigate = useNavigate();

  const role = store.getState().auth.account?.role;
  return (
    <Drawer
      title={`Profile Details: ${profile.account?.firstName} ${profile.account?.lastName}`}
      placement="right"
      onClose={onClose}
      visible={isDrawerVisible}
      width={500}
    >
<Row gutter={16} align="middle">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                  icon={<UserOutlined/>} 
                  src={profile.account?.avatarUrl} 
                  className="bg-blue-500"
                  size={64} />
              <div style={{ marginLeft: '16px' }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {profile.account?.firstName} {profile.account?.lastName}
                  {profile.account?.isVerified &&
                    <CheckCircleOutlined className="ml-1 text-blue-500"/>}
                </Typography.Title>
              </div>
            </div>
            </Row>
          <Row>
            <Typography.Text type="secondary" className="my-2 block">
              Member since{" "}
              {profile.createdAt && localSettings.formatDate(profile.createdAt)}
            </Typography.Text>
          </Row>

      <Typography.Title level={5}>Overview</Typography.Title>
      <Typography.Text>{profile.overview}</Typography.Text>

      <Typography.Title level={5} style={{marginTop: 16}}>
        Skills
      </Typography.Title>
      {profile.skills && renderSkillTags(profile.skills)}

      <Typography.Title level={5} style={{marginTop: 16}}>
        Education
      </Typography.Title>
      <Typography.Text>{profile.education}</Typography.Text>

      <Typography.Title level={5} style={{marginTop: 16}}>
        Languages
      </Typography.Title>
      <Typography.Text>{profile.language}</Typography.Text>

      <Typography.Title level={5} style={{marginTop: 16}}>
        Contact Information
      </Typography.Title>
      <Typography.Text>
        Phone: {profile.phoneNumber} <br/>
        Email: &nbsp;
        <a href={`mailto:${profile.account?.email}`}>
          {profile.account?.email}
        </a>
      </Typography.Text>
      <Typography.Title level={5} style={{marginTop: 16}}>
        Work History
      </Typography.Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
        <Tabs.TabPane
          tab={
            "Completed Jobs ( " +
            (projectsData?.data?.filter((p) => {
              return p.status === ProjectStatusDto.Finished;
            }).length || 0) +
            " )"
          }
          key="completed jobs"
        >
          <Row gutter={16}>
            {isProjectsLoading
              ? "Loading..."
              : projectsData?.data
                ?.filter((p) => {
                  return p.status === ProjectStatusDto.Finished;
                })
                .map((p) => {
                  return (
                    <Col span={12} key={p.projectId}>
                      <Typography.Text>{p.title}</Typography.Text>
                    </Col>
                  );
                })}
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            "In Progress ( " +
            (projectsData?.data?.filter((p) => {
              return p.status === ProjectStatusDto.InProgress;
            })?.length || 0) +
            " )"
          }
          key="in progress jobs"
        >
          <Row gutter={16}>
            {isProjectsLoading
              ? "Loading..."
              : projectsData?.data
                ?.filter((p) => {
                  return p.status === ProjectStatusDto.InProgress;
                })
                .map((p) => {
                  return (
                    <Col span={12} key={p.projectId}>
                      <Typography.Text>{p.title}</Typography.Text>
                    </Col>
                  );
                })}
          </Row>
        </Tabs.TabPane>
      </Tabs>
      <br/>
      {role === "CLIENT" ? (
        // <Button
        //   type="primary"
        //   block
        //   onClick={(e) => {
        //     navigate(`/client/projects`, {state: {profile}});
        //   }}
        // >
        //   Hire {profile.account?.firstName}
        // </Button>
        <></>
      ) : role === "FREELANCER" ? null : (
        <Button
          type="primary"
          block
          onClick={(e) => {
            navigate(`/login`, {state: {profile}});
          }}
        >
          Log in to hire {profile.account?.firstName}
        </Button>
      )}
    </Drawer>
  );
};

export default ProfileDrawer;
