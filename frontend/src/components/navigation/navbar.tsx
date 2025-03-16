import React, { useState } from "react";
import { Input, Button, Typography, Space, Drawer, Layout, theme } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  DashboardOutlined,
  ProjectOutlined,
  MessageOutlined,
  WalletOutlined,
  FileTextOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import { Authenticated, useGetIdentity } from "@refinedev/core";
import { ProfileDropdownButton } from "../common/buttons/profile-dropdown-button";
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
  const location = useLocation();
  const { data: user } = useGetIdentity<AccountDto>();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`);
    }
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

  // Navigation menu items for different user roles - aligned with actual routes in App.tsx
  const publicMenuItems = [
    { key: "find-talent", label: "Find Talent", path: "/search", icon: <SearchOutlined /> },
    { key: "find-work", label: "Find Work", path: "/search?type=work", icon: <SearchOutlined /> },
    { key: "pricing", label: "Pricing", path: "/pricing", icon: <WalletOutlined /> },
  ];

  const clientMenuItems = [
    { key: "dashboard", label: "Dashboard", path: "/client/dashboard", icon: <DashboardOutlined /> },
    { key: "projects", label: "Projects", path: "/client/projects", icon: <ProjectOutlined /> },
    { key: "wallet", label: "Wallet", path: "/wallet", icon: <WalletOutlined /> },
    { key: "chat", label: "Messages", path: "/message", icon: <MessageOutlined /> },
  ];

  const freelancerMenuItems = [
    { key: "dashboard", label: "Dashboard", path: "/freelancer/dashboard", icon: <DashboardOutlined /> },
    { key: "proposals", label: "My Proposals", path: "/freelancer/proposals", icon: <FileTextOutlined /> },
    { key: "profile", label: "Profile", path: "/freelancer/profile", icon: <ProfileOutlined /> },
    { key: "wallet", label: "Wallet", path: "/wallet", icon: <WalletOutlined /> },
    { key: "chat", label: "Messages", path: "/message", icon: <MessageOutlined /> },
  ];

  const adminMenuItems = [
    { key: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: <DashboardOutlined /> },
    { key: "accounts", label: "Accounts", path: "/admin/accounts", icon: <UserOutlined /> },
    { key: "projects", label: "Projects", path: "/admin/projects", icon: <ProjectOutlined /> },
    { key: "project-categories", label: "Categories", path: "/admin/project-categories", icon: <ProjectOutlined /> },
    { key: "skills", label: "Skills", path: "/admin/skills", icon: <ProfileOutlined /> },
    { key: "transactions", label: "Transactions", path: "/admin/transactions", icon: <WalletOutlined /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const renderNavigationMenu = () => {
    if (!user) {
      return (
        <div className="hidden md:flex space-x-8">
          {publicMenuItems.map((item) => (
            <a
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex items-center text-gray-500 hover:text-gray-900 cursor-pointer ${
                isActive(item.path) ? "font-semibold text-gray-900" : ""
              }`}
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
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
        return <NavDropdown label="Freelancer Area" items={freelancerMenuItems} />;
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
        : user.role === AccountDtoRoleEnum.Admin
        ? adminMenuItems
        : publicMenuItems
      : publicMenuItems;

    return (
      <div className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.key}
            type="text"
            block
            icon={item.icon}
            onClick={() => {
              navigate(item.path);
              setMobileMenuOpen(false);
            }}
            className={isActive(item.path) ? "font-semibold bg-gray-100" : ""}
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
        <div className="flex md:hidden items-center space-x-2">
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => {
              const searchInput = document.createElement('input');
              searchInput.type = 'text';
              searchInput.placeholder = 'Search...';
              searchInput.style.position = 'fixed';
              searchInput.style.top = '16px';
              searchInput.style.left = '50%';
              searchInput.style.transform = 'translateX(-50%)';
              searchInput.style.zIndex = '1000';
              searchInput.style.padding = '8px';
              searchInput.style.borderRadius = '4px';
              searchInput.style.width = '80%';
              document.body.appendChild(searchInput);
              searchInput.focus();
              
              searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchInput.value);
                  document.body.removeChild(searchInput);
                }
              });
              
              searchInput.addEventListener('blur', () => {
                document.body.removeChild(searchInput);
              });
            }}
          />
          
          <Button
            type="text"
            icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        styles={{
          body: {
            padding: 16,
            backgroundColor: token.colorBgContainer,
          },
        }}
        title={
          <div className="flex items-center">
            <img src="/public/icon.svg" alt="Logo" className="h-6 w-auto mr-2" />
            <Title level={5} className="!m-0">Hirable</Title>
          </div>
        }
      >
        <div className="flex flex-col space-y-6">
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
