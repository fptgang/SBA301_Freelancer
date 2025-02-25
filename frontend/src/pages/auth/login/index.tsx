import { AuthPage } from "../../../components/pages/auth";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: { email: "diana.glover6@yahoo.com", password: "1234567" },
      }}
    />
  );
};
