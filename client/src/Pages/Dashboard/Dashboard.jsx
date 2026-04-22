//previous
// import React, { useEffect, useState } from "react";

// import { FaEdit } from "react-icons/fa";
// import { MdCheck, MdClose } from "react-icons/md";

// import { FaScaleBalanced, FaStar, FaStarHalfStroke } from "react-icons/fa6";
// import { RiAccountCircleFill } from "react-icons/ri";
// import { IoChevronDown } from "react-icons/io5";

// import { Link } from "react-router-dom";
// import { BsFillBugFill } from "react-icons/bs";
// import { SiGoogletasks } from "react-icons/si";
// import { TiThList } from "react-icons/ti";
// import toast from "react-hot-toast";
// import Loading from "../../Components/Loading";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// // Revenue and Expense Data

// const generalTasksData = [
//   {
//     icon: <BsFillBugFill className="w-6 h-6 text-blue-500" />,
//     text: (
//       <span>
//         You don't have any tasks.{" "}
//         <Link to={"/issue-desk"} className="underline cursor-pointer">
//           Click here
//         </Link>{" "}
//         to add one.
//       </span>
//     ),
//   },
//   {
//     icon: <SiGoogletasks className="w-6 h-6 text-blue-500" />,
//     text: (
//       <span>
//         Want to view tasks you assigned to others?{" "}
//         <Link to={"/assigned-tasks"} className="underline cursor-pointer">
//           Click here
//         </Link>
//         .
//       </span>
//     ),
//   },
//   {
//     icon: <TiThList className="w-6 h-6 text-blue-500" />,
//     text: (
//       <span>
//         Want to view tasks assigned to you?{" "}
//         <Link to={"/my-tasks"} className="underline cursor-pointer">
//           Click here
//         </Link>
//         .
//       </span>
//     ),
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

// const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <h2 className="text-xl font-semibold mb-4">Confirmation</h2>
//         <p className="mb-4">{message}</p>
//         <div className="flex justify-end space-x-4">
//           <button
//             onClick={onClose}
//             className="bg-black cursor-pointer text-white px-4 py-2 rounded-md"
//           >
//             No
//           </button>
//           <button
//             onClick={onConfirm}
//             className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md"
//           >
//             Yes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Dashboard = () => {
//   const [user, setUser] = useState(null);
//   const [issues, setIssues] = useState([]);

//   const [isLoading, setIsLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [formData, setFormData] = useState({
//     status: "",
//     rating: 0,
//     feedback: "",
//     comment: "", // New field for comment input
//   });
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [reopenIssue, setReopenIssue] = useState();

//   // const [activeTab, setActiveTab] = useState("ALL");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [assignedTasks, setAssignedTasks] = useState([]);
//   const [editingFeedback, setEditingFeedback] = useState(null); // { id, feedback, rating }
//   const [editingComment, setEditingComment] = useState(null); // { id, text }
//   const [editLoading, setEditLoading] = useState(false);

//   const [analytics, setAnalytics] = useState(null);
//   const [analyticsType, setAnalyticsType] = useState("daily"); // daily | monthly | yearly

//   useEffect(() => {
//     const userData = localStorage.getItem("user");
//     if (userData) {
//       try {
//         const parsedUser = JSON.parse(userData);
//         setUser(parsedUser);
//         // console.log("User from localStorage:", parsedUser);
//       } catch (err) {
//         console.error("Failed to parse user data:", err);
//         toast.error("Failed to parse user data");
//       }
//     }
//   }, []);

//   const fetchIssues = async () => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("No authentication token found");
//       }

//       const searchParams = new URLSearchParams();

//       if (searchParams) {
//         if (
//           !user.roles.includes("SuperAdmin") &&
//           !user.roles.includes("Admin")
//         ) {
//           searchParams.append("assignedTo", user._id);
//           searchParams.append("createdBy", user._id);
//         }
//       }

//       const response = await fetch(
//         `${
//           import.meta.env.VITE_BACKEND_URL
//         }/api/issues?${searchParams.toString()}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         const text = await response.text();
//         console.error(
//           "Issues response status:",
//           response.status,
//           "Response text:",
//           text
//         );
//         toast.error(`Failed to fetch issues: ${response.statusText}`);
//       }

//       let data = await response.json();
//       // console.log("Fetched issues:", data);

//       // Validate and filter out invalid issues
//       // data = data.filter((issue) => {
//       //   if (!issue && !issue._id) {
//       //     console.warn("Invalid issue detected:", issue);
//       //     return false;
//       //   }

//       //   if (
//       //     issue.assignedTo?._id !== user._id &&
//       //     issue.createdBy?._id !== user._id &&
//       //     !user.roles.includes("Admin") &&
//       //     !user.roles.includes("SuperAdmin")
//       //   ) {
//       //     return false;
//       //   }
//       //   return true;
//       // });

//       if (user) {
//         const userId = user._id;
//         if (!userId) {
//           toast.error("User ID not found in local storage");
//         }
//       }
//       // console.log("Filtered issues:", data);

//       setIssues(data);
//     } catch (err) {
//       console.error("Fetch issues error:", err);
//       toast.error(`Failed to fetch issues: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchAnalytics = async (type = "daily") => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         `${
//           import.meta.env.VITE_BACKEND_URL
//         }/api/issues/analytics/stats?type=${type}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       if (!res.ok) throw new Error("Failed to fetch analytics");
//       setAnalytics(await res.json());
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };
//   const fetchAssignedTasks = async () => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!token || !user?._id) {
//         toast.error("No authentication token or user ID found");
//       }

//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/issues?createdBy=${user._id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         const text = await response.text();
//         console.error(
//           "Assigned tasks response status:",
//           response.status,
//           "Response text:",
//           text
//         );
//         toast.error(`Failed to fetch assigned tasks: ${response.statusText}`);
//       }

//       const data = await response.json();
//       // console.log("Fetched assigned tasks:", data);
//       const filteredIssues = Array.isArray(data) ? data : data.issues || [];

//       setAssignedTasks(filteredIssues);
//     } catch (err) {
//       console.error("Fetch assigned tasks error:", err);
//       toast.error(err.message || "Failed to fetch assigned tasks");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchIssues();
//       fetchAssignedTasks();
//       fetchAnalytics(analyticsType);
//       const interval = setInterval(() => {
//         fetchIssues();
//         fetchAssignedTasks();
//       }, 60000);

//       return () => clearInterval(interval);
//     }
//   }, [user]);

//   const calculatePaymentSnapshotData = () => {
//     const safeIssues = Array.isArray(issues) ? issues : [];
//     const totalIssues = safeIssues.length;
//     const statusCounts = {
//       pending: safeIssues.filter((issue) => issue.status === "pending").length,
//       "in-progress": safeIssues.filter(
//         (issue) => issue.status === "in-progress"
//       ).length,
//       resolved: safeIssues.filter((issue) => issue.status === "resolved")
//         .length,
//     };

//     const statusPercentages = {
//       pending:
//         totalIssues > 0
//           ? ((statusCounts.pending / totalIssues) * 100).toFixed(2)
//           : 0,
//       "in-progress":
//         totalIssues > 0
//           ? ((statusCounts["in-progress"] / totalIssues) * 100).toFixed(2)
//           : 0,
//       resolved:
//         totalIssues > 0
//           ? ((statusCounts.resolved / totalIssues) * 100).toFixed(2)
//           : 0,
//     };

//     return {
//       statuses: [
//         {
//           label: "Pending",
//           value: statusCounts.pending,
//           percentage: `+${statusPercentages.pending}%`,
//           color: "bg-orange-500",
//         },
//         {
//           label: "In Progress",
//           value: statusCounts["in-progress"],
//           percentage: `+${statusPercentages["in-progress"]}%`,
//           color: "bg-blue-500",
//         },
//         {
//           label: "Resolved",
//           value: statusCounts.resolved,
//           percentage: `+${statusPercentages.resolved}%`,
//           color: "bg-green-500",
//         },
//       ],
//       total: totalIssues,
//     };
//   };

//   console.log("Issues state:", issues);
//   const paymentSnapshotData = calculatePaymentSnapshotData();

//   const combinedActivityLogData = assignedTasks.map((issue) => ({
//     assignedTo: issue.assignedTo?.name || "N/A",
//     assignedBy: issue.userName || "N/A",
//     status: issue.status || "N/A",
//     dateTime: issue.createdAt
//       ? new Date(issue.createdAt).toLocaleString()
//       : "N/A",
//   }));

//   const handleViewIssue = (issue) => {
//     setSelectedIssue(issue);
//     setFormData({
//       status: issue.status || "",
//       rating: issue.rating || 0,
//       feedback: issue.feedback || "",
//       // comment: issue.comments || "",
//       comment: "", // Reset comment field when viewing an issue
//     });
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
//     if (e.preventDefault) e.preventDefault();
//     if (!user) {
//       toast.error("You must be logged in to update an issue");
//       return;
//     }

//     const validStatuses = ["pending", "in-progress", "resolved"];
//     if (formData.status && !validStatuses.includes(formData.status)) {
//       toast.error("Invalid rating selected");
//       return;
//     }

//     if (formData.rating < 0 || formData.rating > 5) {
//       toast.error("Invalid rating selected");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) toast.error("No authentication token found");

//       const payload = {};
//       if (
//         formData.status &&
//         formData.status !== selectedIssue.status &&
//         e !== "reopen"
//       ) {
//         payload.status = formData.status;
//       }
//       const currentRating = selectedIssue.rating ?? 0;
//       if (formData.rating !== currentRating) {
//         payload.rating = formData.rating;
//       }
//       if (formData.feedback && formData.feedback !== selectedIssue.feedback) {
//         payload.feedback = formData.feedback;
//       }
//       if (formData.comment) {
//         payload.comments = formData.comment;
//       }

//       if (Object.keys(payload).length === 0) {
//         toast.error("No changes detected.");
//         setIsModalOpen(false);
//         return;
//       }

//       // console.log("Payload being sent to API:", payload);

//       // Perform the update
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/issues/${selectedIssue._id}`,
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
//         toast.error(
//           data.message || `Failed to update task: ${response.statusText}`
//         );
//       }

//       // Update the issues state with the new data
//       setIssues((prevIssues) => {
//         const updated = data?.issue;
//         if (!updated?._id) return prevIssues;

//         const exists = prevIssues.some((issue) => issue._id === updated._id);

//         if (exists) {
//           return prevIssues.map((issue) =>
//             issue._id === updated._id ? updated : issue
//           );
//         } else {
//           return [...prevIssues, updated];
//         }
//       });

//       const effectiveRating =
//         payload.rating !== undefined ? payload.rating : currentRating;
//       if (effectiveRating <= 2.5 && payload.rating !== undefined) {
//         if (e !== "reopen") {
//           setShowConfirmation(true);
//           setReopenIssue(data.issue); // Use the updated issue
//         }
//       } else {
//         setIsModalOpen(false);
//         setFormData({ status: "", rating: 0, feedback: "", comment: "" });
//         setSelectedIssue(null);
//         toast.success("Task updated successfully!");
//       }
//     } catch (err) {
//       console.error("Update issue error:", err);
//       toast.error(err.message || "Failed to update task");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleConfirmation = async (reopen) => {
//     setShowConfirmation(false);

//     if (reopen) {
//       setIsLoading(true);
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) toast.error("No authentication token found");
//         // Call the reopen endpoint
//         const response = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/issues/${
//             reopenIssue._id
//           }/reopen`,
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
//           toast.error(
//             data.message || `Failed to reopen task: ${response.statusText}`
//           );
//         }

//         handleUpdateIssue("reopen");

//         toast.success("Task reopened successfully!");
//       } catch (err) {
//         console.error("Reopen issue error:", err);
//         toast.error(err.message || "Failed to reopen task");
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     // Close the modal and reset form regardless of reopen choice
//     setIsModalOpen(false);
//     setFormData({ status: "", rating: 0, feedback: "", comment: "" });
//     setSelectedIssue(null);
//   };

//   // const handleTabClick = (tab) => {
//   //   setActiveTab(tab);
//   // };

//   const filteredIssues =
//     filterStatus === "All"
//       ? issues
//       : issues.filter((issue) => issue?.status === filterStatus.toLowerCase());

//   const getAttachmentUrl = (attachment) => {
//     if (!attachment) return null;
//     if (attachment.startsWith("http")) return attachment;
//     return `${import.meta.env.VITE_BACKEND_URL}/${attachment}`;
//   };

//   // const truncateDescription = (description) => {
//   //   if (!description) return "";
//   //   const words = description?.title.trim().split(" ");
//   //   if (words.length <= 2) return description?.title;
//   //   return `${words.slice(0, 2).join(" ")}...`;
//   // };

//   // const renderStars = (rating) => {
//   //   if (rating === null || rating === undefined || rating === 0) {
//   //     return (
//   //       <div className="flex">
//   //         {[1, 2, 3, 4, 5].map((star) => (
//   //           <FaStar key={star} className="w-4 h-4 text-gray-300" />
//   //         ))}
//   //       </div>
//   //     );
//   //   }
//   //   return (
//   //     <div className="flex">
//   //       {[1, 2, 3, 4, 5].map((star) => {
//   //         const starValue = star;
//   //         if (rating >= starValue) {
//   //           return <FaStar key={star} className="w-4 h-4 text-yellow-400" />;
//   //         } else if (rating >= starValue - 0.5) {
//   //           return (
//   //             <FaStarHalfStroke
//   //               key={star}
//   //               className="w-4 h-4 text-yellow-400"
//   //             />
//   //           );
//   //         } else {
//   //           return <FaStar key={star} className="w-4 h-4 text-gray-300" />;
//   //         }
//   //       })}
//   //     </div>
//   //   );
//   // };

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

//   const handleEditFeedbackStarClick = (starIndex) => {
//     const starValue = starIndex + 1;
//     const currentRating = editingFeedback?.rating ?? 0;
//     let newRating;
//     if (currentRating === starValue) newRating = starValue - 0.5;
//     else if (currentRating === starValue - 0.5) newRating = starValue;
//     else newRating = starValue - 0.5;
//     setEditingFeedback((prev) => ({ ...prev, rating: newRating }));
//   };

//   const handleEditFeedback = (fb) => {
//     setEditingFeedback({
//       id: fb._id,
//       feedback: fb.feedback || "",
//       rating: fb.rating || 0,
//     });
//   };

//   const handleSaveFeedback = async () => {
//     if (!editingFeedback?.id || !selectedIssue?._id) return;
//     setEditLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/issues/${
//           selectedIssue._id
//         }/feedback/${editingFeedback.id}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             feedback: editingFeedback.feedback,
//             rating: editingFeedback.rating,
//           }),
//         }
//       );
//       const data = await response.json();
//       if (!response.ok) {
//         toast.error(data.message || "Failed to update feedback");
//         return;
//       }
//       setSelectedIssue((prev) => ({
//         ...prev,
//         feedbacks: prev.feedbacks.map((fb) =>
//           fb._id === editingFeedback.id
//             ? {
//                 ...fb,
//                 feedback: editingFeedback.feedback,
//                 rating: editingFeedback.rating,
//               }
//             : fb
//         ),
//       }));
//       setIssues((prevIssues) =>
//         prevIssues.map((issue) =>
//           issue._id === selectedIssue._id
//             ? {
//                 ...issue,
//                 feedbacks: issue.feedbacks.map((fb) =>
//                   fb._id === editingFeedback.id
//                     ? {
//                         ...fb,
//                         feedback: editingFeedback.feedback,
//                         rating: editingFeedback.rating,
//                       }
//                     : fb
//                 ),
//               }
//             : issue
//         )
//       );
//       toast.success("Feedback updated successfully!");
//       setEditingFeedback(null);
//     } catch (err) {
//       toast.error(err.message || "Failed to update feedback");
//     } finally {
//       setEditLoading(false);
//     }
//   };

//   const handleEditComment = (comment) => {
//     setEditingComment({ id: comment._id, text: comment.text || "" });
//   };

//   const handleSaveComment = async () => {
//     if (!editingComment?.id || !selectedIssue?._id) return;
//     setEditLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/issues/${
//           selectedIssue._id
//         }/comment/${editingComment.id}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ text: editingComment.text }),
//         }
//       );
//       const data = await response.json();
//       if (!response.ok) {
//         toast.error(data.message || "Failed to update comment");
//         return;
//       }
//       setSelectedIssue((prev) => ({
//         ...prev,
//         comments: prev.comments.map((c) =>
//           c._id === editingComment.id ? { ...c, text: editingComment.text } : c
//         ),
//       }));
//       setIssues((prevIssues) =>
//         prevIssues.map((issue) =>
//           issue._id === selectedIssue._id
//             ? {
//                 ...issue,
//                 comments: issue.comments.map((c) =>
//                   c._id === editingComment.id
//                     ? { ...c, text: editingComment.text }
//                     : c
//                 ),
//               }
//             : issue
//         )
//       );
//       toast.success("Comment updated successfully!");
//       setEditingComment(null);
//     } catch (err) {
//       toast.error(err.message || "Failed to update comment");
//     } finally {
//       setEditLoading(false);
//     }
//   };

//   const isWithin5Minutes = (dateString) => {
//     if (!dateString) return false;
//     const created = new Date(dateString);
//     const now = new Date();
//     return (now - created) / 1000 / 60 < 5;
//   };
//   useEffect(() => {
//     if (user) fetchAnalytics(analyticsType);
//   }, [analyticsType]);

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
//                 <option value="in-Progress">In Progress</option>
//                 <option value="Resolved">Resolved</option>
//               </select>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                 <IoChevronDown className="text-gray-400" size={12} />
//               </div>
//             </div>
//           </div>

//           <div className="p-6">
//             <div className="bg-white shadow rounded-lg overflow-hidden">
//               <div
//                 className="overflow-x-auto overflow-y-auto"
//                 style={{ maxHeight: "400px" }}
//               >
//                 <table className="w-full text-xs min-w-[1200px]">
//                   <thead className="bg-gray-100 truncate">
//                     <tr className="text-gray-800">
//                       <th className="p-3 text-left text-sm font-medium">
//                         Issue ID
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         Assigned By
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         Branch
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         Department
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         Assigned To
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         Further Assigned To
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         Description
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         Status
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         Priority
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         Attachment
//                       </th>
//                       <th className="p-3 text-left text-sm font-medium">
//                         FeedBack
//                       </th>
//                       {/* <th className="p-3 text-left text-sm font-medium">
//                         Rating
//                       </th> */}
//                       <th className="p-3 text-left text-sm font-medium">
//                         Comments
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {isLoading ? (
//                       <tr>
//                         <td
//                           colSpan="10"
//                           className="p-6 text-center text-gray-600"
//                         >
//                           <Loading />
//                         </td>
//                       </tr>
//                     ) : filteredIssues.length === 0 ? (
//                       <tr>
//                         <td
//                           colSpan="10"
//                           className="p-6 text-center text-gray-600"
//                         >
//                           No tasks available
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredIssues.map((issue) =>
//                         issue ? (
//                           <tr
//                             key={issue._id}
//                             className={`border-b border-gray-100 cursor-pointer  ${
//                               issue.status === "resolved"
//                                 ? "bg-[#8b68b7] text-white"
//                                 : ""
//                             }`}
//                             onClick={() => handleViewIssue(issue)}
//                           >
//                             <td
//                               className={`p-3 text-sm truncate ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               } `}
//                             >
//                               {issue?.issueId || "N/A"}
//                             </td>
//                             <td
//                               className={`p-3 text-sm truncate ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               } `}
//                             >
//                               {issue.createdBy?.name || "N/A"}
//                             </td>
//                             <td
//                               className={`p-3 text-sm truncate ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               } `}
//                             >
//                               {issue.branch
//                                 ? `${issue.branch.branchName}`
//                                 : "N/A"}
//                             </td>
//                             <td
//                               className={`p-3 text-sm truncate ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               } `}
//                             >
//                               {issue.department
//                                 ? `${issue.department.departmentName}`
//                                 : "N/A"}
//                             </td>
//                             <td
//                               className={`p-3  ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               } `}
//                             >
//                               {issue.assignedTo
//                                 ? `${issue.assignedTo.name} (${issue.assignedTo.email})`
//                                 : "N/A"}
//                             </td>
//                             <td
//                               className={`p-3 text-sm truncate ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               }`}
//                               title={
//                                 Array.isArray(issue.furtherAssignedTo) &&
//                                 issue.furtherAssignedTo.length > 0
//                                   ? issue.furtherAssignedTo
//                                       .map((a) => `${a.name} (${a.email})`)
//                                       .join(", ")
//                                   : "N/A"
//                               }
//                             >
//                               {Array.isArray(issue.furtherAssignedTo) &&
//                               issue.furtherAssignedTo.length > 0
//                                 ? issue.furtherAssignedTo
//                                     .map((a) => a.name || a)
//                                     .join(", ")
//                                 : "N/A"}
//                             </td>
//                             <td
//                               className={`p-3 text-sm ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               }`}
//                               title={
//                                 issue.descriptions?.length > 0
//                                   ? issue.descriptions
//                                       .map((d) => d.description)
//                                       .join(", ")
//                                   : "N/A"
//                               }
//                             >
//                               <div className="max-w-[200px] truncate">
//                                 {issue.descriptions?.length > 0
//                                   ? issue.descriptions[0].description
//                                   : "N/A"}
//                               </div>
//                             </td>
//                             <td
//                               className={`p-3 truncate ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               } `}
//                             >
//                               {issue.status.charAt(0).toUpperCase() +
//                                 issue.status.slice(1) || "N/A"}
//                             </td>
//                             <td className="p-3 text-gray-600">
//                               {issue.priority ? (
//                                 <span
//                                   className={`inline-block w-20 text-center px-2 py-1 rounded text-white text-xs ${
//                                     issue.priority === "High"
//                                       ? "bg-[#BE2C30]"
//                                       : issue.priority === "Medium"
//                                       ? "bg-[#CC610B]"
//                                       : issue.priority === "Low"
//                                       ? "bg-[#2E8310]"
//                                       : "bg-gray-500"
//                                   }`}
//                                 >
//                                   {issue.priority}
//                                 </span>
//                               ) : (
//                                 "N/A"
//                               )}
//                             </td>
//                             <td className="p-3 text-gray-600">
//                               {issue.attachment ? (
//                                 <a
//                                   href={getAttachmentUrl(issue.attachment)}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="text-blue-600 hover:underline"
//                                   onClick={(e) => e.stopPropagation()}
//                                 >
//                                   View
//                                 </a>
//                               ) : (
//                                 "None"
//                               )}
//                             </td>

//                             <td
//                               className={`p-3 truncate ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               }`}
//                             >
//                               {issue.feedbacks && issue.feedbacks.length > 0
//                                 ? issue.feedbacks[issue.feedbacks.length - 1]
//                                     .feedback || "N/A"
//                                 : "N/A"}
//                             </td>

//                             {/* <td
//                             className={`p-3 ${
//                               issue.status === "resolved"
//                                 ? "text-white"
//                                 : "text-gray-600"
//                             } `}
//                           >
//                             {renderStars(issue.rating)}
//                           </td> */}
//                             <td
//                               className={`p-3 text-sm truncate ${
//                                 issue.status === "resolved"
//                                   ? "text-white"
//                                   : "text-gray-600"
//                               } `}
//                             >
//                               {Array.isArray(issue.comments) &&
//                               issue.comments.length > 0
//                                 ? issue.comments[issue.comments.length - 1].text
//                                 : "N/A"}
//                             </td>
//                           </tr>
//                         ) : null
//                       )
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//               {isLoading && (
//                 <div className="p-4 text-gray-600 text-center"></div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Modal for Task Details */}
//         {isModalOpen && selectedIssue && (
//           <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg px-6 py-4 w-full max-w-3xl h-[80vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold">Task Details</h2>
//               </div>
//               <div>
//                 <p>
//                   <strong>Issue Id:</strong> {selectedIssue.issueId || "N/A"}
//                 </p>
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
//                   <strong>Further Assigned To:</strong>{" "}
//                   {Array.isArray(selectedIssue.furtherAssignedTo) &&
//                   selectedIssue.furtherAssignedTo.length > 0
//                     ? selectedIssue.furtherAssignedTo
//                         .map((a) => a.name || a)
//                         .join(", ")
//                     : "N/A"}
//                 </p>
//                 <div className="mt-4">
//                   <h3 className="text-lg font-semibold mb-2">Descriptions</h3>

//                   {selectedIssue?.descriptions?.length > 0 ? (
//                     <div className="border border-gray-300 rounded overflow-hidden">
//                       <div className="max-h-40 overflow-y-auto">
//                         <table className="w-full text-sm">
//                           <thead className="bg-gray-100 sticky top-0">
//                             <tr>
//                               <th className="p-2 text-left">#</th>
//                               <th className="p-2 text-left">Description</th>
//                               <th className="p-2 text-left">Type</th>
//                               <th className="p-2 text-left">Created At</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {selectedIssue.descriptions.map((d, index) => (
//                               <tr
//                                 key={d._id || index}
//                                 className="border-t border-gray-300"
//                               >
//                                 <td className="p-2">{index + 1}</td>
//                                 <td className="p-2 break-words max-w-[250px]">
//                                   {d.description}
//                                 </td>
//                                 <td className="p-2">{d.type || "-"}</td>
//                                 <td className="p-2">
//                                   {d.createdAt
//                                     ? new Date(d.createdAt).toLocaleString()
//                                     : "-"}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="text-sm text-gray-500">
//                       No description provided
//                     </p>
//                   )}
//                 </div>
//                 <div className="mt-4">
//                   <p>
//                     <strong>TimeLine:</strong>{" "}
//                     {selectedIssue?.description?.timeline || "N/A"}-
//                     {selectedIssue?.description?.timeUnit}
//                   </p>
//                   <p>
//                     <strong>Status:</strong> {selectedIssue.status || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Priority:</strong> {selectedIssue.priority || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Attachment:</strong>{" "}
//                     {selectedIssue.attachment ? (
//                       <a
//                         href={getAttachmentUrl(selectedIssue.attachment)}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 hover:underline"
//                       >
//                         View
//                       </a>
//                     ) : (
//                       "None"
//                     )}
//                   </p>
//                   <p>
//                     <strong>Created At:</strong>{" "}
//                     {selectedIssue.createdAt
//                       ? new Date(selectedIssue.createdAt).toLocaleString()
//                       : "N/A"}
//                   </p>
//                 </div>
//                 <div className="mt-4">
//                   <h3 className="text-lg font-semibold mb-2">Feedback</h3>

//                   {Array.isArray(selectedIssue.feedbacks) &&
//                   selectedIssue.feedbacks.length > 0 ? (
//                     <div className="border border-gray-300 rounded overflow-hidden">
//                       <div className="max-h-30 overflow-y-auto">
//                         <table className="w-full text-sm">
//                           <thead className="bg-gray-100 sticky top-0">
//                             <tr>
//                               <th className="p-2 text-left">#</th>
//                               <th className="p-2 text-left">Feedback</th>
//                               <th className="p-2 text-center">Rating</th>
//                               <th className="p-2 text-center">Edit</th>
//                             </tr>
//                           </thead>

//                           <tbody>
//                             {selectedIssue.feedbacks.map((fb, index) => (
//                               <tr
//                                 key={fb._id || index}
//                                 className="border-t border-gray-300"
//                               >
//                                 <td className="p-2">{index + 1}</td>
//                                 <td className="p-2 break-words max-w-[220px]">
//                                   {editingFeedback?.id === fb._id ? (
//                                     <textarea
//                                       className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
//                                       rows={3}
//                                       value={editingFeedback.feedback}
//                                       onChange={(e) =>
//                                         setEditingFeedback((prev) => ({
//                                           ...prev,
//                                           feedback: e.target.value,
//                                         }))
//                                       }
//                                     />
//                                   ) : (
//                                     fb.feedback || "No feedback"
//                                   )}
//                                 </td>
//                                 <td className="p-2 text-center">
//                                   {editingFeedback?.id === fb._id ? (
//                                     <div className="flex justify-center">
//                                       {renderEditableStars(
//                                         editingFeedback.rating,
//                                         handleEditFeedbackStarClick
//                                       )}
//                                     </div>
//                                   ) : (
//                                     <span className="text-yellow-500">
//                                       {fb.rating ? `⭐ ${fb.rating}/5` : "-"}
//                                     </span>
//                                   )}
//                                 </td>
//                                 <td className="p-2 text-center">
//                                   {editingFeedback?.id === fb._id ? (
//                                     <div className="flex items-center justify-center gap-2">
//                                       <button
//                                         type="button"
//                                         onClick={handleSaveFeedback}
//                                         disabled={editLoading}
//                                         className="text-green-600 hover:text-green-800 disabled:opacity-50"
//                                         title="Save"
//                                       >
//                                         {editLoading ? (
//                                           <span className="inline-block h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
//                                         ) : (
//                                           <MdCheck className="w-5 h-5" />
//                                         )}
//                                       </button>
//                                       <button
//                                         type="button"
//                                         onClick={() => setEditingFeedback(null)}
//                                         disabled={editLoading}
//                                         className="text-red-500 hover:text-red-700 disabled:opacity-50"
//                                         title="Cancel"
//                                       >
//                                         <MdClose className="w-5 h-5" />
//                                       </button>
//                                     </div>
//                                   ) : (
//                                     user?._id &&
//                                     fb.createdBy?._id?.toString() ===
//                                       user._id.toString() && (
//                                       <button
//                                         type="button"
//                                         onClick={() => handleEditFeedback(fb)}
//                                         disabled={
//                                           !isWithin5Minutes(fb.createdAt)
//                                         }
//                                         title={
//                                           !isWithin5Minutes(fb.createdAt)
//                                             ? "Edit window has expired (5 min)"
//                                             : "Edit feedback"
//                                         }
//                                         className={`${
//                                           !isWithin5Minutes(fb.createdAt)
//                                             ? "text-gray-300 cursor-not-allowed"
//                                             : "text-blue-600 hover:text-blue-800"
//                                         }`}
//                                       >
//                                         <FaEdit />
//                                       </button>
//                                     )
//                                   )}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="text-sm text-gray-500">
//                       No feedback provided
//                     </p>
//                   )}
//                 </div>

//                 <div className="mt-4">
//                   <h3 className="text-lg font-semibold mb-2">Comments</h3>

//                   {Array.isArray(selectedIssue.comments) &&
//                   selectedIssue.comments.length > 0 ? (
//                     <div className="border border-gray-300 rounded overflow-hidden">
//                       <div className="max-h-30 overflow-y-auto">
//                         <table className="w-full text-sm">
//                           <thead className="bg-gray-100 sticky top-0">
//                             <tr>
//                               <th className="p-2 text-left">#</th>
//                               <th className="p-2 text-left">Comment</th>
//                               <th className="p-2 text-left">Date</th>
//                               <th className="p-2 text-center">Edit</th>
//                             </tr>
//                           </thead>

//                           <tbody>
//                             {selectedIssue.comments.map((comment, index) => (
//                               <tr
//                                 key={comment._id || index}
//                                 className="border-t border-gray-300"
//                               >
//                                 <td className="p-2">{index + 1}</td>
//                                 <td className="p-2 break-words max-w-[200px]">
//                                   {editingComment?.id === comment._id ? (
//                                     <textarea
//                                       className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
//                                       rows={3}
//                                       value={editingComment.text}
//                                       onChange={(e) =>
//                                         setEditingComment((prev) => ({
//                                           ...prev,
//                                           text: e.target.value,
//                                         }))
//                                       }
//                                     />
//                                   ) : (
//                                     comment.text || "No comment"
//                                   )}
//                                 </td>
//                                 <td className="p-2 text-xs text-gray-500">
//                                   {comment.commentedAt
//                                     ? new Date(
//                                         comment.commentedAt
//                                       ).toLocaleString()
//                                     : ""}
//                                 </td>
//                                 <td className="p-2 text-center">
//                                   {editingComment?.id === comment._id ? (
//                                     <div className="flex items-center justify-center gap-2">
//                                       <button
//                                         type="button"
//                                         onClick={handleSaveComment}
//                                         disabled={editLoading}
//                                         className="text-green-600 hover:text-green-800 disabled:opacity-50"
//                                         title="Save"
//                                       >
//                                         {editLoading ? (
//                                           <span className="inline-block h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
//                                         ) : (
//                                           <MdCheck className="w-5 h-5" />
//                                         )}
//                                       </button>
//                                       <button
//                                         type="button"
//                                         onClick={() => setEditingComment(null)}
//                                         disabled={editLoading}
//                                         className="text-red-500 hover:text-red-700 disabled:opacity-50"
//                                         title="Cancel"
//                                       >
//                                         <MdClose className="w-5 h-5" />
//                                       </button>
//                                     </div>
//                                   ) : (
//                                     user?._id &&
//                                     comment.commentedBy?._id?.toString() ===
//                                       user._id.toString() && (
//                                       <button
//                                         type="button"
//                                         onClick={() =>
//                                           handleEditComment(comment)
//                                         }
//                                         disabled={
//                                           !isWithin5Minutes(comment.commentedAt)
//                                         }
//                                         title={
//                                           !isWithin5Minutes(comment.commentedAt)
//                                             ? "Edit window has expired (5 min)"
//                                             : "Edit comment"
//                                         }
//                                         className={`${
//                                           !isWithin5Minutes(comment.commentedAt)
//                                             ? "text-gray-300 cursor-not-allowed"
//                                             : "text-blue-600 hover:text-blue-800"
//                                         }`}
//                                       >
//                                         <FaEdit />
//                                       </button>
//                                     )
//                                   )}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="text-sm text-gray-500">No comments yet</p>
//                   )}
//                 </div>
//                 {user ? (
//                   (() => {
//                     const isSuperAdminOrAdmin =
//                       user.roles &&
//                       (user.roles.includes("SuperAdmin") ||
//                         user.roles.includes("Admin"));
//                     const isAssignee =
//                       selectedIssue.assignedTo?._id?.toString() ===
//                       user._id?.toString();

//                     const isFurtherAssignee =
//                       Array.isArray(selectedIssue.furtherAssignedTo) &&
//                       selectedIssue.furtherAssignedTo.some(
//                         (a) => (a._id || a)?.toString() === user._id?.toString()
//                       );
//                     const isCreator =
//                       selectedIssue.createdBy &&
//                       selectedIssue.createdBy._id &&
//                       user._id &&
//                       selectedIssue.createdBy._id.toString() ===
//                         user._id.toString();
//                     const canUpdateStatus =
//                       isSuperAdminOrAdmin || isAssignee || isFurtherAssignee;
//                     const canUpdateRating = isSuperAdminOrAdmin || isCreator;
//                     const canUpdateFeedback = isSuperAdminOrAdmin || isCreator;
//                     const canAddComment = isAssignee || isFurtherAssignee;

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
//                                 className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
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
//                               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//                               rows="4"
//                               placeholder="Enter feedback here..."
//                             />
//                           </div>
//                         )}
//                         {canAddComment && (
//                           <div className="mb-4">
//                             <label
//                               htmlFor="modalComment"
//                               className="block text-sm font-medium mb-1"
//                             >
//                               Add Comment
//                             </label>
//                             <textarea
//                               id="modalComment"
//                               name="comment"
//                               value={formData.comment}
//                               onChange={(e) =>
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   comment: e.target.value,
//                                 }))
//                               }
//                               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//                               rows="3"
//                               placeholder="Enter your comment here..."
//                             />
//                           </div>
//                         )}
//                         {canUpdateStatus ||
//                         canUpdateRating ||
//                         canUpdateFeedback ||
//                         canAddComment ? (
//                           <div className="flex justify-end space-x-4">
//                             <button
//                               type="button"
//                               onClick={() => setIsModalOpen(false)}
//                               className="bg-black cursor-pointer text-white px-4 py-2 rounded-md "
//                             >
//                               Cancel
//                             </button>
//                             <button
//                               type="submit"
//                               disabled={isLoading}
//                               className={`bg-primary cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center gap-2
//     ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
//   `}
//                             >
//                               {isLoading && (
//                                 <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
//                               )}
//                               <span>
//                                 {isLoading ? "Updating..." : "Update Task"}
//                               </span>
//                             </button>
//                           </div>
//                         ) : (
//                           <div className="mt-4">
//                             <p className="text-red-600 text-sm mb-4">
//                               You are not authorized to update this task or add
//                               comments.
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
//                       You must be logged in to update the task or add comments.
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
//                 (These are to help you start using BUGBUSTER)
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
//               <h3 className="text-lg font-semibold">Task Status Snapshot</h3>
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
//                     {paymentSnapshotData.statuses && (
//                       <>
//                         <path
//                           d="M18 2.0845 a 15.9155 15.9155 0 0 1 11.28 4.5"
//                           fill="none"
//                           stroke="#F97316"
//                           strokeWidth="3.5"
//                           strokeDasharray={`${
//                             paymentSnapshotData.statuses[0]?.percentage?.replace(
//                               "%",
//                               ""
//                             ) || 0
//                           }, 100`}
//                         />
//                         <path
//                           d="M18 2.0845 a 15.9155 15.9155 0 0 1 11.28 4.5"
//                           fill="none"
//                           stroke="#3B82F6"
//                           strokeWidth="3.5"
//                           strokeDasharray={`${
//                             paymentSnapshotData.statuses[1]?.percentage?.replace(
//                               "%",
//                               ""
//                             ) || 0
//                           }, 100`}
//                           transform="rotate(120, 18, 18)"
//                         />
//                         <path
//                           d="M18 2.0845 a 15.9155 15.9155 0 0 1 11.28 4.5"
//                           fill="none"
//                           stroke="#10B981"
//                           strokeWidth="3.5"
//                           strokeDasharray={`${
//                             paymentSnapshotData.statuses[2]?.percentage?.replace(
//                               "%",
//                               ""
//                             ) || 0
//                           }, 100`}
//                           transform="rotate(240, 18, 18)"
//                         />
//                       </>
//                     )}
//                   </svg>
//                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
//                     <p className="text-[10px] text-gray-400 font-medium">
//                       Tasks
//                     </p>
//                     <p className="text-xl font-bold text-gray-800">
//                       {paymentSnapshotData.total || 0}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 {paymentSnapshotData.statuses ? (
//                   paymentSnapshotData.statuses.map((item, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between"
//                     >
//                       <div className="flex items-center space-x-2">
//                         <span
//                           className={`w-2 h-2 ${item.color} rounded-full`}
//                         ></span>
//                         <span className="text-xs text-gray-600">
//                           {item.label}
//                         </span>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         <span className="text-xs font-semibold text-gray-800">
//                           {item.value}
//                         </span>
//                         <span className="text-[10px] text-green-500">
//                           {item.percentage}
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-xs text-gray-600">
//                     No status data available
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Middle Section: Revenue and Expense, Vendors */}
//         {/* Middle Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           {/* Daily Ticket Trend */}
//           <div className="bg-white rounded-lg shadow">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
//               <h3 className="text-lg font-semibold">Ticket Trend</h3>
//               <select
//                 value={analyticsType}
//                 onChange={(e) => {
//                   setAnalyticsType(e.target.value);
//                   fetchAnalytics(e.target.value);
//                 }}
//                 className="border bg-white rounded p-1 text-sm text-gray-800"
//               >
//                 <option value="daily">Daily</option>
//                 <option value="monthly">Monthly</option>
//                 <option value="yearly">Yearly</option>
//               </select>
//             </div>
//             <div className="p-4 h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart
//                   data={(() => {
//                     const stats = analytics?.dateStats || [];
//                     if (analyticsType === "daily") {
//                       return stats.map((d) => ({
//                         name: `${d.dayName?.slice(0, 3)} ${d.day}`,
//                         count: d.count,
//                       }));
//                     }
//                     if (analyticsType === "monthly") {
//                       return stats.map((d) => ({
//                         name: d.monthName?.slice(0, 3) || `M${d.month}`,
//                         count: d.count,
//                       }));
//                     }
//                     if (analyticsType === "yearly") {
//                       return stats.map((d) => ({
//                         name: String(d.year),
//                         count: d.count,
//                       }));
//                     }
//                     return stats;
//                   })()}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                   <XAxis
//                     dataKey="name"
//                     tick={{ fontSize: 10 }}
//                     interval={analyticsType === "daily" ? 4 : 0}
//                     angle={analyticsType === "daily" ? -35 : 0}
//                     textAnchor={analyticsType === "daily" ? "end" : "middle"}
//                     height={analyticsType === "daily" ? 40 : 20}
//                   />
//                   <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                   <Tooltip />
//                   <Line
//                     type="monotone"
//                     dataKey="count"
//                     stroke="#F97316"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     name="Tickets"
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Priority Breakdown */}
//           <div className="bg-white rounded-lg shadow">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
//               <h3 className="text-lg font-semibold">Priority Breakdown</h3>
//             </div>
//             <div className="p-4 h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart
//                   data={(analytics?.priorityStats || []).map((p) => ({
//                     name: p.priority,
//                     count: p.count,
//                   }))}
//                 >
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     stroke="#f3f4f6"
//                     vertical={false}
//                   />
//                   <XAxis dataKey="name" tick={{ fontSize: 11 }} />
//                   <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
//                   <Tooltip />
//                   <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tickets">
//                     {(analytics?.priorityStats || []).map((entry, i) => (
//                       <Cell
//                         key={i}
//                         fill={
//                           entry.priority === "High"
//                             ? "#ef4444"
//                             : entry.priority === "Medium"
//                             ? "#f97316"
//                             : "#22c55e"
//                         }
//                       />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Section: Activity Log, Customers */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           {/* Assigned Tasks */}
//           <div className="relative bg-white rounded-lg shadow h-[430px] flex flex-col">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
//               <h3 className="text-lg font-semibold">Assigned Tasks</h3>
//             </div>

//             {/* Scrollable Table Container */}
//             <div className="p-6 overflow-y-auto no-scrollbar flex-1">
//               <table className="w-full text-xs table-fixed">
//                 <thead>
//                   <tr className="text-left text-gray-400 border-b border-gray-200">
//                     <th className="pb-3 w-1/4">Assigned By</th>
//                     <th className="pb-3 w-1/4">Assigned To</th>
//                     <th className="pb-3 w-1/4">Status</th>
//                     <th className="pb-3 w-1/4">Date & Time</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {combinedActivityLogData.length > 0 ? (
//                     combinedActivityLogData.map((log, index) => (
//                       <tr key={index} className="border-b border-gray-100">
//                         <td className="py-4 text-gray-600">{log.assignedBy}</td>
//                         <td className="py-4">{log.assignedTo}</td>
//                         <td className="py-4 text-gray-600">{log.status}</td>
//                         <td className="py-4 text-gray-600">{log.dateTime}</td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan="4"
//                         className="py-4 text-gray-600 text-center"
//                       >
//                         No activities available
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Loader Overlay */}
//             {isLoading && (
//               <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
//                 <Loading />
//               </div>
//             )}
//           </div>

//           {/* Customers */}
//           {/* Replace the Customers div with: */}
//           <div className="bg-white rounded-lg shadow h-[430px] flex flex-col">
//             <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
//               <h3 className="text-lg font-semibold">Status Distribution</h3>
//             </div>
//             <div className="p-4 flex-1">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={(analytics?.statusStats || []).map((s) => ({
//                       name: s.status,
//                       value: s.count,
//                     }))}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={70}
//                     outerRadius={110}
//                     paddingAngle={3}
//                     dataKey="value"
//                   >
//                     {(analytics?.statusStats || []).map((entry, i) => (
//                       <Cell
//                         key={i}
//                         fill={
//                           entry.status === "resolved"
//                             ? "#10b981"
//                             : entry.status === "in-progress"
//                             ? "#6366f1"
//                             : "#f59e0b"
//                         }
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;

//current
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";

import { FaEdit } from "react-icons/fa";
import { MdCheck, MdClose } from "react-icons/md";
import { FaScaleBalanced, FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoChevronDown, IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { BsFillBugFill } from "react-icons/bs";
import { SiGoogletasks } from "react-icons/si";
import { TiThList } from "react-icons/ti";
import toast from "react-hot-toast";
import Loading from "../../Components/Loading";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const generalTasksData = [
  {
    icon: <BsFillBugFill className="w-6 h-6 text-blue-500" />,
    text: (
      <span>
        You don't have any tasks.{" "}
        <Link to={"/issue-desk"} className="underline cursor-pointer">
          Click here
        </Link>{" "}
        to add one.
      </span>
    ),
  },
  {
    icon: <SiGoogletasks className="w-6 h-6 text-blue-500" />,
    text: (
      <span>
        Want to view tasks you assigned to others?{" "}
        <Link to={"/assigned-tasks"} className="underline cursor-pointer">
          Click here
        </Link>
        .
      </span>
    ),
  },
  {
    icon: <TiThList className="w-6 h-6 text-blue-500" />,
    text: (
      <span>
        Want to view tasks assigned to you?{" "}
        <Link to={"/my-tasks"} className="underline cursor-pointer">
          Click here
        </Link>
        .
      </span>
    ),
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

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Confirmation</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-black cursor-pointer text-white px-4 py-2 rounded-md"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const EMPTY_FILTERS = {
  search: "",
  status: "All",
  priority: "All",
  branch: "All",
  department: "All",
  startDate: "",
  endDate: "",
  assignedToMe: false, // sends ?assignedTo=userId
  assignedByMe: false, // sends ?createdBy=userId
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    rating: 0,
    feedback: "",
    comment: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reopenIssue, setReopenIssue] = useState();

  // inline editing
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsType, setAnalyticsType] = useState("daily");

  // activity log
  const [assignedTasks, setAssignedTasks] = useState([]);

  // ── Filters ────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Keep an unfiltered copy just for populating branch/dept dropdowns
  const [allIssues, setAllIssues] = useState([]);

  const debouncedSearch = useDebounce(filters.search, 500);

  const uniqueBranches = useMemo(() => {
    const map = new Map();
    allIssues.forEach((i) => {
      if (i?.branch?._id) map.set(i.branch._id, i.branch.branchName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allIssues]);

  const uniqueDepartments = useMemo(() => {
    const map = new Map();
    allIssues.forEach((i) => {
      if (i?.department?._id)
        map.set(i.department._id, i.department.departmentName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allIssues]);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(([k, v]) => {
        if (["status", "branch", "department", "priority"].includes(k))
          return v !== "All";
        if (typeof v === "boolean") return v;
        if (typeof v === "string") return v.trim() !== "";
        return false;
      }).length,
    [filters]
  );

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  // ── Load user ────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        toast.error("Failed to parse user data");
      }
    }
  }, []);

  // ── Build API query params from current filters ───────────────────────
  const buildParams = useCallback(
    (overrideSearch) => {
      const params = new URLSearchParams();
      const isAdmin =
        user?.roles?.includes("SuperAdmin") || user?.roles?.includes("Admin");
      const search =
        overrideSearch !== undefined ? overrideSearch : filters.search;

      // Default scoping for non-admins when no role toggle is active
      if (!isAdmin && !filters.assignedToMe && !filters.assignedByMe) {
        params.append("assignedTo", user._id);
        params.append("createdBy", user._id);
      }

      // "Assigned to Me" → ?assignedTo=myId
      if (filters.assignedToMe && user?._id)
        params.append("assignedTo", user._id);

      // "Assigned by Me" → ?createdBy=myId
      if (filters.assignedByMe && user?._id)
        params.append("createdBy", user._id);

      // Search — maps to API's `search` param (searches userName, name, etc.)
      if (search.trim()) params.append("search", search.trim());

      // Status
      if (filters.status !== "All") params.append("status", filters.status);

      // Priority
      if (filters.priority !== "All")
        params.append("priority", filters.priority);

      // Branch / Department IDs
      if (filters.branch !== "All") params.append("branch", filters.branch);
      if (filters.department !== "All")
        params.append("department", filters.department);

      // Date range
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      return params;
    },
    [filters, user]
  );

  // ── Fetch filtered issues ─────────────────────────────────────────────
  const fetchIssues = useCallback(
    async (overrideSearch) => {
      if (!user) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          return;
        }

        const params = buildParams(overrideSearch);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/issues?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          toast.error(`Failed to fetch issues: ${res.statusText}`);
          return;
        }
        const data = await res.json();
        setIssues(Array.isArray(data) ? data : data.issues || []);
      } catch (err) {
        toast.error(`Failed to fetch issues: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [buildParams, user]
  );

  // Unfiltered fetch — runs once to populate dropdown options
  const fetchAllIssues = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      const isAdmin =
        user?.roles?.includes("SuperAdmin") || user?.roles?.includes("Admin");
      if (!isAdmin) {
        params.append("assignedTo", user._id);
        params.append("createdBy", user._id);
      }
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      setAllIssues(Array.isArray(data) ? data : data.issues || []);
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Activity-log fetch (createdBy me)
  const fetchAssignedTasks = useCallback(async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues?createdBy=${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      setAssignedTasks(Array.isArray(data) ? data : data.issues || []);
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const fetchAnalytics = async (type = "daily") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/issues/analytics/stats?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch analytics");
      setAnalytics(await res.json());
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchAllIssues();
      fetchIssues();
      fetchAssignedTasks();
      fetchAnalytics(analyticsType);
      const iv = setInterval(() => {
        fetchAssignedTasks();
      }, 60000);
      return () => clearInterval(iv);
    }
  }, [user]);

  // Re-fetch when non-search filters change
  useEffect(() => {
    if (!user) return;
    fetchIssues();
  }, [
    filters.status,
    filters.priority,
    filters.branch,
    filters.department,
    filters.startDate,
    filters.endDate,
    filters.assignedToMe,
    filters.assignedByMe,
  ]);

  // Re-fetch when debounced search changes
  const prevSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (!user) return;
    if (prevSearch.current !== debouncedSearch) {
      prevSearch.current = debouncedSearch;
      fetchIssues(debouncedSearch);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (user) fetchAnalytics(analyticsType);
  }, [analyticsType]);

  // ── Snapshot (always from full list) ─────────────────────────────────
  const paymentSnapshotData = useMemo(() => {
    const s = Array.isArray(allIssues) ? allIssues : [];
    const total = s.length;
    const pend = s.filter((i) => i.status === "pending").length;
    const prog = s.filter((i) => i.status === "in-progress").length;
    const res = s.filter((i) => i.status === "resolved").length;
    const pct = (n) => (total > 0 ? ((n / total) * 100).toFixed(2) : 0);
    return {
      total,
      statuses: [
        {
          label: "Pending",
          value: pend,
          percentage: `+${pct(pend)}%`,
          color: "bg-orange-500",
        },
        {
          label: "In Progress",
          value: prog,
          percentage: `+${pct(prog)}%`,
          color: "bg-blue-500",
        },
        {
          label: "Resolved",
          value: res,
          percentage: `+${pct(res)}%`,
          color: "bg-green-500",
        },
      ],
    };
  }, [allIssues]);

  const combinedActivityLogData = assignedTasks.map((issue) => ({
    assignedTo: issue.assignedTo?.name || "N/A",
    assignedBy: issue.createdBy?.name || issue.userName || "N/A",
    status: issue.status || "N/A",
    dateTime: issue.createdAt
      ? new Date(issue.createdAt).toLocaleString()
      : "N/A",
  }));

  // ── Active filter chip list ───────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.search.trim())
      chips.push({ key: "search", label: `Search: "${filters.search}"` });
    if (filters.status !== "All")
      chips.push({ key: "status", label: `Status: ${filters.status}` });
    if (filters.priority !== "All")
      chips.push({ key: "priority", label: `Priority: ${filters.priority}` });
    if (filters.branch !== "All") {
      const b = uniqueBranches.find((x) => x.id === filters.branch);
      chips.push({
        key: "branch",
        label: `Branch: ${b?.name || filters.branch}`,
      });
    }
    if (filters.department !== "All") {
      const d = uniqueDepartments.find((x) => x.id === filters.department);
      chips.push({
        key: "department",
        label: `Dept: ${d?.name || filters.department}`,
      });
    }
    if (filters.startDate)
      chips.push({ key: "startDate", label: `From: ${filters.startDate}` });
    if (filters.endDate)
      chips.push({ key: "endDate", label: `To: ${filters.endDate}` });
    if (filters.assignedToMe)
      chips.push({ key: "assignedToMe", label: "Assigned to Me" });
    if (filters.assignedByMe)
      chips.push({ key: "assignedByMe", label: "Assigned by Me" });
    return chips;
  }, [filters, uniqueBranches, uniqueDepartments]);

  const removeChip = (key) =>
    setFilters((p) => ({ ...p, [key]: EMPTY_FILTERS[key] }));

  // ── Modal / form helpers ──────────────────────────────────────────────
  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setFormData({
      status: issue.status || "",
      rating: issue.rating || 0,
      feedback: issue.feedback || "",
      comment: "",
    });
    setIsModalOpen(true);
  };

  const handleStarClick = (idx) => {
    const sv = idx + 1,
      cur = formData.rating;
    setFormData((p) => ({
      ...p,
      rating: cur === sv ? sv - 0.5 : cur === sv - 0.5 ? sv : sv - 0.5,
    }));
  };

  const handleUpdateIssue = async (e) => {
    if (e.preventDefault) e.preventDefault();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    if (formData.rating < 0 || formData.rating > 5) {
      toast.error("Invalid rating");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {};
      if (
        formData.status &&
        formData.status !== selectedIssue.status &&
        e !== "reopen"
      )
        payload.status = formData.status;
      const curR = selectedIssue.rating ?? 0;
      if (formData.rating !== curR) payload.rating = formData.rating;
      if (formData.feedback && formData.feedback !== selectedIssue.feedback)
        payload.feedback = formData.feedback;
      if (formData.comment) payload.comments = formData.comment;
      if (!Object.keys(payload).length) {
        toast.error("No changes detected.");
        setIsModalOpen(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${selectedIssue._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update task");
        return;
      }

      setIssues((prev) => {
        const upd = data?.issue;
        if (!upd?._id) return prev;
        return prev.some((i) => i._id === upd._id)
          ? prev.map((i) => (i._id === upd._id ? upd : i))
          : [...prev, upd];
      });

      const effR = payload.rating !== undefined ? payload.rating : curR;
      if (effR <= 2.5 && payload.rating !== undefined && e !== "reopen") {
        setShowConfirmation(true);
        setReopenIssue(data.issue);
      } else {
        setIsModalOpen(false);
        setFormData({ status: "", rating: 0, feedback: "", comment: "" });
        setSelectedIssue(null);
        toast.success("Task updated successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (reopen) => {
    setShowConfirmation(false);
    if (reopen) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/issues/${
            reopenIssue._id
          }/reopen`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || "Failed to reopen task");
          return;
        }
        handleUpdateIssue("reopen");
        toast.success("Task reopened!");
      } catch (err) {
        toast.error(err.message || "Failed to reopen task");
      } finally {
        setIsLoading(false);
      }
    }
    setIsModalOpen(false);
    setFormData({ status: "", rating: 0, feedback: "", comment: "" });
    setSelectedIssue(null);
  };

  const getAttachmentUrl = (a) =>
    !a
      ? null
      : a.startsWith("http")
      ? a
      : `${import.meta.env.VITE_BACKEND_URL}/${a}`;

  const renderEditableStars = (rating, onClick) => (
    <div className="flex">
      {[0, 1, 2, 3, 4].map((idx) => {
        const sv = idx + 1,
          full = rating >= sv,
          half = rating >= sv - 0.5 && rating < sv;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onClick(idx)}
            className="focus:outline-none"
          >
            {full ? (
              <FaStar className="w-5 h-5 text-yellow-400" />
            ) : half ? (
              <FaStarHalfStroke className="w-5 h-5 text-yellow-400" />
            ) : (
              <FaStar className="w-5 h-5 text-gray-300" />
            )}
          </button>
        );
      })}
    </div>
  );

  const handleEditFeedbackStarClick = (idx) => {
    const sv = idx + 1,
      cur = editingFeedback?.rating ?? 0;
    setEditingFeedback((p) => ({
      ...p,
      rating: cur === sv ? sv - 0.5 : cur === sv - 0.5 ? sv : sv - 0.5,
    }));
  };

  const handleSaveFeedback = async () => {
    if (!editingFeedback?.id || !selectedIssue?._id) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${
          selectedIssue._id
        }/feedback/${editingFeedback.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedback: editingFeedback.feedback,
            rating: editingFeedback.rating,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed");
        return;
      }
      const patch = (fb) =>
        fb._id === editingFeedback.id
          ? {
              ...fb,
              feedback: editingFeedback.feedback,
              rating: editingFeedback.rating,
            }
          : fb;
      setSelectedIssue((p) => ({ ...p, feedbacks: p.feedbacks.map(patch) }));
      setIssues((prev) =>
        prev.map((i) =>
          i._id === selectedIssue._id
            ? { ...i, feedbacks: i.feedbacks.map(patch) }
            : i
        )
      );
      toast.success("Feedback updated!");
      setEditingFeedback(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveComment = async () => {
    if (!editingComment?.id || !selectedIssue?._id) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${
          selectedIssue._id
        }/comment/${editingComment.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: editingComment.text }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed");
        return;
      }
      const patch = (c) =>
        c._id === editingComment.id ? { ...c, text: editingComment.text } : c;
      setSelectedIssue((p) => ({ ...p, comments: p.comments.map(patch) }));
      setIssues((prev) =>
        prev.map((i) =>
          i._id === selectedIssue._id
            ? { ...i, comments: i.comments.map(patch) }
            : i
        )
      );
      toast.success("Comment updated!");
      setEditingComment(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const isWithin5Minutes = (d) =>
    d ? (new Date() - new Date(d)) / 60000 < 5 : false;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#EFEFEF]">
      <div className="mb-6 pl-8 pt-8">
        <h2 className="text-2xl font-semibold text-primary">
          Welcome to BUGBUSTER
        </h2>
      </div>

      <main className="p-6">
        {/* ══════════════════════════════════════════════════
            TASKS TABLE
        ══════════════════════════════════════════════════ */}
        <div className="bg-white rounded-lg shadow mb-6">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-2 rounded-t-lg flex flex-wrap gap-2 justify-between items-center">
            <h3 className="text-lg font-semibold">Tasks</h3>

            {/* Live search → debounced API call */}
            <div className="flex-1 min-w-[180px] max-w-sm relative">
              <input
                type="text"
                placeholder="Search by name, ID, branch…"
                value={filters.search}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, search: e.target.value }))
                }
                className="w-full  px-3 py-1.5 text-sm text-white border-2 rounded-2xl border-white outline-none  pr-8"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters((p) => ({ ...p, search: "" }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <IoClose size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="relative flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition rounded px-3 py-1.5 text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4h18M7 8h10M11 12h2M9 16h6"
                  />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs bg-red-500 hover:bg-red-600 transition rounded px-2 py-1.5"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, status: e.target.value }))
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm text-gray-700 appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="All">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <IoChevronDown
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={12}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, priority: e.target.value }))
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm text-gray-700 appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="All">All Priorities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <IoChevronDown
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={12}
                    />
                  </div>
                </div>

                {/* Branch — auto-populated from data */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Branch
                  </label>
                  <div className="relative">
                    <select
                      value={filters.branch}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, branch: e.target.value }))
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm text-gray-700 appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="All">All Branches</option>
                      {uniqueBranches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <IoChevronDown
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={12}
                    />
                  </div>
                </div>

                {/* Department — auto-populated from data */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      value={filters.department}
                      onChange={(e) =>
                        setFilters((p) => ({
                          ...p,
                          department: e.target.value,
                        }))
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm text-gray-700 appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="All">All Departments</option>
                      {uniqueDepartments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <IoChevronDown
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={12}
                    />
                  </div>
                </div>

                {/* Date range */}
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Date From
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, startDate: e.target.value }))
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Date To
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, endDate: e.target.value }))
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Role toggles */}
              <div className="flex flex-wrap gap-3 mt-4">
                {/* Assigned TO me → API: ?assignedTo=myId */}
                <button
                  onClick={() =>
                    setFilters((p) => ({
                      ...p,
                      assignedToMe: !p.assignedToMe,
                      assignedByMe: false,
                    }))
                  }
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all
                    ${
                      filters.assignedToMe
                        ? "bg-primary text-white border-primary shadow"
                        : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
                    }`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Assigned to Me
                  {filters.assignedToMe && <MdCheck className="w-3 h-3" />}
                </button>

                {/* Assigned BY me → API: ?createdBy=myId */}
                <button
                  onClick={() =>
                    setFilters((p) => ({
                      ...p,
                      assignedByMe: !p.assignedByMe,
                      assignedToMe: false,
                    }))
                  }
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all
                    ${
                      filters.assignedByMe
                        ? "bg-primary text-white border-primary shadow"
                        : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
                    }`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536M9 13l6-6m-6 6H6v-3l9-9a2 2 0 012.828 0l.707.707A2 2 0 0118 7.536L9 16.5V13z"
                    />
                  </svg>
                  Assigned by Me
                  {filters.assignedByMe && <MdCheck className="w-3 h-3" />}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />{" "}
                    Fetching…
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-gray-600">
                      {issues.length}
                    </span>{" "}
                    task{issues.length !== 1 ? "s" : ""} found
                  </>
                )}
              </p>
            </div>
          )}

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 px-6 py-2 border-b border-gray-100 bg-white">
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {chip.label}
                  <button
                    onClick={() => removeChip(chip.key)}
                    className="hover:text-red-500 transition ml-0.5"
                  >
                    <IoClose size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="p-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div
                className="overflow-x-auto overflow-y-auto"
                style={{ maxHeight: "400px" }}
              >
                <table className="w-full text-xs min-w-[1200px]">
                  <thead className="bg-gray-100">
                    <tr className="text-gray-800">
                      {[
                        "Issue ID",
                        "Assigned By",
                        "Branch",
                        "Department",
                        "Assigned To",
                        "Further Assigned To",
                        "Description",
                        "Status",
                        "Priority",
                        "Attachment",
                        "FeedBack",
                        "Comments",
                      ].map((h) => (
                        <th
                          key={h}
                          className="p-3 text-left text-sm font-medium truncate"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="12" className="p-6 text-center">
                          <Loading />
                        </td>
                      </tr>
                    ) : issues.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <svg
                              className="w-10 h-10 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                            <span className="text-sm">
                              No tasks match your filters
                            </span>
                            {activeFilterCount > 0 && (
                              <button
                                onClick={resetFilters}
                                className="text-xs text-primary underline mt-1"
                              >
                                Clear all filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      issues.map((issue) => {
                        if (!issue) return null;
                        const resolved = issue.status === "resolved";
                        const tc = resolved ? "text-white" : "text-gray-600";
                        return (
                          <tr
                            key={issue._id}
                            className={`border-b border-gray-100 cursor-pointer hover:brightness-95 transition ${
                              resolved ? "bg-[#8b68b7]" : ""
                            }`}
                            onClick={() => handleViewIssue(issue)}
                          >
                            <td className={`p-3 text-sm truncate ${tc}`}>
                              {issue?.issueId || "N/A"}
                            </td>
                            <td className={`p-3 text-sm truncate ${tc}`}>
                              {issue.createdBy?.name || "N/A"}
                            </td>
                            <td className={`p-3 text-sm truncate ${tc}`}>
                              {issue.branch?.branchName || "N/A"}
                            </td>
                            <td className={`p-3 text-sm truncate ${tc}`}>
                              {issue.department?.departmentName || "N/A"}
                            </td>
                            <td className={`p-3 text-sm ${tc}`}>
                              {issue.assignedTo
                                ? `${issue.assignedTo.name} (${issue.assignedTo.email})`
                                : "N/A"}
                            </td>
                            <td
                              className={`p-3 text-sm truncate ${tc}`}
                              title={
                                Array.isArray(issue.furtherAssignedTo) &&
                                issue.furtherAssignedTo.length > 0
                                  ? issue.furtherAssignedTo
                                      .map((a) => `${a.name} (${a.email})`)
                                      .join(", ")
                                  : "N/A"
                              }
                            >
                              {Array.isArray(issue.furtherAssignedTo) &&
                              issue.furtherAssignedTo.length > 0
                                ? issue.furtherAssignedTo
                                    .map((a) => a.name || a)
                                    .join(", ")
                                : "N/A"}
                            </td>
                            <td
                              className={`p-3 text-sm ${tc}`}
                              title={
                                issue.descriptions
                                  ?.map((d) => d.description)
                                  .join(", ") || "N/A"
                              }
                            >
                              <div className="max-w-[200px] truncate">
                                {issue.descriptions?.[0]?.description || "N/A"}
                              </div>
                            </td>
                            <td className={`p-3 truncate ${tc}`}>
                              {issue.status
                                ? issue.status.charAt(0).toUpperCase() +
                                  issue.status.slice(1)
                                : "N/A"}
                            </td>
                            <td className="p-3">
                              {issue.priority ? (
                                <span
                                  className={`inline-block w-20 text-center px-2 py-1 rounded text-white text-xs ${
                                    issue.priority === "High"
                                      ? "bg-[#BE2C30]"
                                      : issue.priority === "Medium"
                                      ? "bg-[#CC610B]"
                                      : "bg-[#2E8310]"
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
                                  View
                                </a>
                              ) : (
                                "None"
                              )}
                            </td>
                            <td className={`p-3 truncate ${tc}`}>
                              {issue.feedbacks?.length > 0
                                ? issue.feedbacks[issue.feedbacks.length - 1]
                                    .feedback || "N/A"
                                : "N/A"}
                            </td>
                            <td className={`p-3 text-sm truncate ${tc}`}>
                              {Array.isArray(issue.comments) &&
                              issue.comments.length > 0
                                ? issue.comments[issue.comments.length - 1].text
                                : "N/A"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TASK DETAIL MODAL
        ══════════════════════════════════════════════════ */}
        {isModalOpen && selectedIssue && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg px-6 py-4 w-full max-w-3xl h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Task Details</h2>
              </div>
              <div>
                <p>
                  <strong>Issue Id:</strong> {selectedIssue.issueId || "N/A"}
                </p>
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
                  <strong>Further Assigned To:</strong>{" "}
                  {Array.isArray(selectedIssue.furtherAssignedTo) &&
                  selectedIssue.furtherAssignedTo.length > 0
                    ? selectedIssue.furtherAssignedTo
                        .map((a) => a.name || a)
                        .join(", ")
                    : "N/A"}
                </p>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Descriptions</h3>
                  {selectedIssue?.descriptions?.length > 0 ? (
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="p-2 text-left">#</th>
                              <th className="p-2 text-left">Description</th>
                              <th className="p-2 text-left">Type</th>
                              <th className="p-2 text-left">Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedIssue.descriptions.map((d, i) => (
                              <tr
                                key={d._id || i}
                                className="border-t border-gray-300"
                              >
                                <td className="p-2">{i + 1}</td>
                                <td className="p-2 break-words max-w-[250px]">
                                  {d.description}
                                </td>
                                <td className="p-2">{d.type || "-"}</td>
                                <td className="p-2">
                                  {d.createdAt
                                    ? new Date(d.createdAt).toLocaleString()
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No description provided
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <p>
                    <strong>TimeLine:</strong>{" "}
                    {selectedIssue?.description?.timeline || "N/A"}-
                    {selectedIssue?.description?.timeUnit}
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
                        View
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
                </div>

                {/* Feedback */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                  {Array.isArray(selectedIssue.feedbacks) &&
                  selectedIssue.feedbacks.length > 0 ? (
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="p-2 text-left">#</th>
                              <th className="p-2 text-left">Feedback</th>
                              <th className="p-2 text-center">Rating</th>
                              <th className="p-2 text-center">Edit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedIssue.feedbacks.map((fb, i) => (
                              <tr
                                key={fb._id || i}
                                className="border-t border-gray-300"
                              >
                                <td className="p-2">{i + 1}</td>
                                <td className="p-2 break-words max-w-[220px]">
                                  {editingFeedback?.id === fb._id ? (
                                    <textarea
                                      className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                      rows={3}
                                      value={editingFeedback.feedback}
                                      onChange={(e) =>
                                        setEditingFeedback((p) => ({
                                          ...p,
                                          feedback: e.target.value,
                                        }))
                                      }
                                    />
                                  ) : (
                                    fb.feedback || "No feedback"
                                  )}
                                </td>
                                <td className="p-2 text-center">
                                  {editingFeedback?.id === fb._id ? (
                                    <div className="flex justify-center">
                                      {renderEditableStars(
                                        editingFeedback.rating,
                                        handleEditFeedbackStarClick
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-yellow-500">
                                      {fb.rating ? `⭐ ${fb.rating}/5` : "-"}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-center">
                                  {editingFeedback?.id === fb._id ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={handleSaveFeedback}
                                        disabled={editLoading}
                                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                      >
                                        {editLoading ? (
                                          <span className="inline-block h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <MdCheck className="w-5 h-5" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingFeedback(null)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <MdClose className="w-5 h-5" />
                                      </button>
                                    </div>
                                  ) : (
                                    user?._id &&
                                    fb.createdBy?._id?.toString() ===
                                      user._id.toString() && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingFeedback({
                                            id: fb._id,
                                            feedback: fb.feedback || "",
                                            rating: fb.rating || 0,
                                          })
                                        }
                                        disabled={
                                          !isWithin5Minutes(fb.createdAt)
                                        }
                                        title={
                                          !isWithin5Minutes(fb.createdAt)
                                            ? "Edit window expired"
                                            : "Edit"
                                        }
                                        className={`${
                                          !isWithin5Minutes(fb.createdAt)
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-blue-600 hover:text-blue-800"
                                        }`}
                                      >
                                        <FaEdit />
                                      </button>
                                    )
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No feedback provided
                    </p>
                  )}
                </div>

                {/* Comments */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Comments</h3>
                  {Array.isArray(selectedIssue.comments) &&
                  selectedIssue.comments.length > 0 ? (
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="p-2 text-left">#</th>
                              <th className="p-2 text-left">Comment</th>
                              <th className="p-2 text-left">Date</th>
                              <th className="p-2 text-center">Edit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedIssue.comments.map((c, i) => (
                              <tr
                                key={c._id || i}
                                className="border-t border-gray-300"
                              >
                                <td className="p-2">{i + 1}</td>
                                <td className="p-2 break-words max-w-[200px]">
                                  {editingComment?.id === c._id ? (
                                    <textarea
                                      className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                      rows={3}
                                      value={editingComment.text}
                                      onChange={(e) =>
                                        setEditingComment((p) => ({
                                          ...p,
                                          text: e.target.value,
                                        }))
                                      }
                                    />
                                  ) : (
                                    c.text || "No comment"
                                  )}
                                </td>
                                <td className="p-2 text-xs text-gray-500">
                                  {c.commentedAt
                                    ? new Date(c.commentedAt).toLocaleString()
                                    : ""}
                                </td>
                                <td className="p-2 text-center">
                                  {editingComment?.id === c._id ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={handleSaveComment}
                                        disabled={editLoading}
                                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                      >
                                        {editLoading ? (
                                          <span className="inline-block h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <MdCheck className="w-5 h-5" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingComment(null)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <MdClose className="w-5 h-5" />
                                      </button>
                                    </div>
                                  ) : (
                                    user?._id &&
                                    c.commentedBy?._id?.toString() ===
                                      user._id.toString() && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingComment({
                                            id: c._id,
                                            text: c.text || "",
                                          })
                                        }
                                        disabled={
                                          !isWithin5Minutes(c.commentedAt)
                                        }
                                        title={
                                          !isWithin5Minutes(c.commentedAt)
                                            ? "Edit window expired"
                                            : "Edit"
                                        }
                                        className={`${
                                          !isWithin5Minutes(c.commentedAt)
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-blue-600 hover:text-blue-800"
                                        }`}
                                      >
                                        <FaEdit />
                                      </button>
                                    )
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No comments yet</p>
                  )}
                </div>

                {/* Update form */}
                {user ? (
                  (() => {
                    const isAdmin =
                      user.roles?.includes("SuperAdmin") ||
                      user.roles?.includes("Admin");
                    const isAssignee =
                      selectedIssue.assignedTo?._id?.toString() ===
                      user._id?.toString();
                    const isFurther =
                      Array.isArray(selectedIssue.furtherAssignedTo) &&
                      selectedIssue.furtherAssignedTo.some(
                        (a) => (a._id || a)?.toString() === user._id?.toString()
                      );
                    const isCreator =
                      selectedIssue.createdBy?._id?.toString() ===
                      user._id?.toString();
                    const canStatus = isAdmin || isAssignee || isFurther;
                    const canRating = isAdmin || isCreator;
                    const canFeedback = isAdmin || isCreator;
                    const canComment = isAssignee || isFurther;

                    return (
                      <form onSubmit={handleUpdateIssue} className="mt-4">
                        {canStatus && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                              Update Status
                            </label>
                            <div className="relative">
                              <select
                                value={formData.status}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    status: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
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
                        {canRating && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                              Rate Task
                            </label>
                            {renderEditableStars(
                              formData.rating,
                              handleStarClick
                            )}
                          </div>
                        )}
                        {canFeedback && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                              Feedback
                            </label>
                            <textarea
                              value={formData.feedback}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  feedback: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              rows="4"
                              placeholder="Enter feedback here..."
                            />
                          </div>
                        )}
                        {canComment && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                              Add Comment
                            </label>
                            <textarea
                              value={formData.comment}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  comment: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              rows="3"
                              placeholder="Enter your comment here..."
                            />
                          </div>
                        )}
                        {canStatus || canRating || canFeedback || canComment ? (
                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(false)}
                              className="bg-black cursor-pointer text-white px-4 py-2 rounded-md"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className={`bg-primary cursor-pointer text-white px-4 py-2 rounded-md flex items-center gap-2 ${
                                isLoading ? "opacity-70 cursor-not-allowed" : ""
                              }`}
                            >
                              {isLoading && (
                                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              )}
                              {isLoading ? "Updating..." : "Update Task"}
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

        {/* ══════════════════════════════════════════════════
            TOP CARDS
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">General Tasks</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                (These are to help you start using BUGBUSTER)
              </p>
              <ul className="space-y-4">
                {generalTasksData.map((t, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    {t.icon}
                    <span className="text-blue-500">{t.text}</span>
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
                {advanceTasksData.map((t, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    {t.icon}
                    <span className="text-blue-500">{t.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Task Status Snapshot</h3>
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
                    {paymentSnapshotData.statuses && (
                      <>
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 11.28 4.5"
                          fill="none"
                          stroke="#F97316"
                          strokeWidth="3.5"
                          strokeDasharray={`${
                            paymentSnapshotData.statuses[0]?.percentage?.replace(
                              "%",
                              ""
                            ) || 0
                          }, 100`}
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 11.28 4.5"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3.5"
                          strokeDasharray={`${
                            paymentSnapshotData.statuses[1]?.percentage?.replace(
                              "%",
                              ""
                            ) || 0
                          }, 100`}
                          transform="rotate(120, 18, 18)"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 11.28 4.5"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3.5"
                          strokeDasharray={`${
                            paymentSnapshotData.statuses[2]?.percentage?.replace(
                              "%",
                              ""
                            ) || 0
                          }, 100`}
                          transform="rotate(240, 18, 18)"
                        />
                      </>
                    )}
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-[10px] text-gray-400 font-medium">
                      Tasks
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {paymentSnapshotData.total || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {paymentSnapshotData.statuses?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
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

        {/* ══════════════════════════════════════════════════
            CHARTS
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ticket Trend</h3>
              <select
                value={analyticsType}
                onChange={(e) => {
                  setAnalyticsType(e.target.value);
                  fetchAnalytics(e.target.value);
                }}
                className="border bg-white rounded p-1 text-sm text-gray-800"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(() => {
                    const stats = analytics?.dateStats || [];
                    if (analyticsType === "daily")
                      return stats.map((d) => ({
                        name: `${d.dayName?.slice(0, 3)} ${d.day}`,
                        count: d.count,
                      }));
                    if (analyticsType === "monthly")
                      return stats.map((d) => ({
                        name: d.monthName?.slice(0, 3) || `M${d.month}`,
                        count: d.count,
                      }));
                    return stats.map((d) => ({
                      name: String(d.year),
                      count: d.count,
                    }));
                  })()}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={analyticsType === "daily" ? 4 : 0}
                    angle={analyticsType === "daily" ? -35 : 0}
                    textAnchor={analyticsType === "daily" ? "end" : "middle"}
                    height={analyticsType === "daily" ? 40 : 20}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Tickets"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Priority Breakdown</h3>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(analytics?.priorityStats || []).map((p) => ({
                    name: p.priority,
                    count: p.count,
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tickets">
                    {(analytics?.priorityStats || []).map((e, i) => (
                      <Cell
                        key={i}
                        fill={
                          e.priority === "High"
                            ? "#ef4444"
                            : e.priority === "Medium"
                            ? "#f97316"
                            : "#22c55e"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            BOTTOM SECTION
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="relative bg-white rounded-lg shadow h-[430px] flex flex-col">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Assigned Tasks</h3>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar flex-1">
              <table className="w-full text-xs table-fixed">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-200">
                    <th className="pb-3 w-1/4">Assigned By</th>
                    <th className="pb-3 w-1/4">Assigned To</th>
                    <th className="pb-3 w-1/4">Status</th>
                    <th className="pb-3 w-1/4">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedActivityLogData.length > 0 ? (
                    combinedActivityLogData.map((log, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-4 text-gray-600">{log.assignedBy}</td>
                        <td className="py-4">{log.assignedTo}</td>
                        <td className="py-4 text-gray-600">{log.status}</td>
                        <td className="py-4 text-gray-600">{log.dateTime}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 text-gray-600 text-center"
                      >
                        No activities available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
                <Loading />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow h-[430px] flex flex-col">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Status Distribution</h3>
            </div>
            <div className="p-4 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(analytics?.statusStats || []).map((s) => ({
                      name: s.status,
                      value: s.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(analytics?.statusStats || []).map((e, i) => (
                      <Cell
                        key={i}
                        fill={
                          e.status === "resolved"
                            ? "#10b981"
                            : e.status === "in-progress"
                            ? "#6366f1"
                            : "#f59e0b"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
