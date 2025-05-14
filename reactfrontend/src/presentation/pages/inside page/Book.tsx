import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../infrastructure/store/store";
import { 
  fetchBooks,
  addBook,
  updateBook,
  deleteBook
} from "../../../infrastructure/store/bookSlice";
import { fetchAuthors } from "../../../infrastructure/store/authorSlice";
import type { Book } from "../../../domain/BookEntities";

const Book: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { books, loading: booksLoading, error: booksError } = useSelector((state: RootState) => state.book);
  const { authors, loading: authorsLoading, error: authorsError } = useSelector((state: RootState) => state.author);
  

  const { 
    register, 
    handleSubmit, 
    setError, 
    reset,
    watch,
    formState: { errors } 
  } = useForm<Omit<Book, "BookId">>({
    defaultValues: {
      Title: "",
      author: 0,
      Genre: "",
      ISBN: "",
      Quantity: 0,
    }
  });

  // Watch form values (example usage)
  const watchTitle = watch("Title");
  const watchQuantity = watch("Quantity");
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchAuthors());
  }, [dispatch]);

  // Handle form submission
  const onSubmit = async (data: Omit<Book, "BookId">) => {
    try {
      if (editId !== null) {
        await dispatch(updateBook({ id: editId, book: data })).unwrap();
        alert("Book updated successfully!");
      } else {
        await dispatch(addBook(data)).unwrap();
        alert("Book added successfully!");
      }
      reset();
      setEditId(null);
    } catch (err) {
      setError("root", {
        type: "manual",
        message: "Failed to process book"
      });
      
      // Set field-specific errors if needed
      setError("Title", {
        type: "manual",
        message: "Book title is required"
      });
    }
  };

  const handleEdit = (book: Book) => {
    reset(book);
    setEditId(book.BookId);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await dispatch(deleteBook(id)).unwrap();
        alert("Book deleted successfully!");
      } catch (error) {
        setError("root", {
          type: "manual",
          message: "Failed to delete book"
        });
      }
    }
  };

  const loading = booksLoading || authorsLoading;
  const error = booksError || authorsError;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
            {editId !== null ? "Edit Book" : "Add Book"}
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title*</label>
                <input
                  type="text"
                  {...register("Title", { 
                    required: "Book title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters"
                    }
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                    errors.Title ? "border-red-500" : "border-[#D9D9D9]"
                  }`}
                  placeholder="Book Title"
                />
                {errors.Title && (
                  <p className="mt-1 text-sm text-red-600">{errors.Title.message}</p>
                )}
                {/* Watch example - show character count */}
                <p className="text-xs text-gray-500 mt-1">
                  Characters: {watchTitle?.length || 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Author*</label>
                <select
                  {...register("author", { 
                    required: "Author is required",
                    validate: (value) => value !== 0 || "Please select an author"
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                    errors.author ? "border-red-500" : "border-[#D9D9D9]"
                  }`}
                  disabled={authorsLoading}
                >
                  <option value={0}>Select Author</option>
                  {authors.map((author) => (
                    <option key={author.AuthorID} value={author.AuthorID}>
                      {author.Name}
                    </option>
                  ))}
                </select>
                {errors.author && (
                  <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
                )}
                {authorsLoading && <p className="text-sm text-gray-500">Loading authors...</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Genre*</label>
                <input
                  type="text"
                  {...register("Genre", { 
                    required: "Genre is required",
                    pattern: {
                      value: /^[A-Za-z\s]+$/,
                      message: "Genre should contain only letters"
                    }
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                    errors.Genre ? "border-red-500" : "border-[#D9D9D9]"
                  }`}
                  placeholder="Book Genre"
                />
                {errors.Genre && (
                  <p className="mt-1 text-sm text-red-600">{errors.Genre.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ISBN*</label>
                <input
                  type="text"
                  {...register("ISBN", { 
                    required: "ISBN is required",
                    
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                    errors.ISBN ? "border-red-500" : "border-[#D9D9D9]"
                  }`}
                  placeholder="ISBN Number"
                />
                {errors.ISBN && (
                  <p className="mt-1 text-sm text-red-600">{errors.ISBN.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity*</label>
                <input
                  type="number"
                  {...register("Quantity", { 
                    required: "Quantity is required",
                    min: {
                      value: 0,
                      message: "Quantity cannot be negative"
                    },
                    max: {
                      value: 1000,
                      message: "Maximum quantity is 1000"
                    }
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                    errors.Quantity ? "border-red-500" : "border-[#D9D9D9]"
                  }`}
                  placeholder="Available Quantity"
                />
                {errors.Quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.Quantity.message}</p>
                )}
                {/* Watch example - show quantity status */}
                {watchQuantity > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {watchQuantity} available in stock
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#255D81] text-white px-6 py-2 rounded-lg hover:bg-[#1A455D] transition-colors w-full md:w-auto"
                disabled={loading}
              >
                {loading ? "Processing..." : editId !== null ? "Update Book" : "Add Book"}
              </button>
            </div>
          </form>
        </div>

        {/* Book List Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-[#255D81]">
            Book Inventory
          </h2>
          
          {booksLoading ? (
            <div className="text-center py-4">Loading books...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#6A6A6A] text-white">
                    <th className="border border-[#255D81] px-3 py-2 text-left">ID</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left">Title</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left hidden sm:table-cell">Author</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left hidden md:table-cell">Genre</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left hidden lg:table-cell">ISBN</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left">Qty</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length > 0 ? (
                    books.map((book) => (
                      <tr key={book.BookId} className="hover:bg-gray-50">
                        <td className="border border-[#255D81] px-3 py-2">{book.BookId}</td>
                        <td className="border border-[#255D81] px-3 py-2 font-medium">{book.Title}</td>
                        <td className="border border-[#255D81] px-3 py-2 hidden sm:table-cell">
                          {authors.find((a) => a.AuthorID === book.author)?.Name || "Unknown"}
                        </td>
                        <td className="border border-[#255D81] px-3 py-2 hidden md:table-cell">{book.Genre}</td>
                        <td className="border border-[#255D81] px-3 py-2 hidden lg:table-cell">{book.ISBN}</td>
                        <td className="border border-[#255D81] px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            book.Quantity > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {book.Quantity}
                          </span>
                        </td>
                        <td className="border border-[#255D81] px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(book)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(book.BookId)}
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
                      <td colSpan={7} className="border border-[#255D81] px-3 py-4 text-center text-gray-500">
                        No books found in inventory
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

export default Book;