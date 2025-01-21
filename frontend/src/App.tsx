import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { ErrorComponent, ThemedLayoutV2, ThemedSiderV2 } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { authProvider } from "./authProvider";
import { AppIcon } from "./components/app-icon";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";

import { ForgotPassword } from "./pages/auth/forgotPassword";
import { Login } from "./pages/auth/login";
import { Register } from "./pages/auth/register";
import { accessControlProvider } from "./providers/access-control-provider";
import { dataProvider } from "./providers/data-provider";
import { API_URL } from "./utils/constants";
import LandingPage from "./pages/landing/landing-page";
import About from "./pages/about/About";
import ClientLayout from "./components/layout";
import NavBar from "./pages/landing/nav-bar";
import Profile from "./pages/profile/profile";
import Footer from "./components/common/footer/footer";

import {
  ProjectCategoriesCreate,
  ProjectCategoriesEdit,
  ProjectCategoriesList,
  ProjectCategoriesShow,
} from "./pages/admin/projectcategories";
import {
  UsersCreate,
  AccountsEdit,
  AccountsList,
  AccountsShow,
} from "./pages/admin/accounts";
import ResetPassword from "./pages/auth/reset-password";
import { notificationProvider } from "./providers/notification-provider";
import axiosInstance from "./config/axios-config";
import {
  ProjectsCreate,
  ProjectsEdit,
  ProjectsList,
  ProjectsShow,
} from "./pages/admin/projects";
import {
  SkillsCreate,
  SkillsEdit,
  SkillsList,
  SkillsShow,
} from "./pages/admin/skills";
import {
  ProfilesCreate,
  ProfilesEdit,
  ProfilesList,
  ProfilesShow,
} from "./pages/admin/profiles";
import {
  ProposalsCreate,
  ProposalsEdit,
  ProposalsList,
  ProposalsShow,
} from "./pages/admin/proposals";
import {
  TransactionsCreate,
  TransactionsEdit,
  TransactionsList,
  TransactionsShow,
} from "./pages/admin/transactions";
import {
  AppstoreOutlined,
  DollarCircleFilled,
  FileTextOutlined,
  IdcardOutlined,
  MoneyCollectFilled,
  ProjectOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider(API_URL, axiosInstance)}
                notificationProvider={notificationProvider}
                // accessControlProvider={accessControlProvider}
                authProvider={authProvider}
                routerProvider={routerBindings}
                resources={[
                  {
                    name: "accounts",
                    list: "/admin/accounts",
                    create: "/admin/accounts/create",
                    edit: "/admin/accounts/edit/:id",
                    show: "/admin/accounts/show/:id",
                    meta: {
                      label: "Accounts",
                      canDelete: true,
                      icon: <UserOutlined />,
                    },
                  },
                  {
                    name: "projectCategories",
                    list: "/admin/projectCategories",
                    create: "/admin/projectCategories/create",
                    edit: "/admin/projectCategories/edit/:id",
                    show: "/admin/projectCategories/show/:id",
                    meta: {
                      label: "Project Categories",
                      canDelete: true,
                      icon: <AppstoreOutlined />,
                    },
                  },
                  {
                    name: "projects",
                    list: "/admin/projects",
                    create: "/admin/projects/create",
                    edit: "/admin/projects/edit/:id",
                    show: "/admin/projects/show/:id",
                    meta: {
                      icon: <ProjectOutlined />,
                    },
                  },
                  {
                    name: "profiles",
                    list: "/admin/profiles",
                    create: "/admin/profiles/create",
                    edit: "/admin/profiles/edit/:id",
                    show: "/admin/profiles/show/:id",
                    meta: {
                      hide: true,
                      icon: <IdcardOutlined />,
                    },
                  },
                  {
                    name: "proposals",
                    list: "/admin/proposals",
                    create: "/admin/proposals/create",
                    edit: "/admin/proposals/edit/:id",
                    show: "/admin/proposals/show/:id",
                    meta: {
                      hide: true,
                      icon: <FileTextOutlined />,
                    },
                  },
                  {
                    name: "skills",
                    list: "/admin/skills",
                    create: "/admin/skills/create",
                    edit: "/admin/skills/edit/:id",
                    show: "/admin/skills/show/:id",
                    meta: {
                      icon: <ToolOutlined />,
                    },
                  },
                  {
                    name: "transactions",
                    list: "/admin/transactions",
                    create: "/admin/transactions/create",
                    edit: "/admin/transactions/edit/:id",
                    show: "/admin/transactions/show/:id",
                    meta: {
                      icon: <DollarCircleFilled />,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  title: { text: "Hireable", icon: <AppIcon /> },
                }}
              >
                <Routes>
                  <Route
                    element={
                      <ClientLayout
                        HeaderContent={NavBar}
                        InnerContent={() => <Outlet />}
                        FooterContent={() => <Footer />}
                      />
                    }
                  >
                    <Route index element={<LandingPage />} />
                    <Route
                      path="/settings"
                      element={<Navigate to="/admin" />}
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    path="/admin"
                    element={
                      localStorage.getItem("role") === "ADMIN" ? (
                        <Authenticated
                          key="authenticated-inner"
                          fallback={<Navigate to={"/"} replace />}
                        >
                          <ThemedLayoutV2
                            Header={Header}
                            Sider={(props) => (
                              <ThemedSiderV2 {...props} fixed />
                            )}
                          >
                            <Outlet />
                          </ThemedLayoutV2>
                        </Authenticated>
                      ) : (
                        <Navigate to="/" />
                      )
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="accounts" />}
                    />
                    <Route path="accounts">
                      <Route index element={<AccountsList />} />
                      <Route path="create" element={<UsersCreate />} />
                      <Route path="edit/:id" element={<AccountsEdit />} />
                      <Route path="show/:id" element={<AccountsShow />} />
                    </Route>
                    <Route path="projects">
                      <Route index element={<ProjectsList />} />
                      <Route path="create" element={<ProjectsCreate />} />
                      <Route path="edit/:id" element={<ProjectsEdit />} />
                      <Route path="show/:id" element={<ProjectsShow />} />
                    </Route>
                    <Route path="projectCategories">
                      <Route index element={<ProjectCategoriesList />} />
                      <Route
                        path="create"
                        element={<ProjectCategoriesCreate />}
                      />
                      <Route
                        path="edit/:id"
                        element={<ProjectCategoriesEdit />}
                      />
                      <Route
                        path="show/:id"
                        element={<ProjectCategoriesShow />}
                      />
                    </Route>
                    <Route path="profiles">
                      <Route index element={<ProfilesList />} />
                      <Route path="create" element={<ProfilesCreate />} />
                      <Route path="edit/:id" element={<ProfilesEdit />} />
                      <Route path="show/:id" element={<ProfilesShow />} />
                    </Route>
                    <Route path="skills">
                      <Route index element={<SkillsList />} />
                      <Route path="create" element={<SkillsCreate />} />
                      <Route path="edit/:id" element={<SkillsEdit />} />
                      <Route path="show/:id" element={<SkillsShow />} />
                    </Route>
                    <Route path="transactions">
                      <Route index element={<TransactionsList />} />
                      <Route path="create" element={<TransactionsCreate />} />
                      <Route path="edit/:id" element={<TransactionsEdit />} />
                      <Route path="show/:id" element={<TransactionsShow />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        {localStorage.getItem("role") === "ADMIN" ? (
                          <NavigateToResource />
                        ) : (
                          <Navigate to="/" />
                        )}
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
