// import React, { useState, useEffect } from "react";
// import { FaEye, FaTimes } from "react-icons/fa";
// import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
// import Loading from "../../Components/Loading";

// const Alert = ({ type, message, onClose }) => {
//   const alertStyles = {
//     success: "bg-blue-100 border-blue-500 text-blue-700", // Updated to match Feedback component
//     error: "bg-red-100 border-red-500 text-red-700",
//   };

//   return (
//     <div
//       className={`border-l-4 p-4 mb-4 flex justify-between items-center ${alertStyles[type]}`}
//     >
//       <p>{message}</p>
//       <button onClick={onClose} className="text-gray-700 hover:text-gray-900">
//         <FaTimes />
//       </button>
//     </div>
//   );
// };

// const Reviews = () => {
//   const [issues, setIssues] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedIssue, setSelectedIssue] = useState(null);

//   const showAlert = (type, message) => {
//     if (type === "success") {
//       setSuccess(message);
//       setError("");
//     } else {
//       setError(message);
//       setSuccess("");
//     }
//     setTimeout(() => {
//       setSuccess("");
//       setError("");
//     }, 5000);
//   };

//   const renderStars = (rating) => {
//     if (rating === null || rating === undefined || rating === 0) {
//       return (
//         <div className="flex justify-center p-2 rounded-md">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <FaStar key={star} className="w-4 h-4 text-gray-300 mx-1" />
//           ))}
//         </div>
//       );
//     }
//     return (
//       <div className="flex justify-center p-2">
//         {[1, 2, 3, 4, 5].map((star) => {
//           const starValue = star;
//           if (rating >= starValue) {
//             return (
//               <FaStar key={starValue} className="w-4 h-4 text-[#FFD700] mx-1" />
//             );
//           } else if (rating >= starValue - 0.5) {
//             return (
//               <FaStarHalfStroke
//                 key={starValue}
//                 className="w-4 h-4 text-[#FFD700] mx-1"
//               />
//             );
//           } else {
//             return (
//               <FaStar key={starValue} className="w-4 h-4 text-gray-300 mx-1" />
//             );
//           }
//         })}
//       </div>
//     );
//   };

//   const fetchIssues = async () => {
//     setIsLoading(true);
//     setError("");
//     setSuccess("");
//     const start = Date.now();
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const userData = localStorage.getItem("user");
//       if (!userData) throw new Error("No user data found");

//       const user = JSON.parse(userData);
//       const isAdmin =
//         user.roles?.includes("Admin") || user.roles?.includes("SuperAdmin");

//       // Conditionally set the API endpoint based on user role
//       const endpoint = isAdmin
//         ? "https://bug-buster-backend.vercel.app/api/feedback"
//         : `https://bug-buster-backend.vercel.app/api/feedback?user=${user._id}`;

//       const response = await fetch(endpoint, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         throw new Error(`Failed to fetch feedback: ${text}`);
//       }

//       const data = await response.json();
//       setIssues(Array.isArray(data) ? data : []);

//       if (Date.now() - start < 2000) {
//         await new Promise((resolve) =>
//           setTimeout(resolve, 2000 - (Date.now() - start))
//         );
//       }
//     } catch (err) {
//       showAlert("error", err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchIssues();
//   }, []);

//   const handleViewIssue = (issue) => {
//     setSelectedIssue(issue);
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="relative container mx-auto p-6 bg-gray-100 min-h-screen">
//       <div
//         className={`bg-white shadow-md rounded-lg ${
//           isLoading ? "blur-sm" : ""
//         }`}
//       >
//         <div className="bg-primary text-white p-4 rounded-t-lg">
//           <h1 className="text-2xl font-bold">Reviews</h1>
//         </div>

//         {(error || success) && (
//           <div className="p-6">
//             {error && (
//               <Alert
//                 type="error"
//                 message={error}
//                 onClose={() => setError("")}
//               />
//             )}
//             {success && (
//               <Alert
//                 type="success"
//                 message={success}
//                 onClose={() => setSuccess("")}
//               />
//             )}
//           </div>
//         )}

//         <div className="p-6">
//           <div className="bg-white shadow rounded-lg overflow-hidden">
//             <div className="bg-primary text-white p-3">
//               <h2 className="text-lg font-semibold">Details</h2>
//             </div>
//             <table className="w-full">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="p-3 text-left">User Name</th>
//                   <th className="p-3 text-left">Branch</th>
//                   <th className="p-3 text-left">Department</th>
//                   <th className="p-3 text-left">Feedback To</th>
//                   <th className="p-3 text-left">Feedback</th>
//                   <th className="p-3 text-left">Rating</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {issues.length === 0 && !isLoading && (
//                   <tr>
//                     <td colSpan="7" className="p-3 text-center">
//                       No feedback found.
//                     </td>
//                   </tr>
//                 )}
//                 {issues.map((issue) => (
//                   <tr key={issue._id}>
//                     <td className="p-3">{issue.userName || "N/A"}</td>
//                     <td className="p-3">
//                       {issue.branch
//                         ? `${issue.branch.branchName} (${issue.branch.branchCode})`
//                         : "N/A"}
//                     </td>
//                     <td className="p-3">
//                       {issue.department
//                         ? `${issue.department.departmentName} (${issue.department.departmentCode})`
//                         : "N/A"}
//                     </td>
//                     <td className="p-3">
//                       {issue.feedbackTo
//                         ? `${issue.feedbackTo.name} (${issue.feedbackTo.email})`
//                         : "N/A"}
//                     </td>
//                     <td className="p-3 max-w-xs truncate">
//                       {issue.feedback || "N/A"}
//                     </td>
//                     <td className="p-3">{renderStars(issue.rating)}</td>
//                     <td className="p-3 flex justify-center">
//                       <button
//                         onClick={() => handleViewIssue(issue)}
//                         className="text-orange-600 hover:text-orange-800"
//                         title="View"
//                       >
//                         <FaEye />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {isLoading && <Loading fullscreen />}

//       {isModalOpen && selectedIssue && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//           style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
//         >
//           <div className="bg-white rounded-lg p-6 w-[32rem] max-h-[80vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">View Feedback</h2>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-gray-600 hover:text-gray-800"
//               >
//                 <FaTimes />
//               </button>
//             </div>
//             <div>
//               <p className="mb-2">
//                 <strong>User Name:</strong> {selectedIssue.userName || "N/A"}
//               </p>
//               <p className="mb-2">
//                 <strong>Feedback:</strong> {selectedIssue.feedback || "N/A"}
//               </p>
//               <p className="mb-2">
//                 <strong>Feedback To:</strong>{" "}
//                 {selectedIssue.feedbackTo
//                   ? `${selectedIssue.feedbackTo.name} (${selectedIssue.feedbackTo.email})`
//                   : "N/A"}
//               </p>
//               <p className="mb-2">
//                 <strong>Branch:</strong>{" "}
//                 {selectedIssue.branch
//                   ? `${selectedIssue.branch.branchName} (${selectedIssue.branch.branchCode})`
//                   : "N/A"}
//               </p>
//               <p className="mb-2">
//                 <strong>Department:</strong>{" "}
//                 {selectedIssue.department
//                   ? `${selectedIssue.department.departmentName} (${selectedIssue.department.departmentCode})`
//                   : "N/A"}
//               </p>
//               <p className="mb-2">
//                 <strong>Rating:</strong> {renderStars(selectedIssue.rating)}
//               </p>

//               <div className="flex justify-end mt-4">
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Reviews;


import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { IoChevronDown } from "react-icons/io5";
import Loading from "../../Components/Loading";

const Alert = ({ type, message, onClose }) => {
  const alertStyles = {
    success: "bg-blue-100 border-blue-500 text-blue-700",
    error: "bg-red-100 border-red-500 text-red-700",
  };

  return (
    <div
      className={`border-l-4 p-4 mb-4 flex justify-between items-center ${alertStyles[type]} max-w-full sm:max-w-md md:max-w-lg mx-auto`}
    >
      <p>{message}</p>
      <button onClick={onClose} className="text-gray-700 hover:text-gray-900">
        <FaTimes />
      </button>
    </div>
  );
};

const Reviews = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [dropdowns, setDropdowns] = useState({
    branches: [],
    departments: [],
    users: [],
    filteredUsers: [],
  });
  const [filters, setFilters] = useState({
    branch: "",
    department: "",
    user: "",
  });
  const hasFetched = useRef(false);

  const showAlert = (type, message) => {
    if (type === "success") {
      setSuccess(message);
      setError("");
    } else {
      setError(message);
      setSuccess("");
    }
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
  };

  const renderStars = (rating) => {
    if (rating === null || rating === undefined || rating === 0) {
      return (
        <div className="flex justify-center p-2 rounded-md">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar key={star} className="w-4 h-4 text-gray-300 mx-1" />
          ))}
        </div>
      );
    }
    return (
      <div className="flex justify-center p-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const starValue = star;
          if (rating >= starValue) {
            return (
              <FaStar key={starValue} className="w-4 h-4 text-[#FFD700] mx-1" />
            );
          } else if (rating >= starValue - 0.5) {
            return (
              <FaStarHalfStroke
                key={starValue}
                className="w-4 h-4 text-[#FFD700] mx-1"
              />
            );
          } else {
            return (
              <FaStar key={starValue} className="w-4 h-4 text-gray-300 mx-1" />
            );
          }
        })}
      </div>
    );
  };

  const fetchDropdowns = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        "https://bug-buster-backend.vercel.app/api/feedback/dropdowns",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch dropdown data: ${text}`);
      }

      const dropdownData = await response.json();
      setDropdowns({
        branches: Array.isArray(dropdownData.branches)
          ? dropdownData.branches
          : [],
        departments: Array.isArray(dropdownData.departments)
          ? dropdownData.departments
          : [],
        users: Array.isArray(dropdownData.users) ? dropdownData.users : [],
        filteredUsers: Array.isArray(dropdownData.users)
          ? dropdownData.users
          : [],
      });
    } catch (err) {
      showAlert("error", err.message);
    }
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("No user data found");

      const user = JSON.parse(userData);
      const isAdmin =
        user.roles?.includes("Admin") || user.roles?.includes("SuperAdmin");

      const endpoint = isAdmin
        ? "https://bug-buster-backend.vercel.app/api/feedback"
        : `https://bug-buster-backend.vercel.app/api/feedback?user=${user._id}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch feedback: ${text}`);
      }

      const data = await response.json();
      const feedbackData = Array.isArray(data) ? data : [];
      setIssues(feedbackData);
      setFilteredIssues(feedbackData);

      if (Date.now() - start < 2000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      }
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDropdowns();
      fetchIssues();
    }
  }, []);

  useEffect(() => {
    if (filters.branch || filters.department || filters.user) {
      let filtered = issues;

      if (filters.branch) {
        filtered = filtered.filter(
          (issue) => issue.branch?._id === filters.branch
        );
      }

      if (filters.department) {
        filtered = filtered.filter(
          (issue) => issue.department?._id === filters.department
        );
      }

      if (filters.user) {
        filtered = filtered.filter(
          (issue) => issue.feedbackTo?._id === filters.user
        );
      }

      setFilteredIssues(filtered);
    } else {
      setFilteredIssues(issues);
    }
  }, [filters, issues]);

  useEffect(() => {
    if (filters.branch && filters.department) {
      const filtered = dropdowns.users.filter(
        (user) =>
          user.branch === filters.branch && user.department === filters.department
      );
      setDropdowns((prev) => ({ ...prev, filteredUsers: filtered }));
    } else {
      setDropdowns((prev) => ({ ...prev, filteredUsers: prev.users }));
    }
  }, [filters.branch, filters.department, dropdowns.users]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  return (
    <div className="relative container mx-auto p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-xl sm:text-2xl font-bold">Reviews</h1>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label
                htmlFor="branch"
                className="block text-sm font-medium mb-1"
                style={{
                  backgroundColor: "white",
                  width: "fit-content",
                  position: "relative",
                  top: "13px",
                  marginLeft: "14px",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                  zIndex: "20",
                }}
              >
                Select Branch
              </label>
              <div className="relative">
                <select
                  id="branch"
                  name="branch"
                  className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  value={filters.branch}
                  onChange={handleFilterChange}
                >
                  <option value="">All Branches</option>
                  {dropdowns.branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName} ({branch.branchCode})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <IoChevronDown className="text-gray-400" size={16} />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium mb-1"
                style={{
                  backgroundColor: "white",
                  width: "fit-content",
                  position: "relative",
                  top: "13px",
                  marginLeft: "14px",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                  zIndex: "20",
                }}
              >
                Select Department
              </label>
              <div className="relative">
                <select
                  id="department"
                  name="department"
                  className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  value={filters.department}
                  onChange={handleFilterChange}
                >
                  <option value="">All Departments</option>
                  {dropdowns.departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.departmentName} ({department.departmentCode})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <IoChevronDown className="text-gray-400" size={16} />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="user"
                className="block text-sm font-medium mb-1"
                style={{
                  backgroundColor: "white",
                  width: "fit-content",
                  position: "relative",
                  top: "13px",
                  marginLeft: "14px",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                  zIndex: "20",
                }}
              >
                Select User
              </label>
              <div className="relative">
                <select
                  id="user"
                  name="user"
                  className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  value={filters.user}
                  onChange={handleFilterChange}
                >
                  <option value="">All Users</option>
                  {dropdowns.filteredUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <IoChevronDown className="text-gray-400" size={16} />
                </div>
              </div>
            </div>
          </div>

          {(error || success) && (
            <div className="mb-6">
              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError("")}
                />
              )}
              {success && (
                <Alert
                  type="success"
                  message={success}
                  onClose={() => setSuccess("")}
                />
              )}
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <div className="bg-primary text-white p-3">
              <h2 className="text-lg font-semibold">Details</h2>
            </div>
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-sm sm:text-base">User Name</th>
                  <th className="p-3 text-left text-sm sm:text-base">Branch</th>
                  <th className="p-3 text-left text-sm sm:text-base">Department</th>
                  <th className="p-3 text-left text-sm sm:text-base">Feedback To</th>
                  <th className="p-3 text-left text-sm sm:text-base">Feedback</th>
                  <th className="p-3 text-left text-sm sm:text-base">Rating</th>
                  <th className="p-3 text-center text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="7" className="p-3 text-center text-sm sm:text-base">
                      No feedback found.
                    </td>
                  </tr>
                )}
                {filteredIssues.map((issue) => (
                  <tr key={issue._id}>
                    <td className="p-3 text-sm sm:text-base">{issue.userName || "N/A"}</td>
                    <td className="p-3 text-sm sm:text-base">
                      {issue.branch
                        ? `${issue.branch.branchName} (${issue.branch.branchCode})`
                        : "N/A"}
                    </td>
                    <td className="p-3 text-sm sm:text-base">
                      {issue.department
                        ? `${issue.department.departmentName} (${issue.department.departmentCode})`
                        : "N/A"}
                    </td>
                    <td className="p-3 text-sm sm:text-base">
                      {issue.feedbackTo
                        ? `${issue.feedbackTo.name} (${issue.feedbackTo.email})`
                        : "N/A"}
                    </td>
                    <td className="p-3 max-w-[150px] sm:max-w-xs truncate text-sm sm:text-base">
                      {issue.feedback || "N/A"}
                    </td>
                    <td className="p-3">{renderStars(issue.rating)}</td>
                    <td className="p-3 flex justify-center">
                      <button
                        onClick={() => handleViewIssue(issue)}
                        className="text-orange-600 hover:text-orange-800"
                        title="View"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isLoading && <Loading fullscreen />}

      {isModalOpen && selectedIssue && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90%] sm:max-w-[32rem] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">View Feedback</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>
            <div>
              <p className="mb-2 text-sm sm:text-base">
                <strong>User Name:</strong> {selectedIssue.userName || "N/A"}
              </p>
              <p className="mb-2 text-sm sm:text-base">
                <strong>Feedback:</strong> {selectedIssue.feedback || "N/A"}
              </p>
              <p className="mb-2 text-sm sm:text-base">
                <strong>Feedback To:</strong>{" "}
                {selectedIssue.feedbackTo
                  ? `${selectedIssue.feedbackTo.name} (${selectedIssue.feedbackTo.email})`
                  : "N/A"}
              </p>
              <p className="mb-2 text-sm sm:text-base">
                <strong>Branch:</strong>{" "}
                {selectedIssue.branch
                  ? `${selectedIssue.branch.branchName} (${selectedIssue.branch.branchCode})`
                  : "N/A"}
              </p>
              <p className="mb-2 text-sm sm:text-base">
                <strong>Department:</strong>{" "}
                {selectedIssue.department
                  ? `${selectedIssue.department.departmentName} (${selectedIssue.department.departmentCode})`
                  : "N/A"}
              </p>
              <p className="mb-2 text-sm sm:text-base">
                <strong>Rating:</strong> {renderStars(selectedIssue.rating)}
              </p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;