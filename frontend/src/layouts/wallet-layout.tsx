import React from "react";
import { Breadcrumb, Layout, Menu, MenuProps, theme } from "antd";
import { Outlet, useNavigate } from "react-router";
import NavBar from "../components/navigation/navbar";
import FooterPage from "../components/common/footer/footer";
import { UserOutlined, LockOutlined, GlobalOutlined } from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

const WalletLayout: React.FC = ({}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();

  const menuItems: MenuProps["items"] = [
    {
      key: "index",
      icon: <GlobalOutlined />,
      label: "Overview",
      onClick: () => navigate("/wallet/"),
    },
    {
      key: "deposit",
      icon: <LockOutlined />,
      label: "Deposit",
      onClick: () => navigate("/wallet/deposit"),
    },
    {
      key: "withdraw",
      icon: <LockOutlined />,
      label: "Withdraw",
      onClick: () => navigate("/wallet/withdraw"),
    },
  ];

  return (
    <Layout>
      <Header className="bg-inherit">
        <NavBar />
      </Header>
      <div style={{ padding: "0 48px", minHeight: "50vh" }}>
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
              defaultSelectedKeys={["index"]}
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

export default WalletLayout;
