import React from "react";
import { Layout, Menu } from "antd";
import { Outlet } from "react-router";

const { Sider, Content } = Layout;

interface MenuItems {
    key: string;
    icon: JSX.Element;
    label: string;
    onClick: () => string | void;
}

interface SettingsLayoutProps {
    menuItems: MenuItems[];
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ menuItems }) => {
    return (
        <Layout className="min-h-screen">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Layout className="bg-transparent flex flex-col lg:flex-row">
                    {/* Sidebar that becomes horizontal on mobile */}
                    <Sider
                        width={280}
                        className="bg-slate-50 lg:bg-slate-50 lg:min-h-screen"
                        breakpoint="lg"
                        collapsedWidth={0}
                    >
                        <div className="p-4">
                            <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
                        </div>
                        <Menu
                            mode="inline"
                            defaultSelectedKeys={["profile"]}
                            items={menuItems}
                            className="border-r-0 lg:h-full"
                        />
                    </Sider>

                    {/* Main content */}
                    <Content className="p-4 sm:p-6 lg:p-8 bg-white flex-1">
                        <Outlet />
                    </Content>
                </Layout>
            </div>
        </Layout>
    );
};

export default SettingsLayout;