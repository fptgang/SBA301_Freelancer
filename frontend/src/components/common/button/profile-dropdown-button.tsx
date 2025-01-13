import { UserOutlined } from "@ant-design/icons";
import { useLogout } from "@refinedev/core";
import { Button, Dropdown } from "antd";
import { useNavigate } from "react-router";

export const ProfileDropdownButton = () => {
  const nav = useNavigate();
  const { mutate: logout } = useLogout();

  const menuItems = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => nav("/profile"),
    },
    {
      key: "settings",
      label: "Settings",
      onClick: () => nav("/settings"),
    },
    {
      key: "logout",
      label: "Logout",
      onClick: () => logout(),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Button
        shape="circle"
        size="large"
        icon={<UserOutlined />}
        className="flex items-center justify-center bg-gray-100 hover:bg-gray-200"
      />
    </Dropdown>
  );
};
