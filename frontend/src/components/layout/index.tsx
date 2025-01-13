import React from "react";
import { Breadcrumb, Layout, Menu } from "antd";
import { ThemedHeaderV2 } from "@refinedev/antd";

const { Header, Content, Footer } = Layout;

interface AppProps {
  HeaderContent: React.FC;
  InnerContent: React.FC;
  FooterContent: React.FC;
}

export const ClientLayout: React.FC<AppProps> = ({
  HeaderContent,
  InnerContent,
  FooterContent,
}) => {
  return (
    <Layout>
      <Header className="sticky top-0 z-[1] w-full flex items-center bg-inherit">
        <HeaderContent />
      </Header>
      <Content>
        <InnerContent />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <FooterContent />
      </Footer>
    </Layout>
  );
};

export default ClientLayout;
