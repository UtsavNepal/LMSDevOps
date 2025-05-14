import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../infrastructure/store/store";
import { 
  fetchTransactions,
  deleteTransaction
} from "../../../infrastructure/store/transactionSlice";
import { useNavigate } from "react-router-dom";
import TransactionDetailsModal from "../../component/TransactionPopup";
import { Skeleton, SkeletonTableRow, SkeletonTableHeader } from "../../component/ui/Skeleton";
import { Transaction } from "../../../domain/Transaction.Entity";

const TransactionList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading, error } = useSelector((state: RootState) => state.transaction);
  const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalLoading(true);
        await dispatch(fetchTransactions());
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLocalLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const handleEdit = (transaction_id: number) => {
    const transaction = transactions.find((t) => t.transaction_id === transaction_id);
    if (transaction) {
      navigate("/issuing", { state: transaction });
    }
  };

  const handleDelete = async (transaction_id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await dispatch(deleteTransaction(transaction_id));
      } catch (err) {
        console.error("Failed to delete transaction:", err);
      }
    }
  };

  const handleRowDoubleClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const isLoading = localLoading || loading;
  const columns = 8;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          {isLoading ? (
            <Skeleton className="h-8 w-48 mb-6" />
          ) : (
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-[#255D81]">
              Transaction List
            </h2>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {isLoading ? (
                  <SkeletonTableHeader columns={columns} />
                ) : (
                  <tr className="bg-[#6A6A6A] text-white">
                    <th className="border border-[#255D81] px-3 py-2 text-left">ID</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left">Student</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left hidden md:table-cell">Librarian</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left">Book</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left hidden sm:table-cell">Type</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left hidden lg:table-cell">Borrowed</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left hidden lg:table-cell">Due</th>
                    <th className="border border-[#255D81] px-3 py-2 text-left">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={columns} />
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={columns} className="border border-[#255D81] px-3 py-4 text-center text-red-500">
                      Error loading transactions
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr 
                      key={transaction.transaction_id}
                      onDoubleClick={() => handleRowDoubleClick(transaction)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="border border-[#255D81] px-3 py-2">{transaction.transaction_id}</td>
                      <td className="border border-[#255D81] px-3 py-2">{transaction.student_name}</td>
                      <td className="border border-[#255D81] px-3 py-2 hidden md:table-cell">{transaction.librarian_name}</td>
                      <td className="border border-[#255D81] px-3 py-2">{transaction.book_name}</td>
                      <td className="border border-[#255D81] px-3 py-2 hidden sm:table-cell capitalize">{transaction.transaction_type}</td>
                      <td className="border border-[#255D81] px-3 py-2 hidden lg:table-cell">{transaction.borrowed_date}</td>
                      <td className="border border-[#255D81] px-3 py-2 hidden lg:table-cell">{transaction.due_date}</td>
                      <td className="border border-[#255D81] px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(transaction.transaction_id);
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(transaction.transaction_id);
                            }}
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
                    <td colSpan={columns} className="border border-[#255D81] px-3 py-4 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && selectedTransaction && (
          <TransactionDetailsModal 
            transaction={selectedTransaction}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionList;