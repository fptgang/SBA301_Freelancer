import React, { useState } from "react";
import { Card, Col, Row, Typography, Drawer, Avatar, Tag, Tabs } from "antd";
import { ProfileDto } from "../../../../../generated";
import ProfileDrawer from "../drawer/profileDrawer";
import { renderSkillTags } from "../../../../utils/renderSkillTags";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import { CheckCircleOutlined, UserOutlined } from "@ant-design/icons";

const ProfileCard: React.FC<{ profile: ProfileDto }> = ({ profile }) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [localSettings] = useLocalSettings();

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const onClose = () => {
    setIsDrawerVisible(false);
  };

  return (
    <>
      <Card className="mb-4" onClick={showDrawer} style={{ cursor: "pointer" }}>
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
          <Row>
            <Typography.Text className="mb-3 block">
              {profile.overview}
            </Typography.Text>
          </Row>
          <Row>
            {profile.skills && renderSkillTags(profile.skills)}
          </Row>
          <Row>
            <div className="mt-3">
              <Typography.Text strong>Education: </Typography.Text>
              <Typography.Text>{profile.education}</Typography.Text>
            </div>
          </Row>
          <Row>
            <div className="mt-2">
              <Typography.Text strong>Languages: </Typography.Text>
              <Typography.Text>{profile.language}</Typography.Text>
            </div>
        </Row>
      </Card>
      {isDrawerVisible && (
        <ProfileDrawer
          profile={profile}
          isDrawerVisible={isDrawerVisible}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default ProfileCard;
