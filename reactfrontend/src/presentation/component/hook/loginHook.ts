import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { AppDispatch } from "../../../infrastructure/store/store";
import { login as loginAction } from "../../../infrastructure/store/authSlice";

export type FormData = {
  username: string;
  password: string;
};

export const useLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>();
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(loginAction({
        username: data.username,
        password: data.password
      })).unwrap();
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      setError("root", {
        type: "manual",
        message: "Login failed. Please check your credentials.",
      });
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    navigate,
  };
};