import React from "react";
import { Input, Button, Typography, Dropdown, Space } from "antd";
import { DownOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import Title from "antd/lib/typography/Title";
import { Authenticated, useLogout } from "@refinedev/core";
import { l } from "react-router/dist/development/fog-of-war-DLtn2OLr";

export default function NavBar() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const nav = useNavigate();
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleLogin = () => {
    console.log("Login clicked");
    nav("/login");
  };

  const handleSignup = () => {
    console.log("Signup clicked");
    nav("/register");
  };

  const handleLogoClick = () => {
    console.log("Logo clicked");
    nav("/");
  };

  return (
    <>
      <div className="flex justify-between items-center w-full p-4">
        <div className="flex items-center">
          <div
            className="flex flex-col items-center space-y-1 hover:cursor-pointer"
            onClick={handleLogoClick}
          >
            <img src="/public/icon.svg" alt="Logo" className="h-8 w-auto" />
            <Title level={5}>Hireable</Title>
          </div>
          <Dropdown
            menu={{
              items: [
                { label: "Home", key: "home" },
                { label: "About", key: "about" },
                { label: "Contact", key: "contact" },
              ],
            }}
            trigger={["click", "hover"]}
            className="mx-2"
          >
            <Button type="text" className="hover:bg-gray-100">
              <Space>
                Find Talent
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Dropdown
            menu={{
              items: [
                { label: "Services", key: "services" },
                { label: "Pricing", key: "pricing" },
                { label: "FAQ", key: "faq" },
              ],
            }}
            trigger={["hover", "click"]}
            className="mx-2"
          >
            <Button type="text" className="hover:bg-gray-100">
              <Space>
                Find Work
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64"
          />

          <Authenticated
            key={"authenticated-inner"}
            fallback={
              <>
                {" "}
                <Button
                  icon={<UserOutlined />}
                  onClick={handleLogin}
                  className="flex items-center"
                >
                  Login
                </Button>
                <Button
                  type="primary"
                  onClick={handleSignup}
                  //   className="bg-blue-600 hover:bg-blue-700"
                >
                  Sign up
                </Button>
              </>
            }
          >
            <ProfileDropdownButton />
          </Authenticated>
        </div>
      </div>
    </>
  );
}

const ProfileDropdownButton = () => {
  const nav = useNavigate();
  const { mutate: logout } = useLogout();

  const menuItems = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => nav("/profile"),
    },
    {
      key: "settings",
      label: "Settings",
      onClick: () => nav("/settings"),
    },
    {
      key: "logout",
      label: "Logout",
      onClick: () => logout(),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Button
        shape="circle"
        size="large"
        icon={<UserOutlined />}
        className="flex items-center justify-center bg-gray-100 hover:bg-gray-200"
      />
    </Dropdown>
  );
};
