import { useLoaderData } from "react-router-dom";
import { useLogin } from "../../component/hook/loginHook";
import { LoginView } from "./LoginView";

const LoginPage = () => {

  useLoaderData();
  
  const loginProps = useLogin();

  return <LoginView {...loginProps} />;
};

export default LoginPage;
