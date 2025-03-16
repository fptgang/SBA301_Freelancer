import React from "react";
import { Breadcrumb, Layout, Menu } from "antd";
import { ThemedHeaderV2 } from "@refinedev/antd";
import { Outlet } from "react-router";
import NavBar from "../components/navigation/navbar";
import FooterPage from "../components/common/footer/footer";

const { Header, Content, Footer } = Layout;

const PublicLayout: React.FC = () => {
  return (
    <Layout>
      <NavBar />
      <Content>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <FooterPage />
      </Footer>
    </Layout>
  );
};

export default PublicLayout;
