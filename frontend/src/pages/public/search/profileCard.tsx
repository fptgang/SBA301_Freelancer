import React, { useState } from "react";
import { Card, Col, Row, Typography, Drawer, Avatar, Tag, Tabs } from "antd";
import { ProfileDto } from "../../../../generated";
import ProfileDrawer from "./profileDrawer";
import { renderSkillTags } from "./renderSkillTags";

const ProfileCard: React.FC<{ profile: ProfileDto }> = ({ profile }) => {
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
        <Row gutter={16} align="middle">
          <Col>
            <Avatar src={profile.account?.avatarUrl} size={64} /> <br />
            <Typography.Text type="secondary" className="my-2 block">
              Member since{" "}
              {new Date(profile.account?.createdAt!).toLocaleDateString()}
            </Typography.Text>
          </Col>
          <Col>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {profile.account?.firstName} {profile.account?.lastName}
            </Typography.Title>
            <Typography.Text className="mb-3 block">
              {profile.overview}
            </Typography.Text>
            {profile.skills && renderSkillTags(profile.skills)}
            <div className="mt-3">
              <Typography.Text strong>Education: </Typography.Text>
              <Typography.Text>{profile.education}</Typography.Text>
            </div>
            <div className="mt-2">
              <Typography.Text strong>Languages: </Typography.Text>
              <Typography.Text>{profile.language}</Typography.Text>
            </div>
          </Col>
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
