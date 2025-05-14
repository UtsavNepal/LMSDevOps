// src/components/TransactionDetailsModal.tsx
import React from "react";
import { Transaction } from "../../domain/Transaction.Entity";


interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ 
  transaction, 
  onClose 
}) => {
  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    const printWindow = window.open('', '_blank');
    
    if (printWindow && printContent) {
      printWindow.document.writeln(`
        <html>
          <head>
            <title>Transaction Details #${transaction.transaction_id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              h1 { margin: 0; font-size: 18px; color: #255D81; }
              .header { display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #255D81; padding-bottom: 10px; }
              .logo { height: 60px; margin-right: 15px; }
              .school-info { display: flex; flex-direction: column; justify-content: center; }
              .school-name { font-weight: bold; }
              .receipt-title { font-size: 16px; margin-top: 5px; }
              h2 { color: #255D81; margin-top: 20px; }
              .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
              .detail-item { margin-bottom: 8px; }
              .detail-label { font-weight: bold; }
              .footer { margin-top: 30px; font-size: 12px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
              .print-date { text-align: right; font-size: 12px; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/public/Book.Svg" class="logo" alt="Library Logo" />
              <div class="school-info">
                <h1 class="school-name">Hetauda School of Management and Social Sciences</h1>
                <div class="receipt-title">Library Receipt</div>
              </div>
            </div>
            <div class="print-date">Printed on: ${new Date().toLocaleString()}</div>
            <h2>Transaction Details</h2>
            ${printContent.innerHTML}
            <div class="footer">
              <p>Library Management System</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#255D81]">
            Transaction Details
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="bg-[#255D81] text-white px-4 py-2 rounded-lg hover:bg-[#1a4663]"
            >
              Close
            </button>
          </div>
        </div>
        
        <div id="print-content" className="grid grid-cols-2 gap-4 mb-4">
          {/* ... rest of your transaction details content ... */}
          <div className="detail-item">
            <p className="detail-label">Transaction ID:</p>
            <p>{transaction.transaction_id}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Type:</p>
            <p>{transaction.transaction_type}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Student:</p>
            <p>{transaction.student_name}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Librarian:</p>
            <p>{transaction.librarian_name}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Book:</p>
            <p>{transaction.book_name}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Borrowed Date:</p>
            <p>{transaction.borrowed_date}</p>
          </div>
          <div className="detail-item">
            <p className="detail-label">Due Date:</p>
            <p>{transaction.due_date}</p>
          </div>
         
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;