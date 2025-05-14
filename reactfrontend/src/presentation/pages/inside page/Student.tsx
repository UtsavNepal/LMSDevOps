import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../infrastructure/store/store";
import { 
  fetchStudents, 
  addStudent, 
  updateStudent, 
  deleteStudent 
} from "../../../infrastructure/store/studentSlice";
import type { Student } from "../../../domain/Student";
import { Skeleton, SkeletonTableRow, SkeletonTableHeader } from "../../component/ui/Skeleton";

const Student: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, loading } = useSelector((state: RootState) => state.student);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Initialize react-hook-form
  const { 
    register, 
    handleSubmit, 
    setError, 
    reset,
    watch,
    formState: { errors } 
  } = useForm<Omit<Student, "student_id">>({
    defaultValues: {
      name: "",
      email: "",
      contact_number: "",
      department: ""
    }
  });

  // Watch form values (example usage)
  const watchName = watch("name");
  const watchEmail = watch("email");
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchStudents());
    }
  }, [isAuthenticated, dispatch]);

  const onSubmit = async (data: Omit<Student, "student_id">) => {
    try {
      if (editId !== null) {
        await dispatch(updateStudent({ id: editId, student: data })).unwrap();
      } else {
        await dispatch(addStudent(data)).unwrap();
      }
      reset();
      setEditId(null);
    } catch (error) {
      // Set root error
      setError("root", {
        type: "manual",
        message: "Failed to process student"
      });
  
      // Type-safe error handling
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        
        // Set field-specific errors if needed
        if (errorMessage.includes("email")) {
          setError("email", {
            type: "manual",
            message: "Email is already in use"
          });
        }
      }
    }
  };

  const handleEdit = (student: Student) => {
    reset(student);
    setEditId(student.student_id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await dispatch(deleteStudent(id)).unwrap();
      } catch (error) {
        setError("root", {
          type: "manual",
          message: "Failed to delete student"
        });
      }
    }
  };
  
  const columns = 6;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          {loading ? (
            <Skeleton className="h-8 w-48 mb-6" />
          ) : (
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
              {editId !== null ? "Edit Student" : "Add Student"}
            </h1>
          )}

          {/* Root error message */}
          {errors.root && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {loading ? (
                <>
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name*</label>
                    <input
                      type="text"
                      {...register("name", { 
                        required: "Name is required",
                        minLength: {
                          value: 3,
                          message: "Name must be at least 3 characters"
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                        errors.name ? "border-red-500" : "border-[#D9D9D9]"
                      }`}
                      placeholder="Student Name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                    {/* Watch example - show character count */}
                    <p className="text-xs text-gray-500 mt-1">
                      Characters: {watchName?.length || 0}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Department*</label>
                    <input
                      type="text"
                      {...register("department", { 
                        required: "Department is required",
                        pattern: {
                          value: /^[A-Za-z\s]+$/,
                          message: "Department should contain only letters"
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                        errors.department ? "border-red-500" : "border-[#D9D9D9]"
                      }`}
                      placeholder="Department"
                    />
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email*</label>
                    <input
                      type="email"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                        errors.email ? "border-red-500" : "border-[#D9D9D9]"
                      }`}
                      placeholder="student@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                    {/* Watch example - show email validation */}
                    {watchEmail && !errors.email && (
                      <p className="text-xs text-green-600 mt-1">Valid email format</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Number*</label>
                    <input
                      type="text"
                      {...register("contact_number", { 
                        required: "Contact number is required",
                        pattern: {
                          value: /^[+]?[\d\s-]+$/,
                          message: "Invalid contact number format"
                        },
                        minLength: {
                          value: 7,
                          message: "Contact number must be at least 7 digits"
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                        errors.contact_number ? "border-red-500" : "border-[#D9D9D9]"
                      }`}
                      placeholder="+1234567890"
                    />
                    {errors.contact_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.contact_number.message}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end">
              {loading ? (
                <Skeleton className="h-10 w-32 rounded-lg" />
              ) : (
                <button
                  type="submit"
                  className="bg-[#255D81] text-white px-6 py-2 rounded-lg hover:bg-[#1A455D] transition-colors w-full md:w-auto"
                >
                  {editId !== null ? "Update Student" : "Add Student"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Student List Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          {loading ? (
            <Skeleton className="h-6 w-48 mb-4" />
          ) : (
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-[#255D81]">
              Student Records
            </h2>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {loading ? (
                  <SkeletonTableHeader columns={columns} />
                ) : (
                  <tr className="bg-[#6A6A6A] text-white">
                    <th className="border border-[#255D81] px-3 py-2 text-left text-sm md:text-base">ID</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left text-sm md:text-base">Name</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left text-sm md:text-base hidden sm:table-cell">Department</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left text-sm md:text-base hidden md:table-cell">Email</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left text-sm md:text-base">Contact</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left text-sm md:text-base">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {loading ? (
                  // Show 5 skeleton rows while loading
                  Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={columns} />
                  ))
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="border border-[#255D81] px-3 py-2 text-sm md:text-base">{student.student_id}</td>
                      <td className="border border-[#255D81] px-3 py-2 text-sm md:text-base font-medium">{student.name}</td>
                      <td className="border border-[#255D81] px-3 py-2 text-sm md:text-base hidden sm:table-cell">{student.department}</td>
                      <td className="border border-[#255D81] px-3 py-2 text-sm md:text-base hidden md:table-cell">{student.email}</td>
                      <td className="border border-[#255D81] px-3 py-2 text-sm md:text-base">{student.contact_number}</td>
                      <td className="border border-[#255D81] px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student.student_id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="border border-[#255D81] px-3 py-4 text-center text-gray-500">
                      No student records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;