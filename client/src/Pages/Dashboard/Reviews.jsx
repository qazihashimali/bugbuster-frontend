import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { IoChevronDown } from "react-icons/io5";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

const Reviews = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);

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
      if (!token) toast.error("No authentication token found");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/feedback/dropdowns`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        toast.error(text);
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
      toast.error(err.message);
    }
  };

  const fetchIssues = async () => {
    setIsLoading(true);

    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found");

      const userData = localStorage.getItem("user");
      if (!userData) toast.error("No user data found");

      const user = JSON.parse(userData);
      const isAdmin =
        user.roles?.includes("Admin") || user.roles?.includes("SuperAdmin");

      const endpoint = isAdmin
        ? `${import.meta.env.VITE_BACKEND_URL}/api/feedback`
        : `${import.meta.env.VITE_BACKEND_URL}/api/feedback?user=${user._id}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        toast.error(text);
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
      toast.error(err.message);
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
          user.branch === filters.branch &&
          user.department === filters.department
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
                className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
              >
                Select Branch
              </label>
              <div className="relative">
                <select
                  id="branch"
                  name="branch"
                  className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
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
                className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
              >
                Select Department
              </label>
              <div className="relative">
                <select
                  id="department"
                  name="department"
                  className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
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
                className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
              >
                Select User
              </label>
              <div className="relative">
                <select
                  id="user"
                  name="user"
                  className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
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

          <div className="bg-primary rounded-t-lg text-white p-3">
            <h2 className="text-lg font-semibold">Details</h2>
          </div>
          <div className="bg-white shadow rounded-lg overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-100 truncate">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">
                    User Name
                  </th>
                  <th className="p-3 text-left text-sm font-medium">Branch</th>
                  <th className="p-3 text-left text-sm font-medium">
                    Department
                  </th>
                  <th className="p-3 text-left text-sm font-medium">
                    Feedback To
                  </th>
                  <th className="p-3 text-left text-sm font-medium">
                    Feedback
                  </th>
                  <th className="p-3 text-left text-sm font-medium">Rating</th>
                  <th className="p-3 text-center text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-3 text-center text-sm sm:text-base"
                    >
                      No feedback found.
                    </td>
                  </tr>
                )}
                {filteredIssues.map((issue) => (
                  <tr key={issue._id}>
                    <td className="p-3 text-sm truncate">
                      {issue.userName || "N/A"}
                    </td>
                    <td className="p-3 text-sm truncate">
                      {issue.branch ? `${issue.branch.branchName} ` : "N/A"}
                    </td>
                    <td className="p-3 text-sm truncate">
                      {issue.department
                        ? `${issue.department.departmentName} `
                        : "N/A"}
                    </td>
                    <td className="p-3 text-sm ">
                      {issue.feedbackTo
                        ? `${issue.feedbackTo.name} (${issue.feedbackTo.email})`
                        : "N/A"}
                    </td>
                    <td className="p-3 max-w-[150px] sm:max-w-xs truncate text-sm ">
                      {issue.feedback || "N/A"}
                    </td>
                    <td className="p-3">{renderStars(issue.rating)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleViewIssue(issue)}
                          className="text-orange-600 cursor-pointer hover:text-orange-800"
                          title="View"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isLoading && <Loading />}

      {isModalOpen && selectedIssue && (
        <div className="fixed inset-0 bg-black/90  flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90%] sm:max-w-[32rem] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                View Feedback
              </h2>
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
                  className="bg-black cursor-pointer text-white px-4 py-2 rounded-md  text-sm sm:text-base"
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
