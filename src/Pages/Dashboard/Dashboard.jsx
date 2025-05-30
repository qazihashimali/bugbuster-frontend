// import React, { useEffect, useRef, useState } from "react";
// import Chart from "chart.js/auto";
// import {
//   Chart as ChartJS,
//   LineController,
//   BarController,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { AiFillProduct } from "react-icons/ai";
// import {
//   FaPerson,
//   FaScaleBalanced,
//   FaClock,
//   FaFileInvoice,
//   FaStar,
//   FaStarHalfStroke,
// } from "react-icons/fa6";
// import { RiAccountCircleFill } from "react-icons/ri";
// import { IoChevronDown } from "react-icons/io5";

// // Register Chart.js components
// ChartJS.register(
//   LineController,
//   BarController,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// // Revenue and Expense Data
// const revenueExpenseData = {
//   labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
//   datasets: [
//     {
//       label: "Revenue",
//       data: [1200, 1900, 1500, 2000, 1800, 2200, 2100, 1876],
//       borderColor: "#F97316",
//       backgroundColor: "rgba(249, 115, 22, 0.2)",
//       fill: true,
//     },
//     {
//       label: "Expense",
//       data: [800, 1000, 1200, 1100, 1300, 1250, 1400, 1235],
//       borderColor: "#3B82F6",
//       backgroundColor: "rgba(59, 130, 246, 0.2)",
//       fill: true,
//     },
//   ],
//   summary: [
//     { label: "Revenue", value: "$1,876,580" },
//     { label: "Expense", value: "$1,235,100" },
//   ],
// };

// const vendorsData = {
//   labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
//   datasets: [
//     {
//       label: "Vendor A",
//       data: [300, 400, 200, 350, 300, 250, 400],
//       backgroundColor: "#1F2937",
//     },
//     {
//       label: "Vendor B",
//       data: [200, 300, 150, 200, 250, 200, 300],
//       backgroundColor: "#3B82F6",
//     },
//     {
//       label: "Vendor C",
//       data: [100, 150, 100, 150, 100, 150, 200],
//       backgroundColor: "#93C5FD",
//     },
//   ],
// };

// const customersData = {
//   labels: [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ],
//   datasets: [
//     {
//       label: "New Customers",
//       data: [300, 500, 700, 400, 600, 300, 500, 400, 600, 800, 500, 400],
//       borderColor: "#1F2937",
//     },
//     {
//       label: "Returning Customers",
//       data: [200, 300, 400, 300, 400, 200, 300, 200, 400, 500, 300, 200],
//       borderColor: "#FF6200",
//     },
//   ],
//   revenueNote: "Oct 2028 Revenue: $150,303.98",
// };

// const generalTasksData = [
//   {
//     icon: <AiFillProduct className="w-6 h-6 text-blue-500" />,
//     text: "You don't have any Products. Click here to add one",
//   },
//   {
//     icon: <FaPerson className="w-6 h-6 text-blue-500" />,
//     text: "You don't have any Customers. Click here to add one",
//   },
//   {
//     icon: <FaFileInvoice className="w-6 h-6 text-blue-500" />,
//     text: "You don't have any Invoices. Click here to add one",
//   },
// ];

// const advanceTasksData = [
//   {
//     icon: <RiAccountCircleFill className="w-6 h-6 text-blue-500" />,
//     text: "Click here to add an Account",
//   },
//   {
//     icon: <FaScaleBalanced className="w-6 h-6 text-blue-500" />,
//     text: "Click here to add an opening balance",
//   },
// ];

// const paymentSnapshotData = {
//   invoiceProgress: "+18%",
//   amounts: [
//     {
//       label: "Outstanding Amount",
//       value: "7,839",
//       percentage: "+3.98%",
//       color: "bg-orange-500",
//     },
//     {
//       label: "Overdue Amount",
//       value: "5,645",
//       percentage: "+1.78%",
//       color: "bg-gray-900",
//     },
//   ],
// };

// const activityLogData = [
//   {
//     email: "AI554@gmail.com",
//     activity: "Working",
//     module: "HR",
//     dateTime: "2025-04-24 10:00 AM",
//   },
//   {
//     email: "waleed000@gmail.com",
//     activity: "On leave",
//     module: "Finance",
//     dateTime: "2025-04-24 09:30 AM",
//   },
//   {
//     email: "Qasim687@gmail.com",
//     activity: "Working",
//     module: "IT",
//     dateTime: "2025-04-24 08:45 AM",
//   },
//   {
//     email: "AlMasood@gmail.com",
//     activity: "Working",
//     module: "Sales",
//     dateTime: "2025-04-24 11:15 AM",
//   },
// ];

// const subscriptionData = {
//   ALL: [
//     {
//       reference: "Microsoft Office 365",
//       name: "Per User",
//       createdDate: "150",
//       nextRun: "150",
//       status: "150",
//     },
//     {
//       reference: "Adobe Photoshop",
//       name: "Per Device",
//       createdDate: "75",
//       nextRun: "75",
//       status: "75",
//     },
//     {
//       reference: "Zoom Pro",
//       name: "Per User",
//       createdDate: "120",
//       nextRun: "120",
//       status: "120",
//     },
//     {
//       reference: "GitHub Enterprise",
//       name: "Per User",
//       createdDate: "180",
//       nextRun: "180",
//       status: "180",
//     },
//   ],
//   Invoices: [
//     {
//       reference: "Invoice #001",
//       name: "Client A",
//       createdDate: "2025-04-01",
//       nextRun: "2025-05-01",
//       status: "Pending",
//     },
//     {
//       reference: "Invoice #002",
//       name: "Client B",
//       createdDate: "2025-04-10",
//       nextRun: "2025-05-10",
//       status: "Paid",
//     },
//   ],
//   Bills: [
//     {
//       reference: "Bill #101",
//       name: "Vendor X",
//       createdDate: "2025-04-05",
//       nextRun: "2025-05-05",
//       status: "Due",
//     },
//   ],
//   "Simple Bills": [
//     {
//       reference: "Simple Bill #201",
//       name: "Supplier Y",
//       createdDate: "2025-04-15",
//       nextRun: "2025-05-15",
//       status: "Pending",
//     },
//   ],
// };

// const Alert = ({ type, message, onClose }) => {
//   const alertStyles = {
//     success: "bg-green-100 border-green-500 text-green-700",
//     error: "bg-red-100 border-red-500 text-red-700",
//   };

//   return (
//     <div
//       className={`border-l-4 p-4 mb-4 flex justify-between items-center ${alertStyles[type]}`}
//     >
//       <p>{message}</p>
//       <button onClick={onClose} className="text-gray-700 hover:text-gray-900">
//         <FaClock />
//       </button>
//     </div>
//   );
// };

// const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <h2 className="text-xl font-semibold mb-4">Confirmation</h2>
//         <p className="mb-4">{message}</p>
//         <div className="flex justify-end space-x-4">
//           <button
//             onClick={onConfirm}
//             className="bg-primary text-white px-4 py-2 rounded-md"
//           >
//             Yes
//           </button>
//           <button
//             onClick={onClose}
//             className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
//           >
//             No
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Dashboard = () => {
//   const revenueChartRef = useRef(null);
//   const vendorsChartRef = useRef(null);
//   const customersChartRef = useRef(null);

//   const [user, setUser] = useState(null);
//   const [issues, setIssues] = useState([]);
//   const [alert, setAlert] = useState({ type: "", message: "", show: false });
//   const [isLoading, setIsLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [formData, setFormData] = useState({ status: "", rating: 0, feedback: "" });
//   const [showConfirmation, setShowConfirmation] = useState(false);

//   const [activeTab, setActiveTab] = useState("ALL");
//   const [filterStatus, setFilterStatus] = useState("All");

//   const showAlert = (type, message) => {
//     setAlert({ type, message, show: true });
//     setTimeout(() => setAlert({ type: "", message: "", show: false }), 5000);
//   };

//   useEffect(() => {
//     const userData = localStorage.getItem("user");
//     if (userData) {
//       try {
//         const parsedUser = JSON.parse(userData);
//         setUser(parsedUser);
//         console.log("User from localStorage:", parsedUser);
//       } catch (err) {
//         console.error("Failed to parse user data:", err);
//         showAlert("error", "Failed to load user data");
//       }
//     }
//   }, []);

//   const fetchIssues = async () => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await fetch("https://bug-buster-backend.vercel.app/api/issues", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         console.error(
//           "Issues response status:",
//           response.status,
//           "Response text:",
//           text
//         );
//         throw new Error(
//           `Failed to fetch tasks: ${response.status} ${response.statusText}`
//         );
//       }

//       let data = await response.json();
//       console.log("Fetched issues:", data);

//       // Validate and filter out invalid issues
//       data = data.filter((issue) => {
//         if (!issue || !issue._id) {
//           console.warn("Invalid issue detected:", issue);
//           return false;
//         }
//         return true;
//       });

//       if (user && !user.roles.includes("Admin") && !user.roles.includes("SuperAdmin")) {
//         const userId = user._id;
//         if (!userId) {
//           throw new Error("User _id not found in localStorage");
//         }
//         data = data.filter((issue) => {
//           const isCreator = issue.createdBy?._id?.toString() === userId?.toString();
//           const isAssignee = issue.assignedTo?._id?.toString() === userId?.toString();
//           console.log(
//             `Issue ${issue._id}: isCreator=${isCreator}, isAssignee=${isAssignee}, createdBy=${issue.createdBy?._id}, assignedTo=${issue.assignedTo?._id}`
//           );
//           return isCreator || isAssignee;
//         });
//       }
//       console.log("Filtered issues:", data);

//       setIssues(data);
//     } catch (err) {
//       console.error("Fetch issues error:", err);
//       showAlert("error", err.message || "Failed to fetch tasks");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchIssues();
//     }
//   }, [user]);

//   const handleViewIssue = (issue) => {
//     setSelectedIssue(issue);
//     setFormData({ status: issue.status || "", rating: issue.rating || 0, feedback: issue.feedback || "" });
//     setIsModalOpen(true);
//   };

//   const handleStarClick = (starIndex) => {
//     const currentRating = formData.rating;
//     const starValue = starIndex + 1; // 1-based index for stars
//     let newRating;

//     if (currentRating === starValue) {
//       newRating = starValue - 0.5; // Toggle to half star
//     } else if (currentRating === starValue - 0.5) {
//       newRating = starValue; // Toggle to full star
//     } else {
//       newRating = starValue - 0.5; // Start with half star
//     }

//     setFormData((prev) => ({ ...prev, rating: newRating }));
//   };

//   const handleUpdateIssue = async (e) => {
//     e.preventDefault();
//     if (!user) {
//       showAlert("error", "You must be logged in to perform this action");
//       return;
//     }

//     const validStatuses = ["pending", "in-progress", "resolved"];
//     if (formData.status && !validStatuses.includes(formData.status)) {
//       showAlert("error", "Invalid status selected");
//       return;
//     }

//     if (formData.rating < 0 || formData.rating > 5) {
//       showAlert("error", "Invalid rating value");
//       return;
//     }

//     setAlert({ type: "", message: "", show: false });
//     setIsLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const payload = {};
//       if (formData.status && formData.status !== selectedIssue.status) {
//         payload.status = formData.status;
//       }
//       const currentRating = selectedIssue.rating ?? 0;
//       if (formData.rating !== currentRating) {
//         payload.rating = formData.rating;
//       }
//       if (formData.feedback && formData.feedback !== selectedIssue.feedback) {
//         payload.feedback = formData.feedback;
//       }

//       if (Object.keys(payload).length === 0) {
//         showAlert("error", "No changes to update");
//         setIsModalOpen(false);
//         return;
//       }

//       console.log("Payload being sent to API:", payload);

//       // Check if rating is 2.5 or below
//       const effectiveRating =
//         payload.rating !== undefined ? payload.rating : currentRating;
//       if (effectiveRating <= 2.5 && payload.rating !== undefined) {
//         setShowConfirmation(true);
//         setIsLoading(false); // Reset loading state until confirmation
//         return;
//       }

//       // Proceed with the update if no confirmation is needed
//       const response = await fetch(
//         `https://bug-buster-backend.vercel.app/api/issues/${selectedIssue._id}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       const data = await response.json();
//       if (!response.ok) {
//         console.error("Server response:", data);
//         throw new Error(
//           data.message || `Failed to update task: ${response.statusText}`
//         );
//       }

//       setIssues(
//         issues.map((i) => (i._id === selectedIssue._id ? data.comment : i))
//       );
//       setIsModalOpen(false);
//       setFormData({ status: "", rating: 0, feedback: "" });
//       setSelectedIssue(null);
//       showAlert("success", "Task updated successfully!");
//     } catch (err) {
//       console.error("Update issue error:", err);
//       showAlert("error", err.message || "Failed to update task");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleConfirmation = async (reopen) => {
//     setShowConfirmation(false);
//     setIsLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       if (reopen) {
//         // Call the reopen endpoint
//         const response = await fetch(
//           `https://bug-buster-backend.vercel.app/api/issues/${selectedIssue._id}/reopen`,
//           {
//             method: "PUT",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         const data = await response.json();
//         if (!response.ok) {
//           console.error("Server response:", data);
//           throw new Error(
//             data.message || `Failed to reopen task: ${response.statusText}`
//           );
//         }

//         setIssues(
//           issues.map((i) => (i._id === selectedIssue._id ? data.comment : i))
//         );
//         setIsModalOpen(false);
//         setFormData({ status: "", rating: 0, feedback: "" });
//         setSelectedIssue(null);
//         showAlert("success", "Task reopened successfully!");
//       } else {
//         // Proceed with regular update if not reopening
//         const payload = {};
//         const currentRating = selectedIssue.rating ?? 0;
//         if (formData.rating !== currentRating) {
//           payload.rating = formData.rating;
//         }
//         if (formData.status && formData.status !== selectedIssue.status) {
//           payload.status = formData.status;
//         }
//         if (formData.feedback && formData.feedback !== selectedIssue.feedback) {
//           payload.feedback = formData.feedback;
//         }

//         if (Object.keys(payload).length === 0) {
//           showAlert("error", "No changes to update");
//           setIsModalOpen(false);
//           return;
//         }

//         const response = await fetch(
//           `https://bug-buster-backend.vercel.app/api/issues/${selectedIssue._id}`,
//           {
//             method: "PUT",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(payload),
//           }
//         );

//         const data = await response.json();
//         if (!response.ok) {
//           console.error("Server response:", data);
//           throw new Error(
//             data.message || `Failed to update task: ${response.statusText}`
//           );
//         }

//         setIssues(
//           issues.map((i) => (i._id === selectedIssue._id ? data.comment : i))
//         );
//         setIsModalOpen(false);
//         setFormData({ status: "", rating: 0, feedback: "" });
//         setSelectedIssue(null);
//         showAlert("success", "Task updated successfully!");
//       }
//     } catch (err) {
//       console.error("Update issue error:", err);
//       showAlert("error", err.message || "Failed to update task");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const revenueChartContainer = revenueChartRef.current?.getContext("2d");
//     const vendorsChartContainer = vendorsChartRef.current?.getContext("2d");
//     const customersChartContainer = customersChartRef.current?.getContext("2d");

//     if (
//       !revenueChartContainer ||
//       !vendorsChartContainer ||
//       !customersChartContainer
//     ) {
//       console.error("Chart canvas context not found");
//       return;
//     }

//     const commonOptions = {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: { position: "top" },
//         title: { display: false },
//       },
//       scales: {
//         y: { beginAtZero: true },
//       },
//     };

//     const revenueChart = new Chart(revenueChartContainer, {
//       type: "line",
//       data: revenueExpenseData,
//       options: commonOptions,
//     });

//     const vendorsChart = new Chart(vendorsChartContainer, {
//       type: "bar",
//       data: vendorsData,
//       options: commonOptions,
//     });

//     const customersChart = new Chart(customersChartContainer, {
//       type: "line",
//       data: customersData,
//       options: commonOptions,
//     });

//     return () => {
//       revenueChart.destroy();
//       vendorsChart.destroy();
//       customersChart.destroy();
//     };
//   }, []);

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//   };

//   const filteredIssues =
//     filterStatus === "All"
//       ? issues
//       : issues.filter((issue) => issue?.status === filterStatus.toLowerCase());

//   const getAttachmentUrl = (attachment) => {
//     if (!attachment) return null;
//     if (attachment.startsWith("http")) return attachment;
//     return `https://bug-buster-backend.vercel.app/${attachment}`;
//   };

//   const truncateDescription = (description) => {
//     if (!description) return "";
//     const words = description.trim().split(" ");
//     if (words.length <= 2) return description;
//     return `${words.slice(0, 2).join(" ")}...`;
//   };

//   const renderStars = (rating) => {
//     if (rating === null || rating === undefined || rating === 0) {
//       return (
//         <div className="flex">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <FaStar key={star} className="w-4 h-4 text-gray-300" />
//           ))}
//         </div>
//       );
//     }
//     return (
//       <div className="flex">
//         {[1, 2, 3, 4, 5].map((star) => {
//           const starValue = star;
//           if (rating >= starValue) {
//             return <FaStar key={star} className="w-4 h-4 text-yellow-400" />;
//           } else if (rating >= starValue - 0.5) {
//             return (
//               <FaStarHalfStroke
//                 key={star}
//                 className="w-4 h-4 text-yellow-400"
//               />
//             );
//           } else {
//             return <FaStar key={star} className="w-4 h-4 text-gray-300" />;
//           }
//         })}
//       </div>
//     );
//   };

//   const renderEditableStars = (rating, onStarClick) => {
//     return (
//       <div className="flex">
//         {[0, 1, 2, 3, 4].map((index) => {
//           const starValue = index + 1;
//           const isFull = rating >= starValue;
//           const isHalf = rating >= starValue - 0.5 && rating < starValue;
//           return (
//             <button
//               key={index}
//               type="button"
//               onClick={() => onStarClick(index)}
//               className="focus:outline-none"
//             >
//               {isFull ? (
//                 <FaStar className="w-5 h-5 text-yellow-400" />
//               ) : isHalf ? (
//                 <FaStarHalfStroke className="w-5 h-5 text-yellow-400" />
//               ) : (
//                 <FaStar className="w-5 h-5 text-gray-300" />
//               )}
//             </button>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="bg-[#EFEFEF]">
//       <div className="mb-6 pl-8 pt-8">
//         <h2 className="text-2xl font-semibold text-primary">
//           Welcome to BUGBUSTER
//         </h2>
//       </div>
//       <main className="p-6">
//         {/* Task Table Section */}
//         <div className="bg-white rounded-lg shadow mb-6">
//           <div className="bg-primary text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
//             <h3 className="text-lg font-semibold">Tasks</h3>
//             <div className="relative">
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="border bg-white rounded p-1 text-sm text-gray-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 <option value="All">All</option>
//                 <option value="Pending">Pending</option>
//                 <option value="In Progress">In Progress</option>
//                 <option value="Resolved">Resolved</option>
//               </select>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                 <IoChevronDown className="text-gray-400" size={12} />
//               </div>
//             </div>
//           </div>
//           {alert.show && (
//             <Alert
//               type={alert.type}
//               message={alert.message}
//               onClose={() => setAlert({ type: "", message: "", show: false })}
//             />
//           )}
//           {isLoading && <div className="p-4 text-gray-600">Loading...</div>}
//           {!isLoading && filteredIssues.length === 0 && (
//             <div className="p-4 text-gray-600">No tasks available</div>
//           )}
//           <div className="p-6">
//             <div className="bg-white shadow rounded-lg overflow-hidden">
//               <table className="w-full text-xs">
//                 <thead className="bg-gray-100">
//                   <tr className="text-left text-gray-400">
//                     <th className="p-3">Assigned By</th>
//                     <th className="p-3">Branch</th>
//                     <th className="p-3">Department</th>
//                     <th className="p-3">Assigned To</th>
//                     <th className="p-3">Description</th>
//                     <th className="p-3">Status</th>
//                     <th className="p-3">Priority</th>
//                     <th className="p-3">Attachment</th>
//                     <th className="p-3">Rating</th>
//                     <th className="p-3">FeedBack</th>

//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredIssues.map((issue) =>
//                     issue ? (
//                       <tr
//                         key={issue._id}
//                         className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
//                         onClick={() => handleViewIssue(issue)}
//                       >
//                         <td className="p-3 text-gray-600">
//                           {issue.createdBy?.name || "N/A"}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {issue.branch
//                             ? `(${issue.branch.branchCode}) ${issue.branch.branchName}`
//                             : "N/A"}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {issue.department
//                             ? `(${issue.department.departmentCode}) ${issue.department.departmentName}`
//                             : "N/A"}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {issue.assignedTo
//                             ? `${issue.assignedTo.name} (${issue.assignedTo.email})`
//                             : "N/A"}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {truncateDescription(issue.description) || "N/A"}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {issue.status || "N/A"}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {issue.priority ? (
//                             <span
//                               className={`inline-block w-20 text-center px-2 py-1 rounded text-white text-xs ${
//                                 issue.priority === "High"
//                                   ? "bg-[#BE2C30]"
//                                   : issue.priority === "Medium"
//                                   ? "bg-[#CC610B]"
//                                   : issue.priority === "Low"
//                                   ? "bg-[#2E8310]"
//                                   : "bg-gray-500"
//                               }`}
//                             >
//                               {issue.priority}
//                             </span>
//                           ) : (
//                             "N/A"
//                           )}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {issue.attachment ? (
//                             <a
//                               href={getAttachmentUrl(issue.attachment)}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-600 hover:underline"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               Download
//                             </a>
//                           ) : (
//                             "None"
//                           )}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {renderStars(issue.rating)}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {issue.feedback || "NA"}
//                         </td>
//                       </tr>
//                     ) : null
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Modal for Task Details */}
//         {isModalOpen && selectedIssue && (
//           <div
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//             style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
//           >
//             <div className="bg-white rounded-lg p-6 w-full max-w-md">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold">Task Details</h2>
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="text-gray-600 hover:text-gray-800"
//                 >
//                   <FaClock />
//                 </button>
//               </div>
//               <div>
//                 <p>
//                   <strong>Assigned By:</strong>{" "}
//                   {selectedIssue.createdBy?.name || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Branch:</strong>{" "}
//                   {selectedIssue.branch
//                     ? `${selectedIssue.branch.branchName} (${selectedIssue.branch.branchCode})`
//                     : "N/A"}
//                 </p>
//                 <p>
//                   <strong>Department:</strong>{" "}
//                   {selectedIssue.department
//                     ? `${selectedIssue.department.departmentName} (${selectedIssue.department.departmentCode})`
//                     : "N/A"}
//                 </p>
//                 <p>
//                   <strong>Assigned To:</strong>{" "}
//                   {selectedIssue.assignedTo
//                     ? `${selectedIssue.assignedTo.name} (${selectedIssue.assignedTo.email})`
//                     : "N/A"}
//                 </p>
//                 <p>
//                   <strong>Description:</strong>{" "}
//                   {selectedIssue.description || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Status:</strong> {selectedIssue.status || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Priority:</strong> {selectedIssue.priority || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Attachment:</strong>{" "}
//                   {selectedIssue.attachment ? (
//                     <a
//                       href={getAttachmentUrl(selectedIssue.attachment)}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline"
//                     >
//                       Download
//                     </a>
//                   ) : (
//                     "None"
//                   )}
//                 </p>
//                 <p>
//                   <strong>Created At:</strong>{" "}
//                   {selectedIssue.createdAt
//                     ? new Date(selectedIssue.createdAt).toLocaleString()
//                     : "N/A"}
//                 </p>
//                 <p>
//                   <strong>Feedback:</strong>{" "}
//                   {selectedIssue.feedback || "No feedback provided"}
//                 </p>
//                 {user ? (
//                   (() => {
//                     const isSuperAdminOrAdmin =
//                       user.roles &&
//                       (user.roles.includes("SuperAdmin") || user.roles.includes("Admin"));
//                     const isAssignee =
//                       selectedIssue.assignedTo &&
//                       selectedIssue.assignedTo._id &&
//                       user._id &&
//                       selectedIssue.assignedTo._id.toString() === user._id.toString();
//                     const isCreator =
//                       selectedIssue.createdBy &&
//                       selectedIssue.createdBy._id &&
//                       user._id &&
//                       selectedIssue.createdBy._id.toString() === user._id.toString();
//                     const canUpdateStatus = isSuperAdminOrAdmin || isAssignee;
//                     const canUpdateRating = isSuperAdminOrAdmin || isCreator;
//                     const canUpdateFeedback = isSuperAdminOrAdmin || isCreator;

//                     return (
//                       <form onSubmit={handleUpdateIssue} className="mt-4">
//                         {canUpdateStatus && (
//                           <div className="mb-4">
//                             <label
//                               htmlFor="modalStatus"
//                               className="block text-sm font-medium mb-1"
//                             >
//                               Update Status
//                             </label>
//                             <div className="relative">
//                               <select
//                                 id="modalStatus"
//                                 name="status"
//                                 value={formData.status}
//                                 onChange={(e) =>
//                                   setFormData((prev) => ({
//                                     ...prev,
//                                     status: e.target.value,
//                                   }))
//                                 }
//                                 className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
//                                 required={canUpdateStatus}
//                               >
//                                 <option value="pending">Pending</option>
//                                 <option value="in-progress">In Progress</option>
//                                 <option value="resolved">Resolved</option>
//                               </select>
//                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                                 <IoChevronDown
//                                   className="text-gray-400"
//                                   size={16}
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                         {canUpdateRating && (
//                           <div className="mb-4">
//                             <label
//                               htmlFor="modalRating"
//                               className="block text-sm font-medium mb-1"
//                             >
//                               Rate Task
//                             </label>
//                             {renderEditableStars(
//                               formData.rating,
//                               handleStarClick
//                             )}
//                           </div>
//                         )}
//                         {canUpdateFeedback && (
//                           <div className="mb-4">
//                             <label
//                               htmlFor="modalFeedback"
//                               className="block text-sm font-medium mb-1"
//                             >
//                               Feedback
//                             </label>
//                             <textarea
//                               id="modalFeedback"
//                               name="feedback"
//                               value={formData.feedback}
//                               onChange={(e) =>
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   feedback: e.target.value,
//                                 }))
//                               }
//                               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                               rows="4"
//                               placeholder="Enter feedback here..."
//                             />
//                           </div>
//                         )}
//                         {(canUpdateStatus || canUpdateRating || canUpdateFeedback) ? (
//                           <div className="flex justify-end space-x-4">
//                             <button
//                               type="submit"
//                               className="bg-primary text-white px-4 py-2 rounded-md"
//                               disabled={isLoading}
//                             >
//                               Update Task
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => setIsModalOpen(false)}
//                               className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         ) : (
//                           <div className="mt-4">
//                             <p className="text-red-600 text-sm mb-4">
//                               You are not authorized to update this task.
//                             </p>
//                             <div className="flex justify-end">
//                               <button
//                                 onClick={() => setIsModalOpen(false)}
//                                 className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
//                               >
//                                 Close
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </form>
//                     );
//                   })()
//                 ) : (
//                   <div className="mt-4">
//                     <p className="text-red-600 text-sm mb-4">
//                       You must be logged in to update the task.
//                     </p>
//                     <div className="flex justify-end">
//                       <button
//                         onClick={() => setIsModalOpen(false)}
//                         className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
//                       >
//                         Close
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         <ConfirmationModal
//           isOpen={showConfirmation}
//           onClose={() => handleConfirmation(false)}
//           onConfirm={() => handleConfirmation(true)}
//           message="Do you want to reopen this task due to low rating?"
//         />

//         {/* Top Section: General Tasks, Advance Task, Payment Snapshot */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div className="bg-white rounded-lg shadow">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
//               <h3 className="text-lg font-semibold">General Tasks</h3>
//             </div>
//             <div className="p-6">
//               <p className="text-sm text-gray-500 mb-4">
//                 (These are to help you start using NITSEL)
//               </p>
//               <ul className="space-y-4">
//                 {generalTasksData.map((task, index) => (
//                   <li key={index} className="flex items-center space-x-2">
//                     {task.icon}
//                     <span className="text-blue-500">{task.text}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
//               <h3 className="text-lg font-semibold">Advance Task</h3>
//             </div>
//             <div className="p-6">
//               <p className="text-sm text-gray-500 mb-4">
//                 (These tasks are for users with account experience)
//               </p>
//               <ul className="space-y-4">
//                 {advanceTasksData.map((task, index) => (
//                   <li key={index} className="flex items-center space-x-2">
//                     {task.icon}
//                     <span className="text-blue-500">{task.text}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
//               <h3 className="text-lg font-semibold">Payment Snapshot</h3>
//             </div>
//             <div className="p-6">
//               <div className="flex items-center justify-center mb-4">
//                 <div className="relative w-32 h-32">
//                   <svg className="w-full h-full" viewBox="0 0 36 36">
//                     <path
//                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                       fill="none"
//                       stroke="#D1D5DB"
//                       strokeWidth="3.5"
//                     />
//                     <path
//                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 11.28 27.05"
//                       fill="none"
//                       stroke="#F97316"
//                       strokeWidth="3.5"
//                       strokeDasharray="18, 100"
//                     />
//                   </svg>
//                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
//                     <p className="text-[10px] text-gray-400 font-medium">
//                       Invoices
//                     </p>
//                     <p className="text-xl font-bold text-gray-800">
//                       {paymentSnapshotData.invoiceProgress}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 {paymentSnapshotData.amounts.map((item, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <span
//                         className={`w-2 h-2 ${item.color} rounded-full`}
//                       ></span>
//                       <span className="text-xs text-gray-600">
//                         {item.label}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <span className="text-xs font-semibold text-gray-800">
//                         {item.value}
//                       </span>
//                       <span className="text-[10px] text-green-500">
//                         {item.percentage}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Middle Section: Revenue and Expense, Vendors */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div className="bg-white rounded-lg shadow">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
//               <h3 className="text-lg font-semibold">Revenue and Expense</h3>
//               <select className="border rounded p-1 text-sm">
//                 <option>8 Months</option>
//               </select>
//             </div>
//             <div className="p-6">
//               <div className="flex space-x-4 mb-4">
//                 {revenueExpenseData.summary.map((item, index) => (
//                   <div key={index}>
//                     <p className="text-sm text-gray-500">{item.label}</p>
//                     <p className="text-lg font-semibold">{item.value}</p>
//                   </div>
//                 ))}
//               </div>
//               <div className="h-64">
//                 <canvas ref={revenueChartRef} />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
//               <h3 className="text-lg font-semibold">Vendors</h3>
//             </div>
//             <div className="p-6">
//               <div className="h-64">
//                 <canvas ref={vendorsChartRef} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Section: Activity Log, Customers */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div className="bg-white rounded-lg shadow">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
//               <h3 className="text-lg font-semibold">Activity Log</h3>
//             </div>
//             <div className="p-6">
//               <table className="w-full text-xs table-fixed">
//                 <thead>
//                   <tr className="text-left text-gray-400 border-b border-gray-200">
//                     <th className="pb-3 w-1/4">User Email</th>
//                     <th className="pb-3 w-1/4">Activity</th>
//                     <th className="pb-3 w-1/4">Module</th>
//                     <th className="pb-3 w-1/4">Date & Time</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {activityLogData.map((log, index) => (
//                     <tr key={index} className="border-b border-gray-100">
//                       <td className="py-4">{log.email}</td>
//                       <td className="py-4 text-gray-600">{log.activity}</td>
//                       <td className="py-4 text-gray-600">{log.module}</td>
//                       <td className="py-4 text-gray-600">{log.dateTime}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
//               <h3 className="text-lg font-semibold">Customers</h3>
//             </div>
//             <div className="p-6">
//               <div className="relative">
//                 <span className="absolute right-0 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded">
//                   {customersData.revenueNote}
//                 </span>
//                 <div className="h-64">
//                   <canvas ref={customersChartRef} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Subscription Section */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="bg-primary text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
//             <h3 className="text-lg font-semibold">Welcome to NITSEL</h3>
//           </div>
//           <div className="p-6">
//             <div className="flex space-x-4 mb-4">
//               {["ALL", "Invoices", "Bills", "Simple Bills"].map((tab) => (
//                 <button
//                   key={tab}
//                   className={`border-b-2 pb-1 ${
//                     activeTab === tab
//                       ? "border-gray-900 text-gray-900"
//                       : "border-transparent text-gray-600"
//                   }`}
//                   onClick={() => handleTabClick(tab)}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>
//             <table className="w-full text-xs">
//               <thead>
//                 <tr className="text-left text-gray-400 border-b border-gray-200">
//                   <th className="pb-3 w-1/4">Reference</th>
//                   <th className="pb-3 w-1/4">Name</th>
//                   <th className="pb-3 w-1/6">Created Date</th>
//                   <th className="pb-3 w-1/6">Date next run</th>
//                   <th className="pb-3 w-1/6">Status</th>
//                   <th className="pb-3 w-1/6">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {subscriptionData[activeTab].map((item, index) => (
//                   <tr key={index} className="border-b border-gray-100">
//                     <td className="py-4 text-gray-600">{item.reference}</td>
//                     <td className="py-4 text-gray-600">{item.name}</td>
//                     <td className="py-4 text-gray-600">{item.createdDate}</td>
//                     <td className="py-4 text-gray-600">{item.nextRun}</td>
//                     <td className="py-4 text-gray-600">{item.status}</td>
//                     <td className="py-4 text-gray-600"></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import {
  Chart as ChartJS,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AiFillProduct } from "react-icons/ai";
import {
  FaPerson,
  FaScaleBalanced,
  FaClock,
  FaFileInvoice,
  FaStar,
  FaStarHalfStroke,
} from "react-icons/fa6";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoChevronDown } from "react-icons/io5";

// Register Chart.js components
ChartJS.register(
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Revenue and Expense Data
const revenueExpenseData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  datasets: [
    {
      label: "Revenue",
      data: [1200, 1900, 1500, 2000, 1800, 2200, 2100, 1876],
      borderColor: "#F97316",
      backgroundColor: "rgba(249, 115, 22, 0.2)",
      fill: true,
    },
    {
      label: "Expense",
      data: [800, 1000, 1200, 1100, 1300, 1250, 1400, 1235],
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      fill: true,
    },
  ],
  summary: [
    { label: "Revenue", value: "$1,876,580" },
    { label: "Expense", value: "$1,235,100" },
  ],
};

const vendorsData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Vendor A",
      data: [300, 400, 200, 350, 300, 250, 400],
      backgroundColor: "#1F2937",
    },
    {
      label: "Vendor B",
      data: [200, 300, 150, 200, 250, 200, 300],
      backgroundColor: "#3B82F6",
    },
    {
      label: "Vendor C",
      data: [100, 150, 100, 150, 100, 150, 200],
      backgroundColor: "#93C5FD",
    },
  ],
};

const customersData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "New Customers",
      data: [300, 500, 700, 400, 600, 300, 500, 400, 600, 800, 500, 400],
      borderColor: "#1F2937",
    },
    {
      label: "Returning Customers",
      data: [200, 300, 400, 300, 400, 200, 300, 200, 400, 500, 300, 200],
      borderColor: "#FF6200",
    },
  ],
  revenueNote: "Oct 2028 Revenue: $150,303.98",
};

const generalTasksData = [
  {
    icon: <AiFillProduct className="w-6 h-6 text-blue-500" />,
    text: "You don't have any Products. Click here to add one",
  },
  {
    icon: <FaPerson className="w-6 h-6 text-blue-500" />,
    text: "You don't have any Customers. Click here to add one",
  },
  {
    icon: <FaFileInvoice className="w-6 h-6 text-blue-500" />,
    text: "You don't have any Invoices. Click here to add one",
  },
];

const advanceTasksData = [
  {
    icon: <RiAccountCircleFill className="w-6 h-6 text-blue-500" />,
    text: "Click here to add an Account",
  },
  {
    icon: <FaScaleBalanced className="w-6 h-6 text-blue-500" />,
    text: "Click here to add an opening balance",
  },
];

const paymentSnapshotData = {
  invoiceProgress: "+18%",
  amounts: [
    {
      label: "Outstanding Amount",
      value: "7,839",
      percentage: "+3.98%",
      color: "bg-orange-500",
    },
    {
      label: "Overdue Amount",
      value: "5,645",
      percentage: "+1.78%",
      color: "bg-gray-900",
    },
  ],
};

const activityLogData = [
  {
    email: "AI554@gmail.com",
    activity: "Working",
    module: "HR",
    dateTime: "2025-04-24 10:00 AM",
  },
  {
    email: "waleed000@gmail.com",
    activity: "On leave",
    module: "Finance",
    dateTime: "2025-04-24 09:30 AM",
  },
  {
    email: "Qasim687@gmail.com",
    activity: "Working",
    module: "IT",
    dateTime: "2025-04-24 08:45 AM",
  },
  {
    email: "AlMasood@gmail.com",
    activity: "Working",
    module: "Sales",
    dateTime: "2025-04-24 11:15 AM",
  },
];

const subscriptionData = {
  ALL: [
    {
      reference: "Microsoft Office 365",
      name: "Per User",
      createdDate: "150",
      nextRun: "150",
      status: "150",
    },
    {
      reference: "Adobe Photoshop",
      name: "Per Device",
      createdDate: "75",
      nextRun: "75",
      status: "75",
    },
    {
      reference: "Zoom Pro",
      name: "Per User",
      createdDate: "120",
      nextRun: "120",
      status: "120",
    },
    {
      reference: "GitHub Enterprise",
      name: "Per User",
      createdDate: "180",
      nextRun: "180",
      status: "180",
    },
  ],
  Invoices: [
    {
      reference: "Invoice #001",
      name: "Client A",
      createdDate: "2025-04-01",
      nextRun: "2025-05-01",
      status: "Pending",
    },
    {
      reference: "Invoice #002",
      name: "Client B",
      createdDate: "2025-04-10",
      nextRun: "2025-05-10",
      status: "Paid",
    },
  ],
  Bills: [
    {
      reference: "Bill #101",
      name: "Vendor X",
      createdDate: "2025-04-05",
      nextRun: "2025-05-05",
      status: "Due",
    },
  ],
  "Simple Bills": [
    {
      reference: "Simple Bill #201",
      name: "Supplier Y",
      createdDate: "2025-04-15",
      nextRun: "2025-05-15",
      status: "Pending",
    },
  ],
};

const Alert = ({ type, message, onClose }) => {
  const alertStyles = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
  };

  return (
    <div
      className={`border-l-4 p-4 mb-4 flex justify-between items-center ${alertStyles[type]}`}
    >
      <p>{message}</p>
      <button onClick={onClose} className="text-gray-700 hover:text-gray-900">
        <FaClock />
      </button>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Confirmation</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onConfirm}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const revenueChartRef = useRef(null);
  const vendorsChartRef = useRef(null);
  const customersChartRef = useRef(null);

  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [alert, setAlert] = useState({ type: "", message: "", show: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    rating: 0,
    feedback: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reopenIssue, setReopenIssue] = useState();

  const [activeTab, setActiveTab] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("All");

  const showAlert = (type, message) => {
    setAlert({ type, message, show: true });
    setTimeout(() => setAlert({ type: "", message: "", show: false }), 5000);
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("User from localStorage:", parsedUser);
      } catch (err) {
        console.error("Failed to parse user data:", err);
        showAlert("error", "Failed to load user data");
      }
    }
  }, []);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://bug-buster-backend.vercel.app/api/issues",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error(
          "Issues response status:",
          response.status,
          "Response text:",
          text
        );
        throw new Error(
          `Failed to fetch tasks: ${response.status} ${response.statusText}`
        );
      }

      let data = await response.json();
      console.log("Fetched issues:", data);

      // Validate and filter out invalid issues
      data = data.filter((issue) => {
        if (!issue || !issue._id) {
          console.warn("Invalid issue detected:", issue);
          return false;
        }
        return true;
      });

      if (
        user &&
        !user.roles.includes("Admin") &&
        !user.roles.includes("SuperAdmin")
      ) {
        const userId = user._id;
        if (!userId) {
          throw new Error("User _id not found in localStorage");
        }
        data = data.filter((issue) => {
          const isCreator =
            issue.createdBy?._id?.toString() === userId?.toString();
          const isAssignee =
            issue.assignedTo?._id?.toString() === userId?.toString();
          console.log(
            `Issue ${issue._id}: isCreator=${isCreator}, isAssignee=${isAssignee}, createdBy=${issue.createdBy?._id}, assignedTo=${issue.assignedTo?._id}`
          );
          return isCreator || isAssignee;
        });
      }
      console.log("Filtered issues:", data);

      setIssues(data);
    } catch (err) {
      console.error("Fetch issues error:", err);
      showAlert("error", err.message || "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIssues();
    }
  }, [user]);

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setFormData({
      status: issue.status || "",
      rating: issue.rating || 0,
      feedback: issue.feedback || "",
    });
    setIsModalOpen(true);
  };

  const handleStarClick = (starIndex) => {
    const currentRating = formData.rating;
    const starValue = starIndex + 1; // 1-based index for stars
    let newRating;

    if (currentRating === starValue) {
      newRating = starValue - 0.5; // Toggle to half star
    } else if (currentRating === starValue - 0.5) {
      newRating = starValue; // Toggle to full star
    } else {
      newRating = starValue - 0.5; // Start with half star
    }

    setFormData((prev) => ({ ...prev, rating: newRating }));
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    if (!user) {
      showAlert("error", "You must be logged in to perform this action");
      return;
    }

    const validStatuses = ["pending", "in-progress", "resolved"];
    if (formData.status && !validStatuses.includes(formData.status)) {
      showAlert("error", "Invalid status selected");
      return;
    }

    if (formData.rating < 0 || formData.rating > 5) {
      showAlert("error", "Invalid rating value");
      return;
    }

    setAlert({ type: "", message: "", show: false });
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const payload = {};
      if (formData.status && formData.status !== selectedIssue.status) {
        payload.status = formData.status;
      }
      const currentRating = selectedIssue.rating ?? 0;
      if (formData.rating !== currentRating) {
        payload.rating = formData.rating;
      }
      if (formData.feedback && formData.feedback !== selectedIssue.feedback) {
        payload.feedback = formData.feedback;
      }

      if (Object.keys(payload).length === 0) {
        showAlert("error", "No changes to update");
        setIsModalOpen(false);
        return;
      }

      console.log("Payload being sent to API:", payload);

      // Check if rating is 2.5 or below
      const effectiveRating =
        payload.rating !== undefined ? payload.rating : currentRating;
      if (effectiveRating <= 2.5 && payload.rating !== undefined) {
        setShowConfirmation(true);
        setReopenIssue(selectedIssue);
        setIsLoading(false); // Reset loading state until confirmation
        // return;
      }

      // Proceed with the update if no confirmation is needed
      const response = await fetch(
        `https://bug-buster-backend.vercel.app/api/issues/${selectedIssue._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Server response:", data);
        throw new Error(
          data.message || `Failed to update task: ${response.statusText}`
        );
      }

      // setIssues(
      //   issues.map((i) => (i._id === selectedIssue._id ? data.comment : i))
      // );
      setIssues((prevIssues) => {
        const updated = data?.issue;
        if (!updated?._id) return prevIssues;

        const exists = prevIssues.some((issue) => issue._id === updated._id);

        if (exists) {
          return prevIssues.map((issue) =>
            issue._id === updated._id ? updated : issue
          );
        } else {
          return [...prevIssues, updated];
        }
      });

      setIsModalOpen(false);
      setFormData({ status: "", rating: 0, feedback: "" });
      setSelectedIssue(null);
      showAlert("success", "Task updated successfully!");
    } catch (err) {
      console.error("Update issue error:", err);
      showAlert("error", err.message || "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (reopen) => {
    setShowConfirmation(false);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      if (reopen) {
        console.log(selectedIssue);
        // Call the reopen endpoint
        const response = await fetch(
          `https://bug-buster-backend.vercel.app/api/issues/${reopenIssue._id}/reopen`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          console.error("Server response:", data);
          throw new Error(
            data.message || `Failed to reopen task: ${response.statusText}`
          );
        }

        // setIssues(
        //   issues.map((i) => (i._id === reopenIssue?._id ? data.comment : i))
        // );

        setIssues((prevIssues) => {
          const updated = data?.issue;
          if (!updated?._id) return prevIssues;

          const exists = prevIssues.some((issue) => issue._id === updated._id);

          if (exists) {
            return prevIssues.map((issue) =>
              issue._id === updated._id ? updated : issue
            );
          } else {
            return [...prevIssues, updated];
          }
        });

        setIsModalOpen(false);
        setFormData({ status: "", rating: 0, feedback: "" });
        setSelectedIssue(null);
        showAlert("success", "Task reopened successfully!");
      } else {
        // Proceed with regular update if not reopening
        // const payload = {};
        // const currentRating = reopenIssue.rating ?? 0;
        // if (formData.rating !== currentRating) {
        //   payload.rating = formData.rating;
        // }
        // if (formData.status && formData.status !== reopenIssue.status) {
        //   payload.status = formData.status;
        // }
        // if (formData.feedback && formData.feedback !== reopenIssue.feedback) {
        //   payload.feedback = formData.feedback;
        // }

        // if (Object.keys(payload).length === 0) {
        //   showAlert("error", "No changes to update");
        //   setIsModalOpen(false);
        //   return;
        // }

        // const response = await fetch(
        //   `https://bug-buster-backend.vercel.app/api/issues/${reopenIssue._id}`,
        //   {
        //     method: "PUT",
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(payload),
        //   }
        // );

        // const data = await response.json();
        // if (!response.ok) {
        //   console.error("Server response:", data);
        //   throw new Error(
        //     data.message || `Failed to update task: ${response.statusText}`
        //   );
        // }

        // setIssues(
        //   issues.map((i) => (i._id === selectedIssue._id ? data.comment : i))
        // );
        setIsModalOpen(false);
        setFormData({ status: "", rating: 0, feedback: "" });
        setSelectedIssue(null);
        showAlert("success", "Task updated successfully!");
      }
    } catch (err) {
      console.error("Update issue error:", err);
      showAlert("error", err.message || "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const revenueChartContainer = revenueChartRef.current?.getContext("2d");
    const vendorsChartContainer = vendorsChartRef.current?.getContext("2d");
    const customersChartContainer = customersChartRef.current?.getContext("2d");

    if (
      !revenueChartContainer ||
      !vendorsChartContainer ||
      !customersChartContainer
    ) {
      console.error("Chart canvas context not found");
      return;
    }

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    };

    const revenueChart = new Chart(revenueChartContainer, {
      type: "line",
      data: revenueExpenseData,
      options: commonOptions,
    });

    const vendorsChart = new Chart(vendorsChartContainer, {
      type: "bar",
      data: vendorsData,
      options: commonOptions,
    });

    const customersChart = new Chart(customersChartContainer, {
      type: "line",
      data: customersData,
      options: commonOptions,
    });

    return () => {
      revenueChart.destroy();
      vendorsChart.destroy();
      customersChart.destroy();
    };
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const filteredIssues =
    filterStatus === "All"
      ? issues
      : issues.filter((issue) => issue?.status === filterStatus.toLowerCase());

  const getAttachmentUrl = (attachment) => {
    if (!attachment) return null;
    if (attachment.startsWith("http")) return attachment;
    return `https://bug-buster-backend.vercel.app/${attachment}`;
  };

  const truncateDescription = (description) => {
    if (!description) return "";
    const words = description.trim().split(" ");
    if (words.length <= 2) return description;
    return `${words.slice(0, 2).join(" ")}...`;
  };

  const renderStars = (rating) => {
    if (rating === null || rating === undefined || rating === 0) {
      return (
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar key={star} className="w-4 h-4 text-gray-300" />
          ))}
        </div>
      );
    }
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const starValue = star;
          if (rating >= starValue) {
            return <FaStar key={star} className="w-4 h-4 text-yellow-400" />;
          } else if (rating >= starValue - 0.5) {
            return (
              <FaStarHalfStroke
                key={star}
                className="w-4 h-4 text-yellow-400"
              />
            );
          } else {
            return <FaStar key={star} className="w-4 h-4 text-gray-300" />;
          }
        })}
      </div>
    );
  };

  const renderEditableStars = (rating, onStarClick) => {
    return (
      <div className="flex">
        {[0, 1, 2, 3, 4].map((index) => {
          const starValue = index + 1;
          const isFull = rating >= starValue;
          const isHalf = rating >= starValue - 0.5 && rating < starValue;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onStarClick(index)}
              className="focus:outline-none"
            >
              {isFull ? (
                <FaStar className="w-5 h-5 text-yellow-400" />
              ) : isHalf ? (
                <FaStarHalfStroke className="w-5 h-5 text-yellow-400" />
              ) : (
                <FaStar className="w-5 h-5 text-gray-300" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#EFEFEF]">
      <div className="mb-6 pl-8 pt-8">
        <h2 className="text-2xl font-semibold text-primary">
          Welcome to BUGBUSTER
        </h2>
      </div>
      <main className="p-6">
        {/* Task Table Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="bg-primary text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border bg-white rounded p-1 text-sm text-gray-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <IoChevronDown className="text-gray-400" size={12} />
              </div>
            </div>
          </div>
          {alert.show && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: "", message: "", show: false })}
            />
          )}
          {isLoading && <div className="p-4 text-gray-600">Loading...</div>}
          {!isLoading && filteredIssues.length === 0 && (
            <div className="p-4 text-gray-600">No tasks available</div>
          )}
          <div className="p-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr className="text-left text-gray-400">
                    <th className="p-3">Assigned By</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Assigned To</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Attachment</th>
                    <th className="p-3">FeedBack</th>
                    <th className="p-3">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) =>
                    issue ? (
                      <tr
                        key={issue._id}
                        className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleViewIssue(issue)}
                      >
                        <td className="p-3 text-gray-600">
                          {issue.createdBy?.name || "N/A"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {issue.branch
                            ? `(${issue.branch.branchCode}) ${issue.branch.branchName}`
                            : "N/A"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {issue.department
                            ? `(${issue.department.departmentCode}) ${issue.department.departmentName}`
                            : "N/A"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {issue.assignedTo
                            ? `${issue.assignedTo.name} (${issue.assignedTo.email})`
                            : "N/A"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {truncateDescription(issue.description) || "N/A"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {issue.status || "N/A"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {issue.priority ? (
                            <span
                              className={`inline-block w-20 text-center px-2 py-1 rounded text-white text-xs ${
                                issue.priority === "High"
                                  ? "bg-[#BE2C30]"
                                  : issue.priority === "Medium"
                                  ? "bg-[#CC610B]"
                                  : issue.priority === "Low"
                                  ? "bg-[#2E8310]"
                                  : "bg-gray-500"
                              }`}
                            >
                              {issue.priority}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-3 text-gray-600">
                          {issue.attachment ? (
                            <a
                              href={getAttachmentUrl(issue.attachment)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Download
                            </a>
                          ) : (
                            "None"
                          )}
                        </td>
                        <td className="p-3 text-gray-600">
                          {issue.feedback || "N/A"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {renderStars(issue.rating)}
                        </td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal for Task Details */}
        {isModalOpen && selectedIssue && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Task Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FaClock />
                </button>
              </div>
              <div>
                <p>
                  <strong>Assigned By:</strong>{" "}
                  {selectedIssue.createdBy?.name || "N/A"}
                </p>
                <p>
                  <strong>Branch:</strong>{" "}
                  {selectedIssue.branch
                    ? `${selectedIssue.branch.branchName} (${selectedIssue.branch.branchCode})`
                    : "N/A"}
                </p>
                <p>
                  <strong>Department:</strong>{" "}
                  {selectedIssue.department
                    ? `${selectedIssue.department.departmentName} (${selectedIssue.department.departmentCode})`
                    : "N/A"}
                </p>
                <p>
                  <strong>Assigned To:</strong>{" "}
                  {selectedIssue.assignedTo
                    ? `${selectedIssue.assignedTo.name} (${selectedIssue.assignedTo.email})`
                    : "N/A"}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedIssue.description || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedIssue.status || "N/A"}
                </p>
                <p>
                  <strong>Priority:</strong> {selectedIssue.priority || "N/A"}
                </p>
                <p>
                  <strong>Attachment:</strong>{" "}
                  {selectedIssue.attachment ? (
                    <a
                      href={getAttachmentUrl(selectedIssue.attachment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    "None"
                  )}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {selectedIssue.createdAt
                    ? new Date(selectedIssue.createdAt).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Feedback:</strong>{" "}
                  {selectedIssue.feedback || "No feedback provided"}
                </p>
                {user ? (
                  (() => {
                    const isSuperAdminOrAdmin =
                      user.roles &&
                      (user.roles.includes("SuperAdmin") ||
                        user.roles.includes("Admin"));
                    const isAssignee =
                      selectedIssue.assignedTo &&
                      selectedIssue.assignedTo._id &&
                      user._id &&
                      selectedIssue.assignedTo._id.toString() ===
                        user._id.toString();
                    const isCreator =
                      selectedIssue.createdBy &&
                      selectedIssue.createdBy._id &&
                      user._id &&
                      selectedIssue.createdBy._id.toString() ===
                        user._id.toString();
                    const canUpdateStatus = isSuperAdminOrAdmin || isAssignee;
                    const canUpdateRating = isSuperAdminOrAdmin || isCreator;
                    const canUpdateFeedback = isSuperAdminOrAdmin || isCreator;

                    return (
                      <form onSubmit={handleUpdateIssue} className="mt-4">
                        {canUpdateStatus && (
                          <div className="mb-4">
                            <label
                              htmlFor="modalStatus"
                              className="block text-sm font-medium mb-1"
                            >
                              Update Status
                            </label>
                            <div className="relative">
                              <select
                                id="modalStatus"
                                name="status"
                                value={formData.status}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    status: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required={canUpdateStatus}
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <IoChevronDown
                                  className="text-gray-400"
                                  size={16}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {canUpdateRating && (
                          <div className="mb-4">
                            <label
                              htmlFor="modalRating"
                              className="block text-sm font-medium mb-1"
                            >
                              Rate Task
                            </label>
                            {renderEditableStars(
                              formData.rating,
                              handleStarClick
                            )}
                          </div>
                        )}
                        {canUpdateFeedback && (
                          <div className="mb-4">
                            <label
                              htmlFor="modalFeedback"
                              className="block text-sm font-medium mb-1"
                            >
                              Feedback
                            </label>
                            <textarea
                              id="modalFeedback"
                              name="feedback"
                              value={formData.feedback}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  feedback: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              rows="4"
                              placeholder="Enter feedback here..."
                            />
                          </div>
                        )}
                        {canUpdateStatus ||
                        canUpdateRating ||
                        canUpdateFeedback ? (
                          <div className="flex justify-end space-x-4">
                            <button
                              type="submit"
                              className="bg-primary text-white px-4 py-2 rounded-md"
                              disabled={isLoading}
                            >
                              Update Task
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(false)}
                              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <p className="text-red-600 text-sm mb-4">
                              You are not authorized to update this task.
                            </p>
                            <div className="flex justify-end">
                              <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </form>
                    );
                  })()
                ) : (
                  <div className="mt-4">
                    <p className="text-red-600 text-sm mb-4">
                      You must be logged in to update the task.
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => handleConfirmation(false)}
          onConfirm={() => handleConfirmation(true)}
          message="Do you want to reopen this task due to low rating?"
        />

        {/* Top Section: General Tasks, Advance Task, Payment Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">General Tasks</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                (These are to help you start using NITSEL)
              </p>
              <ul className="space-y-4">
                {generalTasksData.map((task, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    {task.icon}
                    <span className="text-blue-500">{task.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Advance Task</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                (These tasks are for users with account experience)
              </p>
              <ul className="space-y-4">
                {advanceTasksData.map((task, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    {task.icon}
                    <span className="text-blue-500">{task.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Payment Snapshot</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 11.28 27.05"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="3.5"
                      strokeDasharray="18, 100"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-[10px] text-gray-400 font-medium">
                      Invoices
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {paymentSnapshotData.invoiceProgress}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {paymentSnapshotData.amounts.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 ${item.color} rounded-full`}
                      ></span>
                      <span className="text-xs text-gray-600">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-semibold text-gray-800">
                        {item.value}
                      </span>
                      <span className="text-[10px] text-green-500">
                        {item.percentage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Revenue and Expense, Vendors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Revenue and Expense</h3>
              <select className="border rounded p-1 text-sm">
                <option>8 Months</option>
              </select>
            </div>
            <div className="p-6">
              <div className="flex space-x-4 mb-4">
                {revenueExpenseData.summary.map((item, index) => (
                  <div key={index}>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-64">
                <canvas ref={revenueChartRef} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Vendors</h3>
            </div>
            <div className="p-6">
              <div className="h-64">
                <canvas ref={vendorsChartRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Activity Log, Customers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Activity Log</h3>
            </div>
            <div className="p-6">
              <table className="w-full text-xs table-fixed">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-200">
                    <th className="pb-3 w-1/4">User Email</th>
                    <th className="pb-3 w-1/4">Activity</th>
                    <th className="pb-3 w-1/4">Module</th>
                    <th className="pb-3 w-1/4">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogData.map((log, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4">{log.email}</td>
                      <td className="py-4 text-gray-600">{log.activity}</td>
                      <td className="py-4 text-gray-600">{log.module}</td>
                      <td className="py-4 text-gray-600">{log.dateTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Customers</h3>
            </div>
            <div className="p-6">
              <div className="relative">
                <span className="absolute right-0 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                  {customersData.revenueNote}
                </span>
                <div className="h-64">
                  <canvas ref={customersChartRef} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-primary text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">Welcome to NITSEL</h3>
          </div>
          <div className="p-6">
            <div className="flex space-x-4 mb-4">
              {["ALL", "Invoices", "Bills", "Simple Bills"].map((tab) => (
                <button
                  key={tab}
                  className={`border-b-2 pb-1 ${
                    activeTab === tab
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-600"
                  }`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-200">
                  <th className="pb-3 w-1/4">Reference</th>
                  <th className="pb-3 w-1/4">Name</th>
                  <th className="pb-3 w-1/6">Created Date</th>
                  <th className="pb-3 w-1/6">Date next run</th>
                  <th className="pb-3 w-1/6">Status</th>
                  <th className="pb-3 w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionData[activeTab].map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 text-gray-600">{item.reference}</td>
                    <td className="py-4 text-gray-600">{item.name}</td>
                    <td className="py-4 text-gray-600">{item.createdDate}</td>
                    <td className="py-4 text-gray-600">{item.nextRun}</td>
                    <td className="py-4 text-gray-600">{item.status}</td>
                    <td className="py-4 text-gray-600"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
