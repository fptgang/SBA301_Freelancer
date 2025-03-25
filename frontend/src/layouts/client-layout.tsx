import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router";
import NavBar from "../components/navigation/navbar";
import FooterPage from "../components/common/footer/footer";

const { Header, Content, Footer } = Layout;

const ClientLayout: React.FC = () => {
  return (
    <Layout>
      <Header className="sticky top-0 z-[1] w-full flex items-center bg-inherit">
        <NavBar />
      </Header>
      <Content>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <FooterPage />
      </Footer>
    </Layout>
  );
};

export default ClientLayout;
