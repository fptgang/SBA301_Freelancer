// src/components/navigation/nav-dropdown.tsx
import {Button, Dropdown, Space, Typography} from "antd";
import {DownOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router";
import React from "react";

interface NavDropdownProps {
    label: string;
    items: {
        key: string;
        label: string;
        path?: string;
        icon?: React.ReactNode;
    }[];
    className?: string;
    isMobile?: boolean;
    walletAmount?: number;
    userName?: string;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
                                                            label,
                                                            items,
                                                            className,
                                                            isMobile = false,
                                                            walletAmount,
                                                            userName,
                                                        }) => {
    const navigate = useNavigate();
    const { Text } = Typography;

    const menuItems = {
        items: items.map((item) => ({
            key: item.key,
            label: (
                <span 
                    onClick={() => item.path && navigate(item.path)}
                    className="flex items-center"
                >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                </span>
            ),
        })),
    };

    return (
        <Dropdown menu={menuItems} trigger={[isMobile ? "click" : "hover"]}>
            <Button type="text" className={`flex items-center ${className}`}>
                <Space>
                    {label}
                    {userName && (
                        <Text strong className="ml-1">
                            {userName}
                        </Text>
                    )}
                    {walletAmount !== undefined && (
                        <Text className="text-green-500 ml-1">
                            ${walletAmount.toFixed(2)}
                        </Text>
                    )}
                    <DownOutlined />
                </Space>
            </Button>
        </Dropdown>
    );
};