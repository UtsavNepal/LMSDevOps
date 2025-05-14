import React from "react";
import { UseFormRegister, FieldErrors, UseFormHandleSubmit } from "react-hook-form";
import { FormData } from "../../component/hook/loginHook";

interface LoginViewProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  navigate: (path: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  register,
  errors,
  handleSubmit,
  onSubmit,
  navigate,
}) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden bg-white">
      {/* Login Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-10 order-2 md:order-1">
        <img
          src="Book.svg"
          alt="Library Logo"
          className="w-[120px] h-[82px] sm:w-[160px] sm:h-[109px] md:w-[200px] md:h-[136px] lg:w-[250px] lg:h-[170px] mb-4 sm:mb-6"
        />

        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center mb-2 sm:mb-3">
          HSMS Library Management System
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-center text-sm sm:text-base">
          Please enter your credentials
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center">
          <input
            {...register("username", { required: "Username is required" })}
            type="text"
            placeholder="Username"
            autoComplete="username"
            className="w-full p-2 sm:p-3 rounded-3xl border border-gray-300 mb-1 sm:mb-2 outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
          />
          {errors.username && (
            <p className="text-red-500 text-xs mb-2 self-start pl-2">
              {errors.username.message}
            </p>
          )}
          
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="w-full p-2 sm:p-3 rounded-3xl border border-gray-300 mb-1 sm:mb-2 outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mb-2 self-start pl-2">
              {errors.password.message}
            </p>
          )}

          {errors.root && (
            <p className="text-red-500 text-xs mb-2 text-center">
              {errors.root.message}
            </p>
          )}

          <p className="text-xs sm:text-sm text-gray-500 cursor-pointer mb-3 sm:mb-4 hover:underline">
            Forgot Password?
          </p>

          <button
            type="submit"
            className="w-32 sm:w-40 bg-blue-600 text-white py-2 sm:py-3 rounded-3xl hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Log In
          </button>
        </form>
      </div>

      {/* Promo Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-[#255D81] text-white p-4 sm:p-6 md:p-8 lg:p-10 order-1 md:order-2">
        <img
          src="/Book.svg"
          alt="Library Logo"
          className="w-[80px] h-[60px] sm:w-[100px] sm:h-[76px] md:w-[120px] md:h-[90px] lg:w-[150px] lg:h-[115px] mb-4 sm:mb-6"
        />

        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center mb-2 sm:mb-3">
          HSMS Library
        </h2>
        <p className="text-gray-300 mb-4 sm:mb-6 text-center text-sm sm:text-base">
          New to our platform?
          <br /> Register Now
        </p>

        <button 
          className="w-32 sm:w-40 bg-white text-[#255D81] py-2 sm:py-3 rounded-3xl hover:bg-gray-200 transition-colors text-sm sm:text-base"
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </div>
    </div>
  );
};