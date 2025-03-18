import { UserOutlined } from "@ant-design/icons";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { Button, Dropdown } from "antd";
import { useNavigate } from "react-router";
import { AccountDto, AccountDtoRoleEnum } from "../../../../generated";
import { store } from "../../../store";

export const ProfileDropdownButton = () => {
  const nav = useNavigate();
  const { mutate: logout } = useLogout();
  const user = store.getState().auth.account;

  const menuItems = [
    // Add Dashboard item conditionally for admin users
    ...(user?.role === AccountDtoRoleEnum.Admin
      ? [
          {
            key: "dashboard",
            label: "Dashboard",
            onClick: () => nav("/dashboard"),
          },
        ]
      : []),
    {
      key: "profile",
      label: "Profile",
      onClick: () => {
        if (user?.role === AccountDtoRoleEnum.Client) nav("/client");
        if (user?.role === AccountDtoRoleEnum.Freelancer) nav("/freelancer");
      },
    },
    {
      key: "settings",
      label: "Settings",
      onClick: () => {
        nav("/settings");
      },
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
