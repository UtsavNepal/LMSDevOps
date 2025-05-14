// import { useForm } from "react-hook-form";

// interface FormValues {
//   searchQuery: string;
//   filterType: "all" | "borrowed" | "overdue" | "returned";
// }

// export const useDashboardForm = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     watch,
//     setError,
//     reset,
//     control
//   } = useForm<FormValues>({
//     defaultValues: {
//       searchQuery: "",
//       filterType: "all",
//     },
//     mode: "onChange",
//   });

//   return {
//     register,
//     handleSubmit,
//     errors,
//     isSubmitting,
//     watch,
//     setError,
//     reset,
//     control
//   };
// };