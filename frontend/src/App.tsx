// src/App.tsx
import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  ThemedLayoutContext,
  ThemedLayoutV2,
  ThemedSiderV2,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import {
  AppstoreOutlined,
  DashboardOutlined,
  DollarCircleOutlined,
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
  AccountsShow,
  AccountsCreate,
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
import { TransactionsList, TransactionsShow } from "./pages/admin/transactions";
import AdminDashboard from "./pages/admin/dashboard";

// Client Pages
import ClientDashboard from "./pages/client/dashboard";
import ClientProposalList from "./pages/client/proposal/client-list";
import ClientMessageList from "./pages/client/mesages/client-list";
import ClientSettings from "./pages/client/setting";

// Freelancer Pages
import FreelancerDashboardPage from "./pages/freelancer/dashboard/dashboard";
import FreelancerMyProposalPage from "./pages/freelancer/proposal/my-proposal";
import FreelancerActiveProject from "./pages/freelancer/active-projects/active-project";
import FreeLancerMessagePage from "./pages/freelancer/messages/message";
import FreeLancerSettings from "./pages/freelancer/setting/setting";

import Pricing from "./pages/public/pricing";

// Providers and Config
import { dataProvider } from "./providers/data-provider";
import { notificationProvider } from "./providers/notification-provider";
import { accessControlProvider } from "./providers/access-control-provider";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import axiosConfig from "./services/api/axios-config";
import { authProvider } from "./services/auth/authProvider";
import { API_URL } from "./utils/constants";
import PublicLayout from "./layouts/public-layout";
import AdminLayout from "./layouts/admin-layout";
import ClientLayout from "./layouts/client-layout";
import FreelancerLayout from "./layouts/freelancer-layout";
import ClientList from "./pages/client/projects/client-list";
import { ForgotPassword } from "./pages/auth/forgotPassword";
import LandingPage from "./pages/public/landing/landing-page";
import { Login } from "./pages/auth/login";
import { Register } from "./pages/auth/register";
import ResetPassword from "./pages/auth/reset-password";
import ClientTransactionList from "./pages/client/transactions/client-list";
import {
  ProjectCategoriesCreate,
  ProjectCategoriesEdit,
  ProjectCategoriesList,
  ProjectCategoriesShow,
} from "./pages/admin/projectcategories";
import { ColorModeContextProvider } from "./contexts/color-mode";
import FreelancerProfilePage from "./pages/freelancer/profile";
import SearchPage from "./pages/public/search";
import ChatPage from "./pages/shared/chat";
import SettingPage from "./pages/shared/setting";
import FreelancerProposalShow from "./pages/freelancer/proposal/show";
import { liveProvider } from "./providers/live-provider";
import SettingsLayout from "./layouts/settings-layout";
import AccountSettingsPage from "./pages/shared/setting/account";
import SecuritySettingsPage from "./pages/shared/setting/security";
import LocalSettingsPage from "./pages/shared/setting/local";
import WalletPage from "./pages/shared/wallet";
import WalletLayout from "./layouts/wallet-layout";
import DepositPage from "./pages/shared/wallet/deposit";
import WithdrawPage from "./pages/shared/wallet/withdraw";
import { Message } from "./pages/public/message";
import MessageLayout from "./layouts/message-layout";
import { ReportsList, ReportsShow } from "./pages/admin/reports";
import { stompClient } from "./utils";
import VNPayReturnHandler from "./pages/shared/payment/VNPayReturnHandler";
import ProjectDetail from "./pages/shared/projects/detail";

const resources = [
  {
    name: "dashboard",
    list: "/admin/dashboard",
    meta: {
      label: "Dashboard",
      icon: <DashboardOutlined />,
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
      icon: <UserOutlined />,
    },
  },
  {
    name: "project-categories",
    list: "/admin/project-categories",
    create: "/admin/project-categories/create",
    edit: "/admin/project-categories/edit/:id",
    show: "/admin/project-categories/show/:id",
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
      icon: <DollarCircleOutlined />,
    },
  },
  {
    name: "reports",
    list: "/admin/reports",
    // edit: "/admin/reports/edit/:id",
    show: "/admin/reports/show/:id",
    meta: {
      label: "Reports",
      icon: <FileTextOutlined />,
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
                // accessControlProvider={accessControlProvider}
                routerProvider={routerBindings}
                resources={resources}
                liveProvider={liveProvider(stompClient)}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  mutationMode: "optimistic",
                  liveMode: "off",
                  title: {
                    icon: (
                      <img
                        src="https://raw.githubusercontent.com/fptgang/SBA301_Freelancer/c7c1c58ae260583a6b506cc70000b8c2749e6c16/images/icon.svg"
                        alt="logo"
                      />
                    ),
                    text: "Hirable Admin",
                  },
                }}
              >
                <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicLayout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="projects/:id" element={<ProjectDetail />} />
                  </Route>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route
                    element={
                      <Authenticated
                        fallback={<Navigate to="/login" />}
                        key={"authenticated-inner"}
                      >
                        <MessageLayout />
                      </Authenticated>
                    }
                  >
                    <Route path="message" element={<Message />} />
                    <Route
                      path="payment/vnpay/return"
                      element={<VNPayReturnHandler />}
                    />
                  </Route>

                  {/* Admin Routes */}
                  <Route
                    path="admin"
                    element={
                      <Authenticated
                        fallback={<Navigate to="/login" />}
                        key={"authenticated-inner"}
                      >
                        <AdminLayout />
                      </Authenticated>
                    }
                  >
                    <Route index element={<Navigate to="/admin/dashboard" />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="accounts">
                      <Route index element={<AccountsList />} />
                      <Route path="create" element={<AccountsCreate />} />
                      <Route path="edit/:id" element={<AccountsEdit />} />
                      <Route path="show/:id" element={<AccountsShow />} />
                    </Route>

                    <Route path="project-categories">
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

                    <Route path="projects">
                      <Route index element={<ProjectsList />} />
                      <Route path="create" element={<ProjectsCreate />} />
                      <Route path="edit/:id" element={<ProjectsEdit />} />
                      <Route path="show/:id" element={<ProjectsShow />} />
                    </Route>

                    <Route path="skills">
                      <Route index element={<SkillsList />} />
                      <Route path="create" element={<SkillsCreate />} />
                      <Route path="edit/:id" element={<SkillsEdit />} />
                      <Route path="show/:id" element={<SkillsShow />} />
                    </Route>

                    <Route path="transactions">
                      <Route index element={<TransactionsList />} />
                      <Route path="show/:id" element={<TransactionsShow />} />
                    </Route>

                    <Route path="reports">
                      <Route index element={<ReportsList />} />
                      {/* <Route path="edit/:id" element={<ReportsEdit />} /> */}
                      <Route path="show/:id" element={<ReportsShow />} />
                    </Route>
                  </Route>

                  {/* Client Routes */}
                  <Route path="client" element={<ClientLayout />}>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<ClientDashboard />} />
                    <Route path="projects">
                      <Route index element={<ClientList />} />
                      <Route path=":id" element={<ProjectDetail />} />
                    </Route>
                    <Route path="chat" element={<ChatPage />} />
                  </Route>

                  {/* Freelancer Routes */}
                  <Route path="freelancer" element={<FreelancerLayout />}>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route
                      path="dashboard"
                      element={<FreelancerDashboardPage />}
                    />
                    <Route path="projects">
                      <Route index element={<FreelancerActiveProject />} />
                      <Route path=":id" element={<ProjectDetail />} />
                    </Route>

                    <Route path="proposals">
                      <Route index element={<FreelancerMyProposalPage />} />
                      <Route path=":id" element={<FreelancerProposalShow />} />
                    </Route>

                    <Route path="profile" element={<FreelancerProfilePage />} />

                    <Route path="chat" element={<ChatPage />} />
                  </Route>

                  <Route path="settings" element={<SettingsLayout />}>
                    <Route index element={<Navigate to="account" />} />
                    <Route path="account" element={<AccountSettingsPage />} />
                    <Route path="security" element={<SecuritySettingsPage />} />
                    <Route path="local" element={<LocalSettingsPage />} />
                  </Route>

                  <Route path="wallet" element={<WalletLayout />}>
                    <Route index element={<WalletPage />} />
                    <Route path="deposit" element={<DepositPage />} />
                    <Route path="withdraw" element={<WithdrawPage />} />
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler
                  handler={({ action, params, resource }) => {
                    const id = params?.id ?? "";

                    const actionPrefixMatcher = {
                      create: "Create new ",
                      clone: `#${id} Clone ${resource?.meta?.label}`,
                      edit: `#${id} Edit ${resource?.meta?.label}`,
                      show: `#${id} Show ${resource?.meta?.label}`,
                      list: `${resource?.meta?.label}`,
                    };

                    const suffix = "Hirable";
                    const title =
                      actionPrefixMatcher[action || "list"] +
                      (actionPrefixMatcher[action || "list"].length > 0
                        ? " | "
                        : "") +
                      suffix;

                    return title;
                  }}
                />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </ColorModeContextProvider>
        </AntdApp>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
