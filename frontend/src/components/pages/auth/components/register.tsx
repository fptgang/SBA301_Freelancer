import React, { useState } from "react";
import {
  type RegisterPageProps,
  type RegisterFormTypes,
  useRouterType,
  useLink,
  useActiveAuthProvider,
  useTranslate,
  useRouterContext,
  useRegister,
} from "@refinedev/core";
import { ThemedTitleV2 } from "@refinedev/antd";
import {
  layoutStyles,
  containerStyles,
  titleStyles,
  headStyles,
  bodyStyles,
} from "./styles";
import {
  Row,
  Col,
  Layout,
  Card,
  Typography,
  Checkbox,
  Form,
  Input,
  Button,
  type LayoutProps,
  type CardProps,
  type FormProps,
  Divider,
  theme,
  Select,
} from "antd";
import { Option } from "antd/es/mentions";
import {
  AppleOutlined,
  GoogleOutlined,
  LaptopOutlined,
  UserOutlined,
} from "@ant-design/icons";

type RegisterProps = RegisterPageProps<LayoutProps, CardProps, FormProps>;
/**
 * **refine** has register.yml page form which is served on `/register.yml` route when the `authProvider` configuration is provided.
 *
 * @see {@link https://refine.dev/docs/ui-frameworks/antd/components/antd-auth-page/#register} for more details.
 */
export const RegisterPage: React.FC<RegisterProps> = ({
  providers,
  loginLink,
  wrapperProps,
  contentProps,
  renderContent,
  formProps,
  title,
  hideForm,
  mutationVariables,
}) => {
  const { Title, Text } = Typography;
  const { token } = theme.useToken();
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm<RegisterFormTypes>();
  const translate = useTranslate();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();

  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const authProvider = useActiveAuthProvider();
  const { mutate: register, isLoading } = useRegister<RegisterFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  const [role, setRole] = useState<string | null>(null);
  const RadioCircle = ({ selected }: { selected: boolean }) => (
    <div
      className="w-6 h-6 border-2 rounded-full flex items-center justify-center"
      style={{ borderColor: "rgb(189,189,188)" }}
    >
      <div
        className={`w-3 h-3 border-2 rounded-full ${
          selected ? "border-green-700 bg-green-700" : "border-white"
        }`}
      />
    </div>
  );
  const getButtonText = () => {
    if (role === "CLIENT") return "Join as a Client";
    if (role === "FREELANCER") return "Apply as a Freelancer";
    return "Create Account";
  };
  const PageTitle =
    title === false ? null : (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "32px",
          fontSize: "20px",
        }}
      >
        {title ?? <ThemedTitleV2 collapsed={false} />}
      </div>
    );

  const CardTitle = (
    <Typography.Title
      level={3}
      style={{
        color: token.colorPrimaryTextHover,
        ...titleStyles,
      }}
    >
      {translate("pages.register.yml.title", "Sign up for your account")}
    </Typography.Title>
  );

  const onBoarding = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Title
          level={2}
          style={{
            color: "black",
            textAlign: "center",
            lineHeight: "37px",
            fontFamily: "Neue Montreal, sans-serif",
            fontWeight: "500",
            fontSize: "34px",
            marginBottom: "30px",
          }}
        >
          Join as a client or freelancer
        </Title>
        <div className="flex gap-6 mb-6">
          <Card
            hoverable
            onClick={() => setRole("CLIENT")}
            className={`w-72 p-2 border border-black bg-white ${
              role === "CLIENT" ? "border-blue-500" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <UserOutlined style={{ fontSize: "2rem", color: "black" }} />
              <RadioCircle selected={role === "CLIENT"} />
            </div>
            <Text className="block text-lg font-medium text-black">
              I'm a client, hiring for a project
            </Text>
          </Card>

          <Card
            hoverable
            onClick={() => setRole("FREELANCER")}
            className={`w-72 p-2 border border-black bg-white ${
              role === "FREELANCER" ? "border-blue-500" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <LaptopOutlined style={{ fontSize: "2rem", color: "black" }} />
              <RadioCircle selected={role === "FREELANCER"} />
            </div>
            <Text className="block text-lg font-medium text-black">
              I'm a freelancer, looking for work
            </Text>
          </Card>
        </div>
        <Button
          type="primary"
          size="large"
          disabled={!role}
          className="mt-4"
          style={{
            color:
              role === "FREELANCER" || role === "CLIENT" ? "#fff" : "#A4A5B4",
            backgroundColor:
              role === "FREELANCER" || role === "CLIENT"
                ? "#108B01"
                : "#E8E8E9",
            border: "none",
          }}
          onClick={() => setShowForm(true)}
        >
          {getButtonText()}
        </Button>
        <Text
          className="text-black mt-4"
          style={{
            lineHeight: "24px",
            fontFamily: "Neue Montreal, sans-serif",
            fontSize: "16px",
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{ textDecoration: "underline", color: "green" }}
          >
            Log In
          </a>
        </Text>
      </div>
    );
  };

  const renderProviders = () => {
    if (providers && providers.length > 0) {
      return (
        <>
          {providers.map((provider) => {
            return (
              <Button
                key={provider.name}
                type="default"
                block
                icon={provider.icon}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  marginBottom: "8px",
                }}
                onClick={() =>
                  register({
                    ...mutationVariables,
                    providerName: provider.name,
                  })
                }
              >
                {provider.label}
              </Button>
            );
          })}
          {!hideForm && (
            <Divider>
              <Typography.Text
                style={{
                  color: token.colorTextLabel,
                }}
              >
                {translate(
                  "pages.register.yml.divider",
                  translate("pages.login.divider", "or")
                )}
              </Typography.Text>
            </Divider>
          )}
        </>
      );
    }
    return null;
  };

  const CardContent = (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Title
        level={2}
        style={{
          color: "black",
          textAlign: "center",
          lineHeight: "37px",
          fontFamily: "Neue Montreal, sans-serif",
          fontWeight: "500",
          fontSize: "34px",
          marginBottom: "30px",
        }}
      >
        Sign up to find work you love
      </Title>
      <div className="flex gap-4 mb-6">
        <Button
          className="flex items-center px-4 py-2 border border-black rounded-lg hover:bg-gray-200"
          icon={<AppleOutlined />}
          style={{
            color: "black",
            backgroundColor: "white",
            fontSize: "16px",
            height: "40px",
            transition: "background-color 0.3s",
          }}
        >
          Continue with Apple
        </Button>
        <Button
          className="flex items-center px-4 py-2 rounded-lg hover:bg-blue-600"
          icon={<GoogleOutlined />}
          style={{
            color: "white",
            backgroundColor: "#4285F4",
            fontSize: "16px",
            height: "40px",
            transition: "background-color 0.3s",
          }}
        >
          Continue with Google
        </Button>
      </div>
      <div className="flex items-center w-full max-w-md">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="mx-4 text-black">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
      <Form<RegisterFormTypes>
        layout="vertical"
        form={form}
        onFinish={(values) => register({ ...mutationVariables, ...values })}
        requiredMark={false}
        {...formProps}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={["firstName"]}
              label={translate("pages.register.yml.firstName", "First Name")}
              rules={[
                {
                  required: true,
                  message: translate(
                    "pages.register.yml.errors.requiredFirstName",
                    "First name is required"
                  ),
                },
              ]}
            >
              <Input size="large" placeholder="John" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={["lastName"]}
              label={translate("pages.register.yml.lastName", "Last Name")}
              rules={[
                {
                  required: true,
                  message: translate(
                    "pages.register.yml.errors.requiredLastName",
                    "Last Name name is required"
                  ),
                },
              ]}
            >
              <Input size="large" placeholder="Doe" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="email"
          label={translate("pages.register.yml.email", "Email")}
          rules={[
            {
              required: true,
              message: translate(
                "pages.register.yml.errors.requiredEmail",
                "Email is required"
              ),
            },
            {
              type: "email",
              message: translate(
                "pages.register.yml.errors.validEmail",
                "Invalid email address"
              ),
            },
          ]}
        >
          <Input
            size="large"
            placeholder={translate("pages.register.yml.fields.email", "Email")}
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={translate("pages.register.yml.fields.password", "Password")}
          rules={[
            {
              required: true,
              message: translate(
                "pages.register.yml.errors.requiredPassword",
                "Password is required"
              ),
            },
          ]}
        >
          <Input type="password" placeholder="●●●●●●●●" size="large" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={translate(
            "pages.register.yml.fields.confirmPassword",
            "Confirm Password"
          )}
          rules={[
            {
              required: true,
              message: translate(
                "pages.register.yml.errors.requiredConfirmPassword",
                "Confirm Password is required"
              ),
            },
          ]}
        >
          <Input type="password" placeholder="●●●●●●●●" size="large" />
        </Form.Item>
        <Form.Item
          label={
            <span
              style={{
                
                fontSize: "16px",
                fontWeight: "400",
              }}
            >
              Role
            </span>
          }
          labelCol={{ span: 24 }}
          style={{ marginBottom: "16px" }}
        >
          <Select style={{ backgroundColor: "white" }}
          value={role} 
          onChange={(value) => setRole(value)} 
          > 
            <Option value="FREELANCER">FREELANCER</Option>
            <Option value="CLIENT">CLIENT</Option>
          </Select>
        </Form.Item>
        <Form.Item className="flex justify-center">
          <Button
            type="primary"
            size="large"
            disabled={!role}
            className="mt-4"
            style={{
              color: "#fff",
              backgroundColor: "#108B01",
              border: "none",
            }}
          >
            Create my Account
          </Button>
        </Form.Item>
      </Form>
      <Text
        className="text-black mt-2"
        style={{
          lineHeight: "24px",
          fontFamily: "Neue Montreal, sans-serif",
          fontSize: "16px",
        }}
      >
        Already have an account?{" "}
        <ActiveLink
          to="/login"
          style={{
            textDecoration: "underline",
            color: "green",
          }}
        >
          Log in
        </ActiveLink>
      </Text>
    </div>
  );

  return (
    <Layout style={layoutStyles} {...(wrapperProps ?? {})}>
      <Row
        justify="center"
        align={hideForm ? "top" : "middle"}
        style={{
          padding: "16px 0",
          minHeight: "100dvh",
          paddingTop: hideForm ? "15dvh" : "16px",
        }}
      >
        <Col xs={22}>
          {!showForm ? (
            onBoarding()
          ) : renderContent ? (
            renderContent(CardContent, PageTitle)
          ) : (
            <>
              {PageTitle}
              {CardContent}
            </>
          )}
        </Col>
      </Row>
    </Layout>
  );
};
