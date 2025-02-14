import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import {
  Avatar,
  Layout as AntdLayout,
  Menu,
  Input,
  Button,
  Dropdown,
  Space,
  theme,
} from "antd";
import { SearchOutlined, DownOutlined } from "@ant-design/icons";
import React from "react";
import { Link } from "react-router";

const { useToken } = theme;
const { Header } = AntdLayout;

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const ClientHeader: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    ...(sticky && {
      position: "sticky",
      top: 0,
      zIndex: 1,
    }),
  };

  const mainMenuItems = [
    {
      key: "find-talent",
      label: "Find Talent",
      children: [
        { key: "post-job", label: "Post a job and hire a pro" },
        { key: "browse", label: "Browse and buy projects" },
      ],
    },
    {
      key: "find-work",
      label: "Find Work",
      children: [
        { key: "search-jobs", label: "Search for jobs" },
        { key: "saved-jobs", label: "Saved jobs" },
      ],
    },
    {
      key: "why-upwork",
      label: "Why Upwork",
      children: [
        { key: "success-stories", label: "Success stories" },
        { key: "reviews", label: "Reviews" },
      ],
    },
    {
      key: "enterprise",
      label: "Enterprise",
    },
  ];

  return (
    <Header style={headerStyles}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img src="/logo.svg" alt="Logo" className="h-8" />
            </Link>

            <div className="hidden md:flex ml-10">
              <Menu
                mode="horizontal"
                items={mainMenuItems}
                className="border-none bg-transparent"
              />
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-xl mx-4 hidden lg:block">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search"
              className="rounded-full"
              size="large"
            />
          </div>

          {/* Right Section - Auth/User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <Space size="middle">
                <Dropdown
                  menu={{
                    items: [
                      { key: "profile", label: "Profile" },
                      { key: "settings", label: "Settings" },
                      { key: "logout", label: "Log out" },
                    ],
                  }}
                >
                  <Space className="cursor-pointer">
                    <Avatar src={user?.avatar} alt={user?.name} />
                    <span className="hidden md:inline">{user?.name}</span>
                    <DownOutlined className="text-xs" />
                  </Space>
                </Dropdown>
              </Space>
            ) : (
              <Space size="middle">
                <Button type="text" className="hidden md:inline-block">
                  Log in
                </Button>
                <Button
                  type="primary"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Sign up
                </Button>
              </Space>
            )}
          </div>
        </div>
      </div>
    </Header>
  );
};
