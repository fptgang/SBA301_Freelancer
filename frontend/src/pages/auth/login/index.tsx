import { AuthPage } from "../../../components/pages/auth";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: { email: "acc6@hirable.com", password: "123456" },
      }}
    />
  );
};
