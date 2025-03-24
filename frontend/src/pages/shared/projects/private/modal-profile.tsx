import React from "react";
import {FileDto, ProfileDto} from "../../../../../generated";
import {Avatar, Button, Divider, List, Tag, Typography, Modal, Descriptions} from "antd";
import {FileTextOutlined, ToolOutlined} from "@ant-design/icons";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import { useOne } from "@refinedev/core";

const { Text } = Typography;

interface ModalProfileProps {
  profileId: number;
  visible: boolean;
  onClose: () => void;
}

const ModalProfile: React.FC<ModalProfileProps> = ({ profileId, visible, onClose }) => {
    const [localSettings] = useLocalSettings();

    console.log(profileId);

    const { data: contractData, isLoading: loading } = useOne<ProfileDto>({
      resource: "profiles",
      id: profileId,
      queryOptions: {
        enabled: !!profileId,
      },
    });

    const profile = contractData?.data;
  
    return (
      <Modal
        title="Profile Details"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        {loading ? (
          <div>Loading...</div>
        ) : profile ? (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Account">
                {profile.account?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Overview">
                {profile.overview || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Education">
                {profile.education || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {profile.phoneNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Language">
                {profile.language || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Visibility">
                {profile.isVisible ? 'Visible' : 'Hidden'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Skills</Divider>
            <List
              dataSource={profile.skills}
              renderItem={(skillItem) => (
                <List.Item>
                  <List.Item.Meta
                    title={skillItem.skill?.name}
                    description={`Proficiency: ${skillItem.proficiency}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No skills found' }}
            />

            <Divider />
            <Text type="secondary">
              Created: {localSettings.formatDate(profile.createdAt!)}
            </Text>
          </>
        ) : (
          <div>No profile data found</div>
        )}
      </Modal>
    );
};

export default ModalProfile;