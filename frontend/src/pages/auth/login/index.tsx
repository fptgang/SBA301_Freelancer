import { AuthPage } from "../../../components/features/auth";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: { email: "acc7@hirable.com", password: "123456" },
      }}
    />
  );
};
