import React from 'react';
import {ThemedLayoutV2, ThemedSiderV2} from "@refinedev/antd";
import {Header} from "../components/header";
import {Outlet} from "react-router";

const AdminLayout = () => {
    return (
        <ThemedLayoutV2
            Header={Header}
            Sider={(props) => (
                <ThemedSiderV2 {...props} fixed />
            )}
        >
            <Outlet />
        </ThemedLayoutV2>
    );
};

export default AdminLayout;