import React, { useState } from "react";
import {
  Input,
  Button,
  Typography,
  Dropdown,
  Space,
  Drawer,
  Layout,
  theme,
} from "antd";
import {
  DownOutlined,
  SearchOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { Authenticated } from "@refinedev/core";
import { ProfileDropdownButton } from "../../components/common/button/profile-dropdown-button";

const { Header } = Layout;
const { Title } = Typography;
const { useToken } = theme;

export default function NavBar() {
  const { token } = useToken();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const nav = useNavigate();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleLogin = () => {
    nav("/login");
    setMobileMenuOpen(false);
  };

  const handleSignup = () => {
    nav("/register");
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    nav("/");
    setMobileMenuOpen(false);
  };

  const menuItems = {
    findTalent: [
      { key: "home", label: "Home" },
      { key: "about", label: "About" },
      { key: "contact", label: "Contact" },
    ],
    findWork: [
      { key: "services", label: "Services" },
      { key: "pricing", label: "Pricing" },
      { key: "faq", label: "FAQ" },
    ],
  };

  return (
    <Header
      className={`
      sticky top-0 z-50 px-6 h-16 flex items-center
      border-b border-solid w-full
    `}
      style={{
        backgroundColor: token.colorBgElevated,
        borderColor: token.colorBorderSecondary,
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center">
          <div
            className="flex items-center cursor-pointer mr-12"
            onClick={handleLogoClick}
          >
            <img src="/public/icon.svg" alt="Logo" className="h-8 w-auto" />
            <Title
              level={5}
              className="!m-0 ml-2"
              style={{ color: token.colorTextHeading }}
            >
              Hireable
            </Title>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Dropdown
              menu={{ items: menuItems.findTalent }}
              trigger={["hover"]}
            >
              <Button type="text" className="flex items-center">
                <Space>
                  Find Talent
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>

            <Dropdown menu={{ items: menuItems.findWork }} trigger={["hover"]}>
              <Button type="text" className="flex items-center">
                <Space>
                  Find Work
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Desktop Search and Auth */}
        <div className="hidden md:flex items-center space-x-4">
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-48 lg:w-64"
            style={{ backgroundColor: token.colorBgContainer }}
          />

          <Authenticated
            key={"authenticated-inner"}
            fallback={
              <Space size="middle">
                <Button
                  icon={<UserOutlined />}
                  onClick={handleLogin}
                  className="flex items-center"
                >
                  Login
                </Button>
                <Button type="primary" onClick={handleSignup}>
                  Sign up
                </Button>
              </Space>
            }
          >
            <ProfileDropdownButton />
          </Authenticated>
        </div>

        {/* Mobile menu button */}
        <Button
          type="text"
          icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        styles={{
          body: {
            padding: 0,
            backgroundColor: token.colorBgContainer,
          },
        }}
      >
        <div className="p-4 flex flex-col space-y-4">
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ backgroundColor: token.colorBgContainer }}
          />

          <Dropdown menu={{ items: menuItems.findTalent }} trigger={["click"]}>
            <Button type="text" className="w-full text-left">
              <Space>
                Find Talent
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Dropdown menu={{ items: menuItems.findWork }} trigger={["click"]}>
            <Button type="text" className="w-full text-left">
              <Space>
                Find Work
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <div
            className="pt-4 border-t"
            style={{ borderColor: token.colorBorderSecondary }}
          >
            <Authenticated
              key={"authenticated-inner"}
              fallback={
                <div className="flex flex-col space-y-2">
                  <Button
                    icon={<UserOutlined />}
                    onClick={handleLogin}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleSignup}
                    className="w-full"
                  >
                    Sign up
                  </Button>
                </div>
              }
            >
              <ProfileDropdownButton />
            </Authenticated>
          </div>
        </div>
      </Drawer>
    </Header>
  );
}
