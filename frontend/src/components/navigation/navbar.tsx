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
  BankOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import { useGetIdentity } from "@refinedev/core";
import { ProfileDropdownButton } from "../common/buttons/profile-dropdown-button";
import { AccountDto, AccountDtoRoleEnum } from "../../../generated";
import { NavDropdown } from "./nav-downdrop";

const { Header } = Layout;
const { Title, Text } = Typography;
const { useToken } = theme;

// Public Navbar Component
const PublicNavBar: React.FC = () => {
  const { token } = useToken();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const findWorkItems = [
    {
      key: "find-work",
      label: "Browse Jobs",
      path: "/search?type=work",
      icon: <SearchOutlined />,
    },
  ];

  const findTalentItems = [
    {
      key: "find-talent",
      label: "Browse Talent",
      path: "/search",
      icon: <SearchOutlined />,
    },
    {
      key: "post-job",
      label: "Post a Job",
      path: "/client/projects",
      icon: <FileTextOutlined />,
    },
  ];

  // const resourcesItems = [
  //   {
  //     key: "pricing",
  //     label: "Pricing",
  //     path: "/pricing",
  //     icon: <WalletOutlined />,
  //   },
  //   {
  //     key: "help",
  //     label: "Help Center",
  //     path: "/help",
  //     icon: <MessageOutlined />,
  //   },
  // ];

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
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
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center cursor-pointer mr-8"
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

          {/* Desktop Navigation - Grouped by related features */}
          <div className="hidden md:flex items-center space-x-4">
            <NavDropdown label="Find Work" items={findWorkItems} />
            <NavDropdown label="Find Talent" items={findTalentItems} />
            {/* <NavDropdown label="Resources" items={resourcesItems} /> */}
          </div>
        </div>

        {/* Desktop Search and Auth */}
        <div className="hidden md:flex items-center space-x-4">
          <Input
            placeholder="Search jobs..."
            prefix={<SearchOutlined className="text-gray-400" />}
            defaultValue={searchTerm}
            onPressEnter={(e) =>
              handleSearch((e.target as HTMLInputElement).value)
            }
            className="w-48 lg:w-64"
            style={{ backgroundColor: token.colorBgContainer }}
          />

          <Space>
            <Button type="text" onClick={handleLogin}>
              Log in
            </Button>
            <Button type="primary" onClick={handleSignup}>
              Sign up
            </Button>
          </Space>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => {
              const searchInput = document.createElement("input");
              searchInput.type = "text";
              searchInput.placeholder = "Search jobs...";
              searchInput.style.position = "fixed";
              searchInput.style.top = "16px";
              searchInput.style.left = "50%";
              searchInput.style.transform = "translateX(-50%)";
              searchInput.style.zIndex = "1000";
              searchInput.style.padding = "8px";
              searchInput.style.borderRadius = "4px";
              searchInput.style.width = "80%";
              document.body.appendChild(searchInput);
              searchInput.focus();

              searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                  handleSearch(searchInput.value);
                  document.body.removeChild(searchInput);
                }
              });

              searchInput.addEventListener("blur", () => {
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
            <img
              src="/public/icon.svg"
              alt="Logo"
              className="h-6 w-auto mr-2"
            />
            <Title level={5} className="!m-0">
              Hirable
            </Title>
          </div>
        }
      >
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Find Work
            </Text>
            {findWorkItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Find Talent
            </Text>
            {findTalentItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Resources
            </Text>
            {resourcesItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div> */}

          <div
            className="pt-4 border-t"
            style={{ borderColor: token.colorBorderSecondary }}
          >
            <Space direction="vertical" className="w-full">
              <Button type="text" onClick={handleLogin} block>
                Log in
              </Button>
              <Button type="primary" onClick={handleSignup} block>
                Sign up
              </Button>
            </Space>
          </div>
        </div>
      </Drawer>
    </Header>
  );
};

// Client Navbar Component
const ClientNavBar: React.FC = () => {
  const { token } = useToken();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useGetIdentity<AccountDto>();

  // Mock wallet amount - in a real app, get this from user data
  const walletAmount = user?.balance || 0;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
    setMobileMenuOpen(false);
  };

  const dashboardItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      path: "/client/dashboard",
      icon: <DashboardOutlined />,
    },
  ];

  const projectItems = [
    {
      key: "projects",
      label: "My Projects",
      path: "/client/projects",
      icon: <ProjectOutlined />,
    },
    {
      key: "post-project",
      label: "Post New Project",
      path: "/client/post-project",
      icon: <FileTextOutlined />,
    },
    {
      key: "drafts",
      label: "Project Drafts",
      path: "/client/drafts",
      icon: <FileTextOutlined />,
    },
  ];

  const messagingItems = [
    {
      key: "chat",
      label: "Messages",
      path: "/message",
      icon: <MessageOutlined />,
    },
  ];

  // const financeItems = [
  //   { key: "wallet", label: "Wallet", path: "/wallet", icon: <WalletOutlined /> },
  //   { key: "payments", label: "Payment Methods", path: "/payment-methods", icon: <BankOutlined /> },
  //   { key: "transactions", label: "Transactions", path: "/transactions", icon: <FileTextOutlined /> },
  // ];

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
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
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center cursor-pointer mr-8"
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

          {/* Desktop Navigation - Grouped by related features */}
          <div className="hidden md:flex items-center space-x-4">
            <NavDropdown label="Dashboard" items={dashboardItems} />
            <NavDropdown label="Projects" items={projectItems} />
            <NavDropdown label="Messages" items={messagingItems} />
            {/* <NavDropdown 
              label="Finance" 
              items={financeItems} 
              walletAmount={walletAmount}
              userName={user?.firstName || 'Client'}
            /> */}
          </div>
        </div>

        {/* Desktop Search and Profile */}
        <div className="hidden md:flex items-center space-x-4">
          <Input
            placeholder="Search talent..."
            prefix={<SearchOutlined className="text-gray-400" />}
            defaultValue={searchTerm}
            onPressEnter={(e) =>
              handleSearch((e.target as HTMLInputElement).value)
            }
            className="w-48 lg:w-64"
            style={{ backgroundColor: token.colorBgContainer }}
          />

          <ProfileDropdownButton />
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => {
              const searchInput = document.createElement("input");
              searchInput.type = "text";
              searchInput.placeholder = "Search talent...";
              searchInput.style.position = "fixed";
              searchInput.style.top = "16px";
              searchInput.style.left = "50%";
              searchInput.style.transform = "translateX(-50%)";
              searchInput.style.zIndex = "1000";
              searchInput.style.padding = "8px";
              searchInput.style.borderRadius = "4px";
              searchInput.style.width = "80%";
              document.body.appendChild(searchInput);
              searchInput.focus();

              searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                  handleSearch(searchInput.value);
                  document.body.removeChild(searchInput);
                }
              });

              searchInput.addEventListener("blur", () => {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/public/icon.svg"
                alt="Logo"
                className="h-6 w-auto mr-2"
              />
              <Title level={5} className="!m-0">
                Hirable
              </Title>
            </div>
            <Text className="text-green-500">${walletAmount.toFixed(2)}</Text>
          </div>
        }
      >
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Dashboard
            </Text>
            {dashboardItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Projects
            </Text>
            {projectItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Messages
            </Text>
            {messagingItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">Finance</Text>
            {financeItems.map((item) => (
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
          </div> */}

          <div
            className="pt-4 border-t"
            style={{ borderColor: token.colorBorderSecondary }}
          >
            <ProfileDropdownButton />
          </div>
        </div>
      </Drawer>
    </Header>
  );
};

// Freelancer Navbar Component
const FreelancerNavBar: React.FC = () => {
  const { token } = useToken();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useGetIdentity<AccountDto>();

  // Mock wallet amount - in a real app, get this from user data
  const walletAmount = 1275.5;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      navigate(`/search?type=work&keyword=${encodeURIComponent(value)}`);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
    setMobileMenuOpen(false);
  };

  const dashboardItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      path: "/freelancer/dashboard",
      icon: <DashboardOutlined />,
    },
  ];

  const workItems = [
    {
      key: "proposals",
      label: "My Proposals",
      path: "/freelancer/proposals",
      icon: <FileTextOutlined />,
    },
    {
      key: "active-projects",
      label: "Active Projects",
      path: "/freelancer/projects",
      icon: <ProjectOutlined />,
    },
    {
      key: "find-work",
      label: "Find Jobs",
      path: "/search?type=work",
      icon: <SearchOutlined />,
    },
  ];

  const profileItems = [
    {
      key: "profile",
      label: "My Profile",
      path: "/freelancer/profile",
      icon: <ProfileOutlined />,
    },
  ];

  const messagingItems = [
    {
      key: "chat",
      label: "Messages",
      path: "/message",
      icon: <MessageOutlined />,
    },
  ];

  // const financeItems = [
  //   { key: "wallet", label: "Wallet", path: "/wallet", icon: <WalletOutlined /> },
  //   { key: "payments", label: "Payment Methods", path: "/payment-methods", icon: <BankOutlined /> },
  //   { key: "earnings", label: "Earnings", path: "/earnings", icon: <FileTextOutlined /> },
  // ];

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
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
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center cursor-pointer mr-8"
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

          {/* Desktop Navigation - Grouped by related features */}
          <div className="hidden md:flex items-center space-x-4">
            <NavDropdown label="Dashboard" items={dashboardItems} />
            <NavDropdown label="Work" items={workItems} />
            <NavDropdown label="Profile" items={profileItems} />
            <NavDropdown label="Messages" items={messagingItems} />
            {/* <NavDropdown 
              label="Finance" 
              items={financeItems} 
              walletAmount={walletAmount}
              userName={user?.firstName || 'Freelancer'}
            /> */}
          </div>
        </div>

        {/* Desktop Search and Profile */}
        <div className="hidden md:flex items-center space-x-4">
          <Input
            placeholder="Search jobs..."
            prefix={<SearchOutlined className="text-gray-400" />}
            defaultValue={searchTerm}
            onPressEnter={(e) =>
              handleSearch((e.target as HTMLInputElement).value)
            }
            className="w-48 lg:w-64"
            style={{ backgroundColor: token.colorBgContainer }}
          />

          <ProfileDropdownButton />
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => {
              const searchInput = document.createElement("input");
              searchInput.type = "text";
              searchInput.placeholder = "Search jobs...";
              searchInput.style.position = "fixed";
              searchInput.style.top = "16px";
              searchInput.style.left = "50%";
              searchInput.style.transform = "translateX(-50%)";
              searchInput.style.zIndex = "1000";
              searchInput.style.padding = "8px";
              searchInput.style.borderRadius = "4px";
              searchInput.style.width = "80%";
              document.body.appendChild(searchInput);
              searchInput.focus();

              searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                  handleSearch(searchInput.value);
                  document.body.removeChild(searchInput);
                }
              });

              searchInput.addEventListener("blur", () => {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/public/icon.svg"
                alt="Logo"
                className="h-6 w-auto mr-2"
              />
              <Title level={5} className="!m-0">
                Hirable
              </Title>
            </div>
            <Text className="text-green-500">${walletAmount.toFixed(2)}</Text>
          </div>
        }
      >
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Dashboard
            </Text>
            {dashboardItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Work
            </Text>
            {workItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Profile
            </Text>
            {profileItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">
              Messages
            </Text>
            {messagingItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                block
                icon={item.icon}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={
                  isActive(item.path) ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* <div className="flex flex-col space-y-2">
            <Text strong className="pb-1 border-b">Finance</Text>
            {financeItems.map((item) => (
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
          </div> */}

          <div
            className="pt-4 border-t"
            style={{ borderColor: token.colorBorderSecondary }}
          >
            <ProfileDropdownButton />
          </div>
        </div>
      </Drawer>
    </Header>
  );
};

// Main Navbar Switch Component
const NavBar: React.FC = () => {
  const { data: user } = useGetIdentity<AccountDto>();

  if (!user) {
    return <PublicNavBar />;
  }

  switch (user.role) {
    case AccountDtoRoleEnum.Client:
      return <ClientNavBar />;
    case AccountDtoRoleEnum.Freelancer:
      return <FreelancerNavBar />;
    case AccountDtoRoleEnum.Admin:
      // Keep original admin section from previous implementation
      return (
        <Header className="sticky top-0 z-50 px-6 h-16 flex items-center border-b border-solid w-full rounded-b-2xl">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <div
                className="flex items-center cursor-pointer mr-12"
                onClick={() => (window.location.href = "/")}
              >
                <img src="/public/icon.svg" alt="Logo" className="h-8 w-auto" />
                <Title level={5} className="!m-0 ml-2">
                  Hirable Admin
                </Title>
              </div>
              <NavDropdown
                label="Admin Area"
                items={[
                  {
                    key: "dashboard",
                    label: "Dashboard",
                    path: "/admin/dashboard",
                    icon: <DashboardOutlined />,
                  },
                  {
                    key: "accounts",
                    label: "Accounts",
                    path: "/admin/accounts",
                    icon: <UserOutlined />,
                  },
                  {
                    key: "projects",
                    label: "Projects",
                    path: "/admin/projects",
                    icon: <ProjectOutlined />,
                  },
                  {
                    key: "project-categories",
                    label: "Categories",
                    path: "/admin/project-categories",
                    icon: <ProjectOutlined />,
                  },
                  {
                    key: "skills",
                    label: "Skills",
                    path: "/admin/skills",
                    icon: <ProfileOutlined />,
                  },
                  {
                    key: "transactions",
                    label: "Transactions",
                    path: "/admin/transactions",
                    icon: <WalletOutlined />,
                  },
                ]}
              />
            </div>
            <ProfileDropdownButton />
          </div>
        </Header>
      );
    default:
      return <PublicNavBar />;
  }
};

export default NavBar;
