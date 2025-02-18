import React, { useState } from "react";
import { Input, Button, Typography, Space, Drawer, Layout, theme } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { Authenticated, useGetIdentity } from "@refinedev/core";
import { ProfileDropdownButton } from "../common/button/profile-dropdown-button";
import { AccountDto, AccountDtoRoleEnum } from "../../../generated";
import { NavDropdown } from "./nav-downdrop";

const { Header } = Layout;
const { Title, Text } = Typography;
const { useToken } = theme;

const NavBar: React.FC = () => {
  const { token } = useToken();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useGetIdentity<AccountDto>();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    navigate(`/search?keyword=${encodeURIComponent(value)}`);
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleSignup = () => {
    navigate("/register");
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate("/");
    setMobileMenuOpen(false);
  };

  // Navigation menu items for different user roles
  const publicMenuItems = [
    { key: "find-talent", label: "Find Talent", path: "/search" },
    { key: "find-work", label: "Find Work", path: "/search?type=work" },
  ];

  const clientMenuItems = [
    { key: "dashboard", label: "Dashboard", path: "/client/dashboard" },
    { key: "projects", label: "Projects", path: "/client/projects" },
    { key: "proposals", label: "Proposals", path: "/client/proposals" },
    { key: "messages", label: "Messages", path: "/client/messages" },
  ];

  const freelancerMenuItems = [
    { key: "dashboard", label: "Dashboard", path: "/freelancer/dashboard" },
    {
      key: "find-projects",
      label: "Find Projects",
      path: "/freelancer/find-projects",
    },
    {
      key: "proposals",
      label: "My Proposals",
      path: "/freelancer/my-proposals",
    },
    {
      key: "active-projects",
      label: "Active Projects",
      path: "/freelancer/active-projects",
    },
  ];

  const adminMenuItems = [
    { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
    { key: "accounts", label: "Accounts", path: "/admin/accounts" },
    { key: "projects", label: "Projects", path: "/admin/projects" },
    { key: "skills", label: "Skills", path: "/admin/skills" },
  ];

  const renderNavigationMenu = () => {
    if (!user) {
      return (
        <div className="hidden md:flex space-x-8">
          {publicMenuItems.map((item) => (
            <a
              key={item.key}
              onClick={() => navigate(item.path)}
              className="text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              {item.label}
            </a>
          ))}
        </div>
      );
    }

    switch (user.role) {
      case AccountDtoRoleEnum.Client:
        return <NavDropdown label="Client Area" items={clientMenuItems} />;
      case AccountDtoRoleEnum.Freelancer:
        return (
          <NavDropdown label="Freelancer Area" items={freelancerMenuItems} />
        );
      case AccountDtoRoleEnum.Admin:
        return <NavDropdown label="Admin Area" items={adminMenuItems} />;
      default:
        return null;
    }
  };

  const renderMobileMenu = () => {
    const menuItems = user
      ? user.role === AccountDtoRoleEnum.Client
        ? clientMenuItems
        : user.role === AccountDtoRoleEnum.Freelancer
        ? freelancerMenuItems
        : adminMenuItems
      : publicMenuItems;

    return (
      <div className="flex flex-col space-y-4">
        {menuItems.map((item) => (
          <Button
            key={item.key}
            type="text"
            block
            onClick={() => {
              navigate(item.path);
              setMobileMenuOpen(false);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <Header
      className="sticky top-0 z-50 px-6 h-16 flex items-center border-b border-solid w-full rounded-b-2xl"
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
              Hirable
            </Title>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {renderNavigationMenu()}
          </div>
        </div>

        {/* Desktop Search and Auth */}
        <div className="hidden md:flex items-center space-x-4">
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined className="text-gray-400" />}
            defaultValue={searchTerm}
            onPressEnter={(e) =>
              handleSearch((e.target as HTMLInputElement).value)
            }
            className="w-48 lg:w-64"
            style={{ backgroundColor: token.colorBgContainer }}
          />

          {user ? (
            <ProfileDropdownButton />
          ) : (
            <Space>
              <Button type="text" onClick={handleLogin}>
                Log in
              </Button>
              <Button type="primary" onClick={handleSignup}>
                Sign up
              </Button>
            </Space>
          )}
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

          {renderMobileMenu()}

          <div
            className="pt-4 border-t"
            style={{ borderColor: token.colorBorderSecondary }}
          >
            {user ? (
              <ProfileDropdownButton />
            ) : (
              <Space direction="vertical" className="w-full">
                <Button type="text" onClick={handleLogin} block>
                  Log in
                </Button>
                <Button
                  type="primary"
                  onClick={handleSignup}
                  block
                  className="bg-green-600"
                >
                  Sign up
                </Button>
              </Space>
            )}
          </div>
        </div>
      </Drawer>
    </Header>
  );
};

export default NavBar;
