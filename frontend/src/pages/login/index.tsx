import { AuthPage } from "../../components/pages/auth";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: { email: "vi89012@gmail.com", password: "123456" },
      }}
    />
  );
};
