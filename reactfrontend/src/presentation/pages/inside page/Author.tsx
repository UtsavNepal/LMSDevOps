import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form"; // Added useForm
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../infrastructure/store/store";
import { 
  fetchAuthors,
  addAuthor,
  updateAuthor,
  deleteAuthor
} from "../../../infrastructure/store/authorSlice";
import type { Author } from "../../../domain/Author";

const Author: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { authors, loading, error } = useSelector((state: RootState) => state.author);
  

  const { 
    register, 
    handleSubmit, 
    setError, 
    reset,
    watch,
    formState: { errors } 
  } = useForm<Author>({
    defaultValues: {
      AuthorID: 0,
      Name: "",
      Bio: ""
    }
  });

  // Watch form values (example usage)
  const watchName = watch("Name");
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAuthors());
  }, [dispatch]);

  // Handle form submission
  const onSubmit = async (data: Author) => {
    try {
      if (editId !== null) {
        await dispatch(updateAuthor({ id: editId, author: data })).unwrap();
        alert("Author updated successfully!");
      } else {
        await dispatch(addAuthor(data)).unwrap();
        alert("Author added successfully!");
      }
      reset();
      setEditId(null);
    } catch (err) {
      setError("root", {
        type: "manual",
        message: "Failed to process author"
      });
      
      // Set field-specific errors if needed
      setError("Name", {
        type: "manual",
        message: "Author name is required"
      });
    }
  };

  const handleEdit = (author: Author) => {
    reset(author);
    setEditId(author.AuthorID);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this author?")) {
      try {
        await dispatch(deleteAuthor(id)).unwrap();
        alert("Author deleted successfully!");
      } catch (error) {
        setError("root", {
          type: "manual",
          message: "Failed to delete author"
        });
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#255D81]">
          {editId !== null ? "Edit Author" : "Add Author"}
        </h1>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {errors.root && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{errors.root.message}</p>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* AuthorID Field (Visible only in Edit Mode) */}
            {editId !== null && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Author ID</label>
                  <input
                    type="text"
                    {...register("AuthorID")}
                    className="w-full px-3 py-2 border rounded-lg border-[#D9D9D9] bg-gray-100"
                    disabled
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Author Name</label>
                <input
                  type="text"
                  {...register("Name", { required: "Author name is required" })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.Name ? "border-red-500" : "border-[#D9D9D9]"
                  }`}
                  placeholder="Enter Author Name"
                />
                {errors.Name && (
                  <p className="mt-1 text-sm text-red-600">{errors.Name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <input
                  type="text"
                  {...register("Bio", { 
                    required: "Bio is required",
                    minLength: {
                      value: 10,
                      message: "Bio must be at least 10 characters"
                    }
                  })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.Bio ? "border-red-500" : "border-[#D9D9D9]"
                  }`}
                  placeholder="Enter Bio"
                />
                {errors.Bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.Bio.message}</p>
                )}
              </div>
            </div>

            {/* Watch example - show character count */}
            <div className="mb-4 text-sm text-gray-500">
              Name character count: {watchName?.length || 0}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#255D81] text-white px-4 py-2 rounded-lg hover:bg-[#1A455D] transition-colors w-full md:w-auto"
                disabled={loading}
              >
                {loading ? "Processing..." : editId !== null ? "Update Author" : "Add Author"}
              </button>
            </div>
          </form>
        </div>

        {/* Author List Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-[#255D81]">
            Author List
          </h2>
          
          {loading ? (
            <div className="text-center py-4">Loading authors...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#6A6A6A] text-white">
                    <th className="border border-[#255D81] px-3 py-2 text-left">ID</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left">Name</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left">Bio</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {authors.length > 0 ? (
                    authors.map((author) => (
                      <tr key={author.AuthorID} className="hover:bg-gray-50">
                        <td className="border border-[#255D81] px-3 py-2">{author.AuthorID}</td>
                        <td className="border border-[#255D81] px-3 py-2">{author.Name}</td>
                        <td className="border border-[#255D81] px-3 py-2">{author.Bio}</td>
                        <td className="border border-[#255D81] px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(author)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(author.AuthorID)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border border-[#255D81] px-3 py-4 text-center text-gray-500">
                        No authors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Author;