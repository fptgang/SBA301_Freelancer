import React, { useState } from "react";
import {
    Input,
    Button,
    Typography,
    Space,
    Drawer,
    Layout,
    theme,
} from "antd";
import {
    SearchOutlined,
    UserOutlined,
    MenuOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { Authenticated, useGetIdentity } from "@refinedev/core";
import { ProfileDropdownButton } from "../common/button/profile-dropdown-button";
import {AccountDto, AccountDtoRoleEnum} from "../../../generated";
import {NavDropdown} from "./nav-downdrop";

const { Header } = Layout;
const { Title } = Typography;
const { useToken } = theme;

const NavBar: React.FC = () => {
    const { token } = useToken();
    const [searchTerm, setSearchTerm] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { data: user } = useGetIdentity<AccountDto>();

    const handleSearch = (value: string) => {
        setSearchTerm(value);
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

    const clientMenuItems = [
        { key: "dashboard", label: "Dashboard", path: "/client/dashboard" },
        { key: "projects", label: "Projects", path: "/client/projects" },
        { key: "proposals", label: "Proposals", path: "/client/proposals" },
        { key: "messages", label: "Messages", path: "/client/messages" },
    ];

    const freelancerMenuItems = [
        { key: "dashboard", label: "Dashboard", path: "/freelancer/dashboard" },
        { key: "find-projects", label: "Find Projects", path: "/freelancer/find-projects" },
        { key: "proposals", label: "My Proposals", path: "/freelancer/my-proposals" },
        { key: "active-projects", label: "Active Projects", path: "/freelancer/active-projects" },
    ];

    const adminMenuItems = [
        { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
        { key: "accounts", label: "Accounts", path: "/admin/accounts" },
        { key: "projects", label: "Projects", path: "/admin/projects" },
        { key: "skills", label: "Skills", path: "/admin/skills" },
    ];

    const renderNavigationMenu = () => {
        if (!user) return null;
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

    const renderMobileNavigationMenu = () => {
        if (!user) return null;

        switch (user.role) {
            case AccountDtoRoleEnum.Client:
                return (
                    <NavDropdown
                        label="Client Area"
                        items={clientMenuItems}
                        className="w-full text-left"
                        isMobile
                    />
                );
            case AccountDtoRoleEnum.Freelancer:
                return (
                    <NavDropdown
                        label="Freelancer Area"
                        items={freelancerMenuItems}
                        className="w-full text-left"
                        isMobile
                    />
                );
            case AccountDtoRoleEnum.Admin:
                return (
                    <NavDropdown
                        label="Admin Area"
                        items={adminMenuItems}
                        className="w-full text-left"
                        isMobile
                    />
                );
            default:
                return null;
        }
    };

    return (
        <nav
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
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-48 lg:w-64"
                        style={{ backgroundColor: token.colorBgContainer }}
                    />

                    {
                        user ? (
                                <ProfileDropdownButton />
                        ) : (
                            <Space>
                                <Button type="text" onClick={handleLogin}>
                                    Login
                                </Button>
                                <Button type="primary" onClick={handleSignup}>
                                    Sign Up
                                </Button>
                            </Space>
                        )
                    }
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

                    {renderMobileNavigationMenu()}

                    <div
                        className="pt-4 border-t"
                        style={{ borderColor: token.colorBorderSecondary }}
                    >
                        {user ? (
                                <ProfileDropdownButton />
                        ) : (
                            <Space direction="vertical">
                                <Button type="text" onClick={handleLogin}>
                                    Login
                                </Button>

                                <Button type="primary" onClick={handleSignup}>
                                    Sign Up
                                </Button>
                            </Space>
                            )}
                    </div>
                </div>
            </Drawer>
        </nav>
    );
};

export default NavBar;