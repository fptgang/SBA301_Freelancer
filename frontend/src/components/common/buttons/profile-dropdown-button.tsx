import {
  UserOutlined,
  WalletOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { Button, Dropdown, Avatar, Space, Typography, Divider } from "antd";
import { useNavigate } from "react-router";
import { AccountDto, AccountDtoRoleEnum } from "../../../../generated";

const { Text } = Typography;

export const ProfileDropdownButton = () => {
  const nav = useNavigate();
  const { mutate: logout } = useLogout();
  const { data: user } = useGetIdentity<AccountDto>();

  // Mock wallet amount - in a real app, get this from user data
  const walletAmount = user?.balance || 0;

  const menuItems = {
    items: [
      {
        key: "profile-info",
        label: (
          <div className="p-2">
            <div className="flex items-center mb-2">
              <Avatar
                size={48}
                icon={<UserOutlined />}
                className="mr-3 bg-blue-500"
              />
              <div>
                <Text strong className="block">
                  {user?.firstName || ""} {user?.lastName || ""}
                </Text>
                <Text type="secondary" className="block">
                  {user?.email}
                </Text>
              </div>
            </div>
            {(user?.role === AccountDtoRoleEnum.Client ||
              user?.role === AccountDtoRoleEnum.Freelancer) && (
              <div className="flex items-center bg-gray-50 p-2 rounded mt-2">
                <WalletOutlined className="text-green-500 mr-2" />
                <div>
                  <Text type="secondary" className="block text-xs">
                    Wallet Balance
                  </Text>
                  <Text strong className="text-green-500">
                    ${walletAmount?.toFixed(2)}
                  </Text>
                </div>
              </div>
            )}
            <Divider className="my-2" />
          </div>
        ),
        disabled: true,
        style: { cursor: "default" },
      },
      // Add Dashboard item conditionally for admin users
      ...(user?.role === AccountDtoRoleEnum.Admin
        ? [
            {
              key: "dashboard",
              label: (
                <Space>
                  <DashboardOutlined />
                  <span>Dashboard</span>
                </Space>
              ),
              onClick: () => nav("/dashboard"),
            },
          ]
        : []),
      ...(user?.role === AccountDtoRoleEnum.Freelancer
        ? [
            {
              key: "profile",
              label: (
                <Space>
                  <UserOutlined />
                  <span>My Profile</span>
                </Space>
              ),
              onClick: () => {
                if (user?.role === AccountDtoRoleEnum.Client) nav("/client");
                if (user?.role === AccountDtoRoleEnum.Freelancer)
                  nav("/freelancer/profile");
              },
            },
          ]
        : []),
      {
        key: "settings",
        label: (
          <Space>
            <SettingOutlined />
            <span>Settings</span>
          </Space>
        ),
        onClick: () => {
          nav("/settings");
        },
      },
      {
        key: "wallet",
        label: (
          <Space>
            <WalletOutlined />
            <span>My Wallet</span>
          </Space>
        ),
        onClick: () => {
          nav("/wallet");
        },
      },
      {
        key: "logout",
        label: (
          <Space>
            <LogoutOutlined />
            <span>Logout</span>
          </Space>
        ),
        onClick: () => logout(),
      },
    ],
  };

  return (
    <Dropdown menu={menuItems} placement="bottomRight" trigger={["click"]}>
      <Button
        type="text"
        className="flex items-center justify-center hover:bg-gray-100 px-3 h-10 rounded-full"
      >
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            className="bg-blue-500"
          />
          <span className="hidden sm:inline">
            {user?.firstName || "Account"}
          </span>
        </Space>
      </Button>
    </Dropdown>
  );
};
