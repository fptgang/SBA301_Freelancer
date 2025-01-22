// src/components/navigation/nav-dropdown.tsx
import {Button, Dropdown, Space} from "antd";
import {DownOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router";

interface NavDropdownProps {
    label: string;
    items: {
        key: string;
        label: string;
        path?: string;
    }[];
    className?: string;
    isMobile?: boolean;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
                                                            label,
                                                            items,
                                                            className,
                                                            isMobile = false,
                                                        }) => {
    const navigate = useNavigate();

    const menuItems = {
        items: items.map((item) => ({
            key: item.key,
            label: (
                <span onClick={() => item.path && navigate(item.path)}>{item.label}</span>
            ),
        })),
    };

    return (
        <Dropdown menu={menuItems} trigger={[isMobile ? "click" : "hover"]}>
            <Button type="text" className={`flex items-center ${className}`}>
                <Space>
                    {label}
                    <DownOutlined/>
                </Space>
            </Button>
        </Dropdown>
    );
};