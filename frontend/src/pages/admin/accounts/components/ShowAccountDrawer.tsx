import React from "react";
import {
  useOne,
  useNavigation,
  useDelete,
  useGetIdentity,
} from "@refinedev/core";
import {
  TagField,
  EmailField,
  TextField,
  BooleanField,
  DateField,
} from "@refinedev/antd";
import {
  Typography,
  Card,
  Descriptions,
  Space,
  Tag,
  Skeleton,
  Divider,
  Badge,
  Alert,
  Drawer,
  Button,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ArrowsAltOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";
import { AccountDto } from "../../../../../generated";
import { ROLE_COLOR_MAP } from "../../../../utils/constants";
import { useLocalSettings } from "../../../../hooks/useLocalSettings";

const { Title } = Typography;

interface ShowAccountsShowDrawerProps {
  account?: AccountDto;
  open: boolean;
  onClose: () => void;
}

export const ShowAccountsShowDrawer: React.FC<ShowAccountsShowDrawerProps> = ({
  account,
  open,
  onClose,
}) => {
  const [localSettings] = useLocalSettings();
  const { edit } = useNavigation();
  const { mutate: deleteMutation } = useDelete();
  const { data: user } = useGetIdentity<AccountDto>();

  const getRoleTag = (role: string | undefined) => {
    const colorMap: Record<string, string> = ROLE_COLOR_MAP;
    if (!role) return null;
    return (
      <Tag color={colorMap[role]} className="text-sm">
        {role.charAt(0) + role.slice(1).toLowerCase()}
      </Tag>
    );
  };

  const handleEdit = () => {
    if (account?.accountId) {
      edit("accounts", account.accountId);
    }
  };

  const handleDelete = () => {
    if (account?.accountId) {
      deleteMutation(
        {
          resource: "accounts",
          id: account.accountId,
        },
        {
          onSuccess: () => onClose(),
        }
      );
    }
  };

  const footerContent =
    !account?.isVerified && user?.role === "ADMIN" ? (
      <Space>
        <Button onClick={handleEdit} disabled={!account}>
          Edit
        </Button>
        <Button onClick={handleDelete} disabled={!account} danger>
          Delete
        </Button>
      </Space>
    ) : null;

  return (
    <Drawer
      title="Account Details"
      open={open}
      onClose={onClose}
      width={800}
      footer={footerContent}
      destroyOnClose
    >
      <Space direction="vertical" size="large" className="w-full">
        <Link
          to={`/admin/accounts/show/${account?.accountId}`}
          style={{ textAlign: "right", display: "block", color: "#1890ff" }}
        >
          {" "}
          View account details in full screen <ArrowsAltOutlined />
        </Link>
        {account?.isVerified && (
          <Alert
            message="Verified Account"
            description="This account has been verified and cannot be modified."
            type="success"
            showIcon
          />
        )}
        <Card
          title={
            <Space>
              <UserOutlined className="text-blue-500" />
              <span className="font-semibold">Account Details</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <UserOutlined />
                  Full Name
                </Space>
              }
              span={2}
            >
              <span className="font-medium">
                {account?.firstName} {account?.lastName}
              </span>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <MailOutlined />
                  Email
                </Space>
              }
            >
              <EmailField value={account?.email} />
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <SafetyCertificateOutlined />
                  Role
                </Space>
              }
            >
              {getRoleTag(account?.role)}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <CheckCircleOutlined />
                  Verification Status
                </Space>
              }
              span={2}
            >
              <Space direction="vertical">
                <Badge
                  status={account?.isVerified ? "success" : "warning"}
                  text={account?.isVerified ? "Verified" : "Unverified"}
                />
                {account?.verifiedAt && (
                  <small className="text-gray-500">
                    Verified on{" "}
                    <DateField
                      value={account?.verifiedAt}
                      format={localSettings.dateFormat}
                    />
                  </small>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <EyeOutlined />
                  Visibility
                </Space>
              }
            >
              <BooleanField
                value={account?.isVisible}
                trueIcon={<CheckCircleOutlined className="text-green-500" />}
                falseIcon={<ClockCircleOutlined className="text-gray-500" />}
                valueLabelTrue="Visible"
                valueLabelFalse="Hidden"
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <ClockCircleOutlined className="text-blue-500" />
              <span className="font-semibold">System Information</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="Created At">
              <DateField
                value={account?.createdAt}
                format={localSettings.dateFormat}
              />
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated">
              <DateField
                value={account?.updatedAt}
                format={localSettings.dateFormat}
              />
            </Descriptions.Item>

            <Descriptions.Item label="Account ID" span={2}>
              <Tag className="font-mono">{account?.accountId}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </Drawer>
  );
};
