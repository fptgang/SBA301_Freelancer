import React from "react";
import { Layout, Row, Col, Typography, List, Space } from "antd";
import {
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";

export default function Footer() {
  const { Footer } = Layout;
  const { Title, Text, Link } = Typography;

  const footerLinks = {
    forClients: [
      "How to Hire",
      "Talent Marketplace",
      "Project Catalog",
      "Talent Scout",
    ],
    forTalent: ["How to Find Work", "Direct Contracts", "Find Freelance Jobs"],
    resources: ["Help & Support", "Success Stories", "Blog", "Community"],
  };

  return (
    <Footer className=" text-white pt-12 pb-6">
      <div className="container mx-auto">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={8}>
            <Title level={4} className="text-white mb-4">
              For Clients
            </Title>
            <List
              dataSource={footerLinks.forClients}
              renderItem={(item) => (
                <List.Item className="border-none p-0 mb-2">
                  <Link className="text-gray-400 hover:text-white">{item}</Link>
                </List.Item>
              )}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Title level={4} className="text-white mb-4">
              For Talent
            </Title>
            <List
              dataSource={footerLinks.forTalent}
              renderItem={(item) => (
                <List.Item className="border-none p-0 mb-2">
                  <Link className="text-gray-400 hover:text-white">{item}</Link>
                </List.Item>
              )}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Title level={4} className="text-white mb-4">
              Resources
            </Title>
            <List
              dataSource={footerLinks.resources}
              renderItem={(item) => (
                <List.Item className="border-none p-0 mb-2">
                  <Link className="text-gray-400 hover:text-white">{item}</Link>
                </List.Item>
              )}
            />
          </Col>
        </Row>
        <div className="border-t border-gray-800 mt-8 pt-6">
          <Row justify="space-between" align="middle">
            <Col>
              <Text className="text-gray-400">
                © 2024 Freelancer. All rights reserved
              </Text>
            </Col>
            <Col>
              <Space size={16}>
                <Link className="text-gray-400 hover:text-white text-xl">
                  <GithubOutlined />
                </Link>
                <Link className="text-gray-400 hover:text-white text-xl">
                  <TwitterOutlined />
                </Link>
                <Link className="text-gray-400 hover:text-white text-xl">
                  <LinkedinOutlined />
                </Link>
              </Space>
            </Col>
          </Row>
        </div>
      </div>
    </Footer>
  );
}
