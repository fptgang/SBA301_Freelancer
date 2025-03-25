import React from "react";
import { Breadcrumb, Layout, Menu, MenuProps, theme } from "antd";
import { Outlet, useNavigate } from "react-router";
import NavBar from "../components/navigation/navbar";
import FooterPage from "../components/common/footer/footer";
import { UserOutlined, LockOutlined, GlobalOutlined } from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

const SettingsLayout: React.FC = ({}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();

  const menuItems: MenuProps["items"] = [
    {
      key: "account",
      icon: <UserOutlined />,
      label: "Account Settings",
      onClick: () => navigate("/settings/account"),
    },
    {
      key: "security",
      icon: <LockOutlined />,
      label: "Security Settings",
      onClick: () => navigate("/settings/security"),
    },
    {
      key: "local",
      icon: <GlobalOutlined />,
      label: "Local Settings",
      onClick: () => navigate("/settings/local"),
    },
  ];

  return (
    <Layout>
      <Header className="sticky top-0 z-[1] w-full flex items-center bg-inherit">
        <NavBar />
      </Header>
      <div style={{ padding: "0 48px" }}>
        <Layout
          style={{
            padding: "24px 0",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            margin: "24px 0",
          }}
        >
          <Sider style={{ background: colorBgContainer }} width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={["account"]}
              style={{ height: "100%" }}
              items={menuItems}
            />
          </Sider>
          <Content style={{ padding: "0 24px", minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </div>
      <Footer style={{ textAlign: "center" }}>
        <FooterPage />
      </Footer>
    </Layout>
  );
};

export default SettingsLayout;
