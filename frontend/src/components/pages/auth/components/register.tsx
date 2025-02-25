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
  Row,
  Col,
  Layout,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Select,
  Steps,
  Divider,
  theme,
  message,
} from "antd";
import {
  AppleOutlined,
  GoogleOutlined,
  LaptopOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

type RegisterProps = RegisterPageProps<any, any, any>;

// Define the steps for our multi-step form
const steps = [
  {
    title: 'Role Selection',
    icon: <UserOutlined />,
  },
  {
    title: 'Personal Info',
    icon: <UserOutlined />,
  },
  {
    title: 'Account Setup',
    icon: <MailOutlined />,
  },
  {
    title: 'Confirmation',
    icon: <CheckCircleOutlined />,
  },
];

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
  const { token } = theme.useToken();
  const [form] = Form.useForm<RegisterFormTypes>();
  const translate = useTranslate();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [roleSelected, setRoleSelected] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormTypes>({});
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const authProvider = useActiveAuthProvider();
  const { mutate: register, isLoading } = useRegister<RegisterFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  // Handle form submission for each step
  const handleNext = async () => {
    try {
      // Validate fields in the current step
      if (currentStep === 0) {
        if (!roleSelected) {
          message.error('Please select a role to continue');
          return;
        }
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 1) {
        await form.validateFields(['firstName', 'lastName']);
        const values = form.getFieldsValue(['firstName', 'lastName']);
        setFormData({ ...formData, ...values });
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 2) {
        await form.validateFields(['email', 'password', 'confirmPassword']);
        const values = form.getFieldsValue(['email', 'password', 'confirmPassword']);
        setFormData({ ...formData, ...values, role: roleSelected });
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 3) {
        // Submit the form
        const completeFormData = { ...formData, role: roleSelected };
        register({ 
          ...mutationVariables, 
          ...completeFormData 
        }, {
          onSuccess: () => {
            setRegistrationComplete(true);
          },
          onError: () => {
            message.error('Registration failed. Please try again.');
            setCurrentStep(0);
          }
        });
      }
    } catch (error) {
      // Form validation error
      console.error('Validation error:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Custom radio button styled component
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
    if (currentStep === steps.length - 1) return "Complete Registration";
    return "Continue";
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center">
            <Title
              level={3}
              style={{
                color: "black",
                textAlign: "center",
                lineHeight: "37px",
                fontFamily: "inherit",
                fontWeight: "500",
                marginBottom: "30px",
              }}
            >
              Join as a client or freelancer
            </Title>
            <div className="flex gap-6 mb-6">
              <Card
                hoverable
                onClick={() => setRoleSelected("CLIENT")}
                className={`w-72 p-2 border ${
                  roleSelected === "CLIENT" ? "border-blue-500" : "border-black"
                } bg-white`}
              >
                <div className="flex justify-between items-center mb-2">
                  <UserOutlined style={{ fontSize: "2rem", color: "black" }} />
                  <RadioCircle selected={roleSelected === "CLIENT"} />
                </div>
                <Text className="block text-lg font-medium text-black">
                  I'm a client, hiring for a project
                </Text>
              </Card>

              <Card
                hoverable
                onClick={() => setRoleSelected("FREELANCER")}
                className={`w-72 p-2 border ${
                  roleSelected === "FREELANCER" ? "border-blue-500" : "border-black"
                } bg-white`}
              >
                <div className="flex justify-between items-center mb-2">
                  <LaptopOutlined style={{ fontSize: "2rem", color: "black" }} />
                  <RadioCircle selected={roleSelected === "FREELANCER"} />
                </div>
                <Text className="block text-lg font-medium text-black">
                  I'm a freelancer, looking for work
                </Text>
              </Card>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="w-full max-w-xl">
            <Title
              level={3}
              style={{
                color: "black",
                textAlign: "center",
                lineHeight: "37px",
                fontFamily: "inherit",
                fontWeight: "500",
                marginBottom: "30px",
              }}
            >
              Tell us about yourself
            </Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label={translate("pages.register.firstName", "First Name")}
                  rules={[
                    {
                      required: true,
                      message: translate(
                        "pages.register.errors.requiredFirstName",
                        "First name is required"
                      ),
                    },
                  ]}
                >
                  <Input size="large" placeholder="John" prefix={<UserOutlined style={{ color: token.colorTextSecondary }} />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label={translate("pages.register.lastName", "Last Name")}
                  rules={[
                    {
                      required: true,
                      message: translate(
                        "pages.register.errors.requiredLastName",
                        "Last name is required"
                      ),
                    },
                  ]}
                >
                  <Input size="large" placeholder="Doe" prefix={<UserOutlined style={{ color: token.colorTextSecondary }} />} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
      case 2:
        return (
          <div className="w-full max-w-xl">
            <Title
              level={3}
              style={{
                color: "black",
                textAlign: "center",
                lineHeight: "37px",
                fontFamily: "inherit",
                fontWeight: "500",
                marginBottom: "30px",
              }}
            >
              Set up your account
            </Title>
            
            <Form.Item
              name="email"
              label={translate("pages.register.email", "Email")}
              rules={[
                {
                  required: true,
                  message: translate(
                    "pages.register.errors.requiredEmail",
                    "Email is required"
                  ),
                },
                {
                  type: "email",
                  message: translate(
                    "pages.register.errors.validEmail",
                    "Invalid email address"
                  ),
                },
              ]}
            >
              <Input 
                size="large" 
                placeholder={translate("pages.register.fields.email", "Email")} 
                prefix={<MailOutlined style={{ color: token.colorTextSecondary }} />}
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              label={translate("pages.register.fields.password", "Password")}
              rules={[
                {
                  required: true,
                  message: translate(
                    "pages.register.errors.requiredPassword",
                    "Password is required"
                  ),
                },
                {
                  min: 8,
                  message: translate(
                    "pages.register.errors.passwordLength",
                    "Password must be at least 8 characters"
                  )
                }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
                size="large" 
                placeholder="●●●●●●●●" 
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label={translate(
                "pages.register.fields.confirmPassword",
                "Confirm Password"
              )}
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: translate(
                    "pages.register.errors.requiredConfirmPassword",
                    "Please confirm your password"
                  ),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        translate(
                          "pages.register.errors.passwordsDoNotMatch",
                          "The passwords do not match"
                        )
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
                size="large" 
                placeholder="●●●●●●●●" 
              />
            </Form.Item>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-xl text-center">
            <CheckCircleOutlined style={{ fontSize: '72px', color: '#52c41a', marginBottom: '24px' }} />
            
            <Title
              level={3}
              style={{
                color: "black",
                textAlign: "center",
                lineHeight: "37px",
                fontFamily: "inherit",
                fontWeight: "500",
                marginBottom: "16px",
              }}
            >
              {registrationComplete ? 'Registration Complete!' : 'Review Your Information'}
            </Title>
            
            {registrationComplete ? (
              <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                Your account has been created successfully. You can now log in.
              </Paragraph>
            ) : (
              <>
                <div className="text-left p-6 bg-gray-50 rounded-lg mb-6">
                  <Row className="mb-3">
                    <Col span={8} className="font-medium">Role:</Col>
                    <Col span={16}>{roleSelected}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col span={8} className="font-medium">Name:</Col>
                    <Col span={16}>{formData.firstName} {formData.lastName}</Col>
                  </Row>
                  <Row>
                    <Col span={8} className="font-medium">Email:</Col>
                    <Col span={16}>{formData.email}</Col>
                  </Row>
                </div>
                <Paragraph style={{ fontSize: '14px', marginBottom: '24px' }}>
                  Click the Complete Registration button to create your account
                </Paragraph>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  
  // Renderig social login buttons
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
                  "pages.register.divider",
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

  // Social login buttons for Step 0
  const renderSocialButtons = () => {
    return (
      <div className="flex gap-4 mb-6 mt-4 justify-center">
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
    );
  };

  // Common page elements
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

  const mainContent = (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {/* Steps indicator */}
      <div className="w-full max-w-xl mb-8">
        <Steps 
          current={currentStep} 
          items={steps.map((step, index) => ({
            title: step.title,
            icon: step.icon,
            disabled: registrationComplete && index < steps.length - 1,
          }))}
        />
      </div>
      
      {/* Form */}
      <Form<RegisterFormTypes>
        layout="vertical"
        form={form}
        initialValues={{ ...formData }}
        requiredMark={false}
        {...formProps}
        className="w-full flex flex-col items-center"
      >
        {renderStepContent()}
        
        {currentStep === 0 && (
          <>
            <div className="flex items-center w-full max-w-xl mt-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="mx-4 text-black">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            {renderSocialButtons()}
          </>
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between w-full max-w-xl mt-6">
          {currentStep > 0 && !registrationComplete && (
            <Button onClick={handlePrev} style={{ marginRight: 8 }}>
              Back
            </Button>
          )}
          <div className="flex-1"></div>
          {!registrationComplete && (
            <Button
              type="primary"
              onClick={handleNext}
              loading={isLoading && currentStep === steps.length - 1}
              style={{
                color: roleSelected || currentStep > 0 ? "#fff" : "#A4A5B4",
                backgroundColor: roleSelected || currentStep > 0 ? "#108B01" : "#E8E8E9",
                border: "none",
              }}
              disabled={currentStep === 0 && !roleSelected}
            >
              {getButtonText()}
            </Button>
          )}
          {registrationComplete && (
            <Button
              type="primary"
              style={{ backgroundColor: "#108B01", border: "none" }}
              onClick={() => window.location.href = "/login"}
            >
              Go to Login
            </Button>
          )}
        </div>
      </Form>
      
      {/* Login link */}
      <Text
        className="text-black mt-6"
        style={{
          lineHeight: "24px",
          fontFamily: "inherit",
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
    <Layout style={{ minHeight: "100vh" }} {...(wrapperProps ?? {})}>
      <Row
        justify="center"
        align={hideForm ? "top" : "middle"}
        style={{
          padding: "16px 0",
          minHeight: "100dvh",
        }}
      >
        <Col xs={22} sm={20} md={16} lg={14} xl={12} xxl={10}>
          {renderContent ? (
            renderContent(mainContent, PageTitle)
          ) : (
            <>
              {PageTitle}
              {mainContent}
            </>
          )}
        </Col>
      </Row>
    </Layout>
  );
};