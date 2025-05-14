import React from "react";

interface CardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  className?: string; 
}

const Card: React.FC<CardProps> = ({ icon, value, label, className }) => {
  return (
    <div className={`p-4 bg-white rounded-lg shadow-md flex items-center space-x-4 w-64 ${className}`}>
      <div className="text-3xl text-blue-600">{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-600 text-sm">{label}</p>
      </div>
    </div>
  );
};

export default Card;
