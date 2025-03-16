import React from "react";
import { Breadcrumb, Layout, Menu } from "antd";
import { Outlet } from "react-router";
import NavBar from "../components/navigation/navbar";
import FooterPage from "../components/common/footer/footer";

const { Header, Content, Footer } = Layout;

const MessageLayout: React.FC = () => {
  return (
    <Layout>
      <NavBar />
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MessageLayout;
