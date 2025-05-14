import React, { useEffect } from "react";
import { useForm } from "react-hook-form"; // Added useForm
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Card from "../../component/ui/card";
import { FaUsers, FaBook, FaUniversity } from "react-icons/fa";
import { usePreventBackNavigation } from "../historyBlock";
import { Skeleton, SkeletonCard } from "../../component/ui/Skeleton";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../infrastructure/store/store";
import { 
  fetchDashboardData, 
  sendOverdueNotifications,
  clearNotification 
} from "../../../infrastructure/store/dashboardSlice";
import { logout } from "../../../infrastructure/store/authSlice";
import { useNavigate } from "react-router-dom";

// Type for our notification settings form
type NotificationSettings = {
  notificationType: 'email' | 'sms' | 'both';
  sendTime: string;
  frequency: 'immediate' | 'daily' | 'weekly';
};

const Dashboard: React.FC = () => {
  usePreventBackNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Initialize form for notification settings
  const { 
    register, 
    handleSubmit, 
    setError,
    watch,
    formState: { errors } 
  } = useForm<NotificationSettings>({
    defaultValues: {
      notificationType: 'email',
      sendTime: '09:00',
      frequency: 'daily'
    }
  });

  // Watch notificationType changes
  const notificationType = watch("notificationType");

  // Get all needed data from Redux store
  const { 
    data: dashboardData, 
    loading, 
    error,
    notification 
  } = useSelector((state: RootState) => state.dashboard);
  
  const { users, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Form submission handler
  const onSubmitNotificationSettings = async (data: NotificationSettings) => {
    try {
      // Here you would typically send the data to your backend
      console.log("Notification settings saved:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      
    } catch (err) {
      setError("root", {
        type: "manual",
        message: "Failed to save notification settings"
      });
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch data when component mounts or when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, isAuthenticated]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification.status !== 'idle') {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  const handleSendNotifications = async () => {
    if (dashboardData.overdue_borrowers.length > 0) {
      await dispatch(sendOverdueNotifications());
      // Refresh data after sending notifications
      dispatch(fetchDashboardData());
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Prepare chart data
  const pieData = [
    { name: "Borrowed Books", value: dashboardData.total_borrowed_books },
    { name: "Returned Books", value: dashboardData.total_returned_books },
  ];
  const COLORS = ["#1E3A8A", "#60A5FA"];

  const userName = users.length > 0 ? users[0].user_name : "Guest";

  if (!isAuthenticated) {
    return null; // Or a loading spinner while redirect happens
  }

  return (
    <div className="w-full min-h-[320px] max-h-screen max-w-[2560px] mx-auto bg-gray-100 overflow-auto">
      <div className="p-4 md:p-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          {loading ? (
            <>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-24" />
            </>
          ) : (
            <>
              <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="font-semibold text-sm md:text-base">{userName}</span>
                  <span className="text-xs md:text-sm text-gray-500 ml-2">Admin</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-xs md:text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 col-span-1 md:col-span-1">
            {loading ? (
              <div className="h-[250px] w-full flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-full" />
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Cards */}
          <div className="flex flex-col space-y-3 md:space-y-4 col-span-1 md:col-span-1">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <Card
                  icon={<FaUsers />}
                  value={dashboardData.total_students.toString()}
                  label="Total User Base"
                />
                <Card
                  icon={<FaBook />}
                  value={dashboardData.total_books.toString()}
                  label="Total Book Count"
                />
                <Card 
                  icon={<FaUniversity />} 
                  value="0010" 
                  label="Branch Count" 
                />
              </>
            )}
          </div>

          {/* Notification Settings Form */}
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-md w-full col-span-1 md:col-span-1">
            <h3 className="font-semibold text-base md:text-lg mb-4">Notification Settings</h3>
            
            <form onSubmit={handleSubmit(onSubmitNotificationSettings)} className="space-y-4">
              {/* Form Error */}
              {errors.root && (
                <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                  {errors.root.message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="email"
                      {...register("notificationType")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="sms"
                      {...register("notificationType")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>SMS</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="both"
                      {...register("notificationType")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Both</span>
                  </label>
                </div>
              </div>

              {/* Conditional field based on watched value */}
              {notificationType !== 'sms' && (
                <div>
                  <label htmlFor="sendTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Send Time
                  </label>
                  <input
                    id="sendTime"
                    type="time"
                    {...register("sendTime", { required: "Send time is required" })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.sendTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.sendTime.message}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  id="frequency"
                  {...register("frequency", { required: "Frequency is required" })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
                {errors.frequency && (
                  <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Settings
              </button>
            </form>
          </div>

          {/* Overdue Borrowers */}
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-md w-full col-span-1 md:col-span-3 mt-4">
            <div className="flex flex-col h-full">
              {loading ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-base md:text-lg">Overdue Borrowers</h3>
                    <button
                      onClick={handleSendNotifications}
                      disabled={
                        notification.status === 'sending' || 
                        dashboardData.overdue_borrowers.length === 0
                      }
                      className={`px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm rounded-md ${
                        notification.status === 'sending' || 
                        dashboardData.overdue_borrowers.length === 0
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {notification.status === 'sending' ? (
                        <span className="flex items-center">
                          <svg 
                            className="animate-spin -ml-1 mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 text-white" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        "Send Notifications"
                      )}
                    </button>
                  </div>
                  
                  {notification.message && (
                    <div className={`mb-2 p-2 text-xs md:text-sm rounded ${
                      notification.status === 'success' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {notification.message}
                    </div>
                  )}

                  <div className="flex-grow overflow-y-auto max-h-[200px] md:max-h-[300px]">
                    {dashboardData.overdue_borrowers.length > 0 ? (
                      <ul className="space-y-2">
                        {dashboardData.overdue_borrowers.map((borrower, index) => (
                          <li 
                            key={index} 
                            className="flex justify-between p-2 border rounded-md text-xs md:text-sm"
                          >
                            <span className="truncate">
                              {borrower.student_name} (ID: {borrower.transaction_id})
                            </span>
                            <span className="text-red-500 whitespace-nowrap ml-2">Overdue</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-center py-4 text-sm md:text-base">
                        No overdue borrowers
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;