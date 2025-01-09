import { AuthPage } from "../../components/pages/auth";
import {DefaultApi, LoginRequest} from "../../../generated";

export const Login = () => {

  const handleLogin = async () => {
    const api = new DefaultApi();

    const loginRequest: LoginRequest = {
      username: '',
      password: '',
    };

    try {
      const response = await api.login({ loginRequest });
    } catch (err) {
    }
  };

  return (
    <AuthPage
      type="login"
      formProps={
        {
          // initialValues: { email: "vi89012@gmail.com", password: "123456" },
        }
      }
    />
  );
};
