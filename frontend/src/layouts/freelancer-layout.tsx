import React from "react";
import { Breadcrumb, Layout, Menu } from "antd";
import { ThemedHeaderV2 } from "@refinedev/antd";
import { Outlet } from "react-router";
import NavBar from "../components/navigation/navbar";
import FooterPage from "../components/common/footer/footer";

const { Header, Content, Footer } = Layout;

const FreelancerLayout: React.FC = () => {
  return (
    <Layout>
      <Header className="sticky top-0 z-[1] w-full flex items-center bg-inherit">
        <NavBar />
      </Header>
      <Content style={{ padding: "0 48px", minHeight: "50vh", marginTop: 48 }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <FooterPage />
      </Footer>
    </Layout>
  );
};

export default FreelancerLayout;
