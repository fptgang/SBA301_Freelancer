import React from "react";
import {ProfileDto} from "../../../../../generated";
import {Descriptions, Divider, Modal, Tag, Typography} from "antd";
import {ToolOutlined} from "@ant-design/icons";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import {useOne} from "@refinedev/core";

const {Text} = Typography;

interface ModalProfileProps {
  profileId: number;
  visible: boolean;
  onClose: () => void;
}

const ModalProfile: React.FC<ModalProfileProps> = ({
                                                     profileId,
                                                     visible,
                                                     onClose
                                                   }) => {
  const [localSettings] = useLocalSettings();

  console.log(profileId);

  const {data: contractData, isLoading: loading} = useOne<ProfileDto>({
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
            <Descriptions.Item label="Overview">
              {profile.overview || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Education">
              {profile.education || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {profile.phoneNumber || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Language">
              {profile.language || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {localSettings.formatDate(profile.createdAt!)}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Skills</Divider>

          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.skills.map((skill, index) => (
                <Tag
                  key={skill.profileSkillId || index}
                  color="blue"
                  className="flex items-center px-3 py-1 rounded-full"
                >
                  <ToolOutlined className="mr-1"/>
                  {skill.skill?.name} - {skill.proficiency}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary" className="italic">
              No skills mentioned
            </Text>
          )}
        </>
      ) : (
        <div>No profile data found</div>
      )}
    </Modal>
  );
};

export default ModalProfile;