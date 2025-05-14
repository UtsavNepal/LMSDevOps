// import { useState } from "react";
// import { useLoaderData } from "react-router-dom";
// import { DashboardRepository } from "../../../infrastructure/repositories/DashboardRepository";

// export const useDashboard = () => {
//   const loaderData = useLoaderData() as any;
//   const [dashboardData, setDashboardData] = useState(loaderData.dashboardData);
//   const [users] = useState(loaderData.users);
//   const [isSending, setIsSending] = useState(false);
//   const [notificationStatus, setNotificationStatus] = useState<{
//     success: boolean;
//     message: string;
//   } | null>(null);

//   const refreshData = async () => {
//     try {
//       const repository = new DashboardRepository();
//       const [bookSummary, overdueBorrowers] = await Promise.all([
//         repository.getBookSummary(),
//         repository.getOverdueBorrowers(),
//       ]);
//       setDashboardData({
//         ...bookSummary,
//         overdue_borrowers: overdueBorrowers,
//       });
//     } catch (error) {
//       console.error("Error refreshing data:", error);
//     }
//   };

//   const handleSendNotifications = async () => {
//     setIsSending(true);
//     setNotificationStatus(null);
//     try {
//       const repository = new DashboardRepository();
//       const response = await repository.sendOverdueNotifications();
//       setNotificationStatus({
//         success: true,
//         message: response.message || "Notifications sent successfully!",
//       });
//       await refreshData();
//     } catch (error) {
//       setNotificationStatus({
//         success: false,
//         message: "Failed to send notifications",
//       });
//       console.error("Error sending notifications:", error);
//     } finally {
//       setIsSending(false);
//       setTimeout(() => setNotificationStatus(null), 5000);
//     }
//   };

//   return {
//     dashboardData,
//     users,
//     isSending,
//     notificationStatus,
//     handleSendNotifications,
//     refreshData
//   };
// };