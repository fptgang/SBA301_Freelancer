// src/App.tsx
import {Authenticated, Refine} from "@refinedev/core";
import {DevtoolsPanel, DevtoolsProvider} from "@refinedev/devtools";
import {RefineKbar, RefineKbarProvider} from "@refinedev/kbar";
import {ErrorComponent, ThemedLayoutContext, ThemedLayoutV2, ThemedSiderV2} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerBindings, {
    DocumentTitleHandler,
    NavigateToResource,
    UnsavedChangesNotifier,
} from "@refinedev/react-router";
import {App as AntdApp} from "antd";
import {
    AppstoreOutlined,
    DashboardOutlined,
    DollarCircleFilled,
    FileTextOutlined,
    IdcardOutlined,
    MessageOutlined,
    ProjectOutlined,
    SettingOutlined,
    ToolOutlined,
    UserOutlined,
} from "@ant-design/icons";

// Layouts


// Admin Pages
import {
    AccountsList,
    AccountsEdit,
    AccountsShow, AccountsCreate,
} from "./pages/admin/accounts";
import {
    ProjectsList,
    ProjectsCreate,
    ProjectsEdit,
    ProjectsShow,
} from "./pages/admin/projects";

import {
    SkillsList,
    SkillsCreate,
    SkillsEdit,
    SkillsShow,
} from "./pages/admin/skills";
import {
    TransactionsList,
    TransactionsCreate,
    TransactionsEdit,
    TransactionsShow,
} from "./pages/admin/transactions";

// Client Pages
import ClientDashboard from "./pages/client/dashboard";
import ClientProposalList from "./pages/client/proposal/client-list";
import ClientMessageList from "./pages/client/mesages/client-list";
import ClientSettings from "./pages/client/setting";


// Freelancer Pages
import FreelancerDashboardPage from "./pages/freelancer/dashboard/dashboard";
import FreelancerFindProjectPage from "./pages/freelancer/find-projects/find-project";
import FreelancerMyProposalPage from "./pages/freelancer/my-proposal/my-proposal";
import FreelancerActiveProject from "./pages/freelancer/active-projects/active-project";
import FreeLancerMessagePage from "./pages/freelancer/messages/message";
import FreeLancerSettings from "./pages/freelancer/setting/setting";

// Public Pages
import About from "./pages/about";
import Pricing from "./pages/pricing";


// Providers and Config
import {dataProvider} from "./providers/data-provider";
import {notificationProvider} from "./providers/notification-provider";
import {accessControlProvider} from "./providers/access-control-provider";
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import axiosConfig from "./config/axios-config";
import {authProvider} from "./authProvider";
import {API_URL} from "./utils/constants";
import PublicLayout from "./components/layout/public-layout";
import AdminLayout from "./components/layout/admin-layout";
import ClientLayout from "./components/layout/client-layout";
import FreelancerLayout from "./components/layout/freelancer-layout";
import ClientList from "./pages/client/projects/client-list";
import {ForgotPassword} from "./pages/auth/forgotPassword";
import LandingPage from "./pages/landing/landing-page";
import {Login} from "./pages/auth/login";
import {Register} from "./pages/auth/register";
import ResetPassword from "./pages/auth/reset-password";
import ClientTransactionList from "./pages/client/transactions/client-list";
import {
    ProjectCategoriesCreate,
    ProjectCategoriesEdit,
    ProjectCategoriesList,
    ProjectCategoriesShow
} from "./pages/admin/projectcategories";
import {ColorModeContextProvider} from "./contexts/color-mode";


const resources = [
    {
        name: "dashboard",
        list: "/admin/dashboard",
        meta: {
            label: "Dashboard",
            icon: <DashboardOutlined/>,
        },
    },
    {
        name: "accounts",
        list: "/admin/accounts",
        create: "/admin/accounts/create",
        edit: "/admin/accounts/edit/:id",
        show: "/admin/accounts/show/:id",
        meta: {
            label: "Accounts",
            canDelete: true,
            icon: <UserOutlined/>,
        },
    },
    {
        name: "projectCategories",
        list: "/admin/project-categories",
        create: "/admin/project-categories/create",
        edit: "/admin/project-categories/edit/:id",
        show: "/admin/project-categories/show/:id",
        meta: {
            label: "Project Categories",
            canDelete: true,
            icon: <AppstoreOutlined/>,
        },
    },
    {
        name: "projects",
        list: "/admin/projects",
        create: "/admin/projects/create",
        edit: "/admin/projects/edit/:id",
        show: "/admin/projects/show/:id",
        meta: {
            icon: <ProjectOutlined/>,
        },
    },
    {
        name: "skills",
        list: "/admin/skills",
        create: "/admin/skills/create",
        edit: "/admin/skills/edit/:id",
        show: "/admin/skills/show/:id",
        meta: {
            icon: <ToolOutlined/>,
        },
    },
    {
        name: "transactions",
        list: "/admin/transactions",
        create: "/admin/transactions/create",
        edit: "/admin/transactions/edit/:id",
        show: "/admin/transactions/show/:id",
        meta: {
            icon: <DollarCircleFilled/>,
        },
    },
];

function App() {
    return (
        <BrowserRouter>
            <RefineKbarProvider>
                <AntdApp>
                    <ColorModeContextProvider>

                    <DevtoolsProvider>
                        <Refine
                            dataProvider={dataProvider(API_URL, axiosConfig)}
                            notificationProvider={notificationProvider}
                            authProvider={authProvider}
                            accessControlProvider={accessControlProvider}
                            routerProvider={routerBindings}
                            resources={resources}
                            options={{
                                syncWithLocation: true,
                                warnWhenUnsavedChanges: true,
                                useNewQueryKeys: true,
                                mutationMode: "pessimistic",
                            }}
                        >
                            <Routes>
                                {/* Public Routes */}
                                <Route element={<PublicLayout/>}>
                                    <Route index element={<LandingPage/>}/>
                                    <Route path="about" element={<About/>}/>
                                    <Route path="pricing" element={<Pricing/>}/>
                                    <Route path="login" element={<Login/>}/>
                                    <Route path="register" element={<Register/>}/>
                                    <Route path="forgot-password" element={<ForgotPassword/>}/>
                                    <Route path="reset-password" element={<ResetPassword/>}/>
                                </Route>

                                {/* Admin Routes */}
                                <Route
                                    path="admin"
                                    element={
                                        <Authenticated fallback={<Navigate to="/login"/>} key={"authenticated-inner"}>
                                            <AdminLayout/>
                                        </Authenticated>
                                    }
                                >
                                    <Route index element={<Navigate to="/admin/dashboard"/>}/>
                                    <Route path="dashboard" element={<NavigateToResource resource={"accounts"}/>}/>

                                    <Route path="accounts">
                                        <Route index element={<AccountsList/>}/>
                                        <Route path="create" element={<AccountsCreate/>}/>
                                        <Route path="edit/:id" element={<AccountsEdit/>}/>
                                        <Route path="show/:id" element={<AccountsShow/>}/>
                                    </Route>

                                    <Route path="project-categories">
                                        <Route index element={<ProjectCategoriesList/>}/>
                                        <Route path="create" element={<ProjectCategoriesCreate/>}/>
                                        <Route path="edit/:id" element={<ProjectCategoriesEdit/>}/>
                                        <Route path="show/:id" element={<ProjectCategoriesShow/>}/>
                                    </Route>

                                    <Route path="projects">
                                        <Route index element={<ProjectsList/>}/>
                                        <Route path="create" element={<ProjectsCreate/>}/>
                                        <Route path="edit/:id" element={<ProjectsEdit/>}/>
                                        <Route path="show/:id" element={<ProjectsShow/>}/>
                                    </Route>

                                    <Route path="skills">
                                        <Route index element={<SkillsList/>}/>
                                        <Route path="create" element={<SkillsCreate/>}/>
                                        <Route path="edit/:id" element={<SkillsEdit/>}/>
                                        <Route path="show/:id" element={<SkillsShow/>}/>
                                    </Route>

                                    <Route path="transactions">
                                        <Route index element={<TransactionsList/>}/>
                                        <Route path="create" element={<TransactionsCreate/>}/>
                                        <Route path="edit/:id" element={<TransactionsEdit/>}/>
                                        <Route path="show/:id" element={<TransactionsShow/>}/>
                                    </Route>
                                </Route>

                                {/* Client Routes */}
                                <Route
                                    path="client"
                                    element={
                                        <Authenticated fallback={<Navigate to="/login"/>} key={"authenticated-inner"}>
                                            <ClientLayout/>
                                        </Authenticated>
                                    }
                                >
                                    <Route index element={<Navigate to="/client/dashboard"/>}/>
                                    <Route path="dashboard" element={<ClientDashboard/>}/>
                                    <Route path="projects" element={<ClientList/>}/>
                                    <Route path="proposals" element={<ClientProposalList/>}/>
                                    <Route path="messages" element={<ClientMessageList/>}/>
                                    <Route path="settings" element={<ClientSettings/>}/>
                                    <Route path="transactions" element={<ClientTransactionList/>}/>
                                </Route>

                                {/* Freelancer Routes */}
                                <Route
                                    path="freelancer"
                                    element={
                                        <Authenticated fallback={<Navigate to="/login"/>} key={"authenticated-inner"}>
                                            <FreelancerLayout/>
                                        </Authenticated>
                                    }
                                >
                                    <Route index element={<Navigate to="/freelancer/dashboard"/>}/>
                                    <Route path="dashboard" element={<FreelancerDashboardPage/>}/>
                                    <Route path="find-projects" element={<FreelancerFindProjectPage/>}/>
                                    <Route path="my-proposals" element={<FreelancerMyProposalPage/>}/>
                                    <Route path="active-projects" element={<FreelancerActiveProject/>}/>
                                    <Route path="messages" element={<FreeLancerMessagePage/>}/>
                                    <Route path="settings" element={<FreeLancerSettings/>}/>
                                </Route>

                                <Route path="*" element={<ErrorComponent/>}/>
                            </Routes>

                            <RefineKbar/>
                            <UnsavedChangesNotifier/>
                            <DocumentTitleHandler/>
                        </Refine>
                        <DevtoolsPanel/>
                    </DevtoolsProvider>
                </ColorModeContextProvider>
                </AntdApp>
            </RefineKbarProvider>
        </BrowserRouter>
    );
}

export default App;