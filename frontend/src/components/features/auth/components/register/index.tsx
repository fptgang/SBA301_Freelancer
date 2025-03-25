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
import { Row, Col, Layout, Form, Button, theme, message } from "antd";

// Import our modular components
import { StepProgress } from "./components/StepProgress";
import { RoleSelection } from "./components/RoleSelection";
import { PersonalInfo } from "./components/PersonalInfo";
import { AccountSetup } from "./components/AccountSetup";
import { Confirmation } from "./components/Confirmation";
import { SocialLogin } from "./components/SocialLogin";
import { FreelancerProfile } from "./components/FreelancerProfile";
import api from "../../../../../services/api/openapi-config";
import { RegisterRequestDto } from "../../../../../../generated";

type RegisterProps = RegisterPageProps<any, any, any>;

/**
 * Multi-step registration page component
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

  // Handle social login provider selection
  const handleProviderCallback = ({
    provider,
    credential,
  }: {
    provider: string;
    credential: string;
  }) => {
    if (!roleSelected || !credential) return;
    register({
      ...mutationVariables,
      providerName: provider,
      // Only pass fields expected by RegisterFormTypes
    });
  };

  // Get total number of steps based on role
  const getTotalSteps = () => {
    return roleSelected === "FREELANCER" ? 5 : 4;
  };

  // Navigate to next step
  const handleNext = async () => {
    try {
      // Validate fields in the current step
      if (currentStep === 0) {
        if (!roleSelected) {
          message.error("Please select a role to continue");
          return;
        }
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 1) {
        await form.validateFields(["firstName", "lastName"]);
        const values = form.getFieldsValue();
        setFormData({ ...formData, ...values });
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 2) {
        await form.validateFields(["email", "password", "confirmPassword"]);
        const values = form.getFieldsValue();
        setFormData({ ...formData, ...values });
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 3 && roleSelected === "FREELANCER") {
        // Freelancer profile step
        await form.validateFields([
          "overview",
          "education",
          "language",
          "profileSkills",
        ]);
        // Get skills - no validation needed as it's optional
        const values = form.getFieldsValue();
        console.log("Freelancer profile values:", values);
        setFormData({ ...formData, ...values });
        setCurrentStep(currentStep + 1);
      } else {
        // Final submission step
        const completeFormData = { ...formData, role: roleSelected };
        const registerRequestDto: RegisterRequestDto = {
          email: completeFormData.email,
          password: completeFormData.password,
          firstName: completeFormData.firstName,
          lastName: completeFormData.lastName,
          role:
            completeFormData.role === "FREELANCER" ? "FREELANCER" : "CLIENT",
          confirmPassword: completeFormData.confirmPassword,
          education: completeFormData.education,
          language: completeFormData.language,
          overview: completeFormData.overview,
          profileSkills: completeFormData.profileSkills,
          phoneNumber: completeFormData.phoneNumber,
        };
        console.log("Complete form data:", completeFormData);
        api.register({
          registerRequestDto: completeFormData,
        });
        // register(
        //   {
        //     ...mutationVariables,
        //     ...completeFormData,
        //   },
        //   {
        //     onSuccess: () => {
        //       setRegistrationComplete(true);
        //       message.success("Registration successful!");
        //     },
        //     onError: () => {
        //       message.error("Registration failed. Please try again.");
        //     },
        //   }
        // );
      }
    } catch (error) {
      // Form validation error will be handled by the form itself
      console.error("Validation error:", error);
    }
  };

  // Navigate to previous step
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Get button text based on current step
  const getButtonText = () => {
    const finalStep = roleSelected === "FREELANCER" ? 4 : 3;
    if (currentStep === finalStep) return "Complete Registration";
    return "Continue";
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <RoleSelection
              selectedRole={roleSelected}
              onRoleSelect={setRoleSelected}
            />
            <SocialLogin
              providers={providers as any}
              callback={handleProviderCallback}
            />
          </>
        );
      case 1:
        return <PersonalInfo form={form} />;
      case 2:
        return <AccountSetup form={form} />;
      case 3:
        if (roleSelected === "FREELANCER") {
          return <FreelancerProfile form={form} />;
        } else {
          return (
            <Confirmation
              formData={formData}
              roleSelected={roleSelected}
              isComplete={registrationComplete}
            />
          );
        }
      case 4:
        return (
          <Confirmation
            formData={formData}
            roleSelected={roleSelected}
            isComplete={registrationComplete}
          />
        );
      default:
        return null;
    }
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

  // Main content to render
  const mainContent = (
    <div className="flex flex-col items-center justify-center min-h-screen  p-4">
      {/* Steps indicator */}
      <div className="w-full max-w-3xl mb-8">
        <StepProgress
          currentStep={currentStep}
          totalSteps={getTotalSteps()}
          isComplete={registrationComplete}
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

        {/* Navigation buttons */}
        <div className="flex justify-between w-full max-w-xl mt-8">
          {currentStep > 0 && !registrationComplete && (
            <Button onClick={handlePrev}>Back</Button>
          )}
          {currentStep === 0 && !registrationComplete && <div></div>}
          <div className="flex-1"></div>
          {!registrationComplete && (
            <Button
              type="primary"
              onClick={handleNext}
              loading={
                isLoading &&
                currentStep === (roleSelected === "FREELANCER" ? 4 : 3)
              }
              style={{
                backgroundColor:
                  roleSelected || currentStep > 0 ? "#108B01" : "#E8E8E9",
                borderColor:
                  roleSelected || currentStep > 0 ? "#108B01" : "#E8E8E9",
                color: roleSelected || currentStep > 0 ? "#fff" : "#A4A5B4",
              }}
              disabled={currentStep === 0 && !roleSelected}
              size="large"
            >
              {getButtonText()}
            </Button>
          )}
          {registrationComplete && (
            <Button
              type="primary"
              style={{ backgroundColor: "#108B01", borderColor: "#108B01" }}
              onClick={() => (window.location.href = "/login")}
              size="large"
            >
              Go to Login
            </Button>
          )}
        </div>
      </Form>

      {/* Login link */}
      <div className="mt-6 text-center">
        Already have an account?{" "}
        <ActiveLink
          to="/login"
          style={{
            textDecoration: "underline",
            color: "#108B01",
          }}
        >
          Log in
        </ActiveLink>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }} {...(wrapperProps ?? {})}>
      <Row
        justify="center"
        align="middle"
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

export default RegisterPage;
