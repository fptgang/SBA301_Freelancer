import React from "react";
import { Breadcrumb, Layout, Menu } from "antd";
import { Outlet } from "react-router";
import NavBar from "../components/navigation/navbar";
import FooterPage from "../components/common/footer/footer";

const { Header, Content, Footer } = Layout;

const MessageLayout: React.FC = () => {
  return (
    <Layout>
      <Header className="sticky top-0 z-[1] w-full flex items-center bg-inherit">
        <NavBar />
      </Header>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MessageLayout;
