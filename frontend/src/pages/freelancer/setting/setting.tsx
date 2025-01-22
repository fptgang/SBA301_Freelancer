import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  SecurityScanOutlined,
  DollarOutlined,
  NotificationOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useGo } from "@refinedev/core";
import { Outlet } from "react-router";
import SettingsLayout from "../../../components/layout/settings-layout";

const { Sider, Content } = Layout;

const FreeLancerSettings: React.FC = () => {
  const navigate = useGo();

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Info",
      onClick: () => navigate({ to: "profile" }),
    },
    {
      key: "security",
      icon: <SecurityScanOutlined />,
      label: "Password & Security",
      onClick: () => navigate({ to: "settings" }),
    },
    {
      key: "billing",
      icon: <DollarOutlined />,
      label: "Billing Methods",
      onClick: () => navigate({ to: "transactions" }),
    },
    {
      key: "messages",
      icon: <NotificationOutlined />,
      label: "Notification Settings",
      onClick: () => navigate({ to: "messages" }),
    },
  ];

  return <SettingsLayout menuItems={menuItems} />;
};

export default FreeLancerSettings;
