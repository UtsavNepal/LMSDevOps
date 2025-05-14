import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../infrastructure/store/store";
import { 
  createTransaction,
  updateTransaction
} from "../../../infrastructure/store/transactionSlice";
import { useLocation, useNavigate } from "react-router-dom";
import type { Transaction } from "../../../domain/Transaction.Entity";

const Issuing: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students } = useSelector((state: RootState) => state.student);
  const { books } = useSelector((state: RootState) => state.book);
  const { users } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const isEditMode = location.state !== null;
  const transactionToEdit = location.state as Transaction | undefined;

  const [formData, setFormData] = useState<Omit<Transaction, "transaction_id">>({
    student: 0,
    user: 0,
    book: 0,
    transaction_type: "borrow",
    due_date: "",
    borrowed_date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<{ due_date?: string; borrowed_date?: string }>({});

  useEffect(() => {
    if (isEditMode && transactionToEdit) {
      setFormData({
        student: transactionToEdit.student,
        user: transactionToEdit.user,
        book: transactionToEdit.book,
        transaction_type: transactionToEdit.transaction_type,
        due_date: transactionToEdit.due_date,
        borrowed_date: transactionToEdit.borrowed_date,
      });
    }
  }, [isEditMode, transactionToEdit]);

  const validateDate = (date: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "due_date" || name === "borrowed_date") {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateErrors = {
      due_date: validateDate(formData.due_date) ? "" : "Due date must be in YYYY-MM-DD format",
      borrowed_date: validateDate(formData.borrowed_date) ? "" : "Borrowed date must be in YYYY-MM-DD format"
    };

    if (dateErrors.due_date || dateErrors.borrowed_date) {
      setErrors(dateErrors);
      return;
    }

    try {
      if (isEditMode && transactionToEdit) {
        await dispatch(updateTransaction({
          id: transactionToEdit.transaction_id,
          transaction: formData
        })).unwrap();
        alert("Transaction updated successfully!");
      } else {
        await dispatch(createTransaction(formData)).unwrap();
        alert("Book issued successfully!");
      }

      navigate("/transaction");
    } catch (error) {
      alert("Failed to process transaction. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Transaction" : "Issue Book"}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Student</label>
            <select
              name="student"
              value={formData.student}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value={0}>Select Student</option>
              {students.map(student => (
                <option key={student.student_id} value={student.student_id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Librarian</label>
            <select
              name="user"
              value={formData.user}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value={0}>Select Librarian</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.user_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Book</label>
            <select
              name="book"
              value={formData.book}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value={0}>Select Book</option>
              {books.map(book => (
                <option key={book.BookId} value={book.BookId}>
                  {book.Title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Transaction Type</label>
            <select
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
              disabled={isEditMode}
            >
              <option value="borrow">Borrow</option>
              <option value="return">Return</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="text"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.due_date ? "border-red-500" : ""
              }`}
              placeholder="YYYY-MM-DD"
              required
            />
            {errors.due_date && (
              <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Borrowed Date</label>
            <input
              type="text"
              name="borrowed_date"
              value={formData.borrowed_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.borrowed_date ? "border-red-500" : ""
              }`}
              placeholder="YYYY-MM-DD"
              required
            />
            {errors.borrowed_date && (
              <p className="text-red-500 text-sm mt-1">{errors.borrowed_date}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            {isEditMode ? "Update Transaction" : "Issue Book"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Issuing;