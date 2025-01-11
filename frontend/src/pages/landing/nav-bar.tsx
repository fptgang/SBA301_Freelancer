import React from "react";
import { Input, Button, Typography, Dropdown, Space } from "antd";
import { DownOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import Title from "antd/lib/typography/Title";

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
    <nav className="h-[10vh] flex items-center justify-between p-4 bg-white shadow-md">
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
      </div>
    </nav>
  );
}
