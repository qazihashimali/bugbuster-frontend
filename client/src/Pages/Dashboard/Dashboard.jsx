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

import { FaScaleBalanced, FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoChevronDown } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";
import { BsFillBugFill } from "react-icons/bs";
import { SiGoogletasks } from "react-icons/si";
import { TiThList } from "react-icons/ti";
import toast from "react-hot-toast";
import Loading from "../../Components/Loading";

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

const Dashboard = () => {
  const revenueChartRef = useRef(null);
  const vendorsChartRef = useRef(null);
  const customersChartRef = useRef(null);

  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    rating: 0,
    feedback: "",
    comment: "", // New field for comment input
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reopenIssue, setReopenIssue] = useState();

  // const [activeTab, setActiveTab] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("All");
  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // console.log("User from localStorage:", parsedUser);
      } catch (err) {
        console.error("Failed to parse user data:", err);
        toast.error("Failed to parse user data");
      }
    }
  }, []);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
      }

      const searchParams = new URLSearchParams();

      if (searchParams) {
        if (
          !user.roles.includes("SuperAdmin") &&
          !user.roles.includes("Admin")
        ) {
          searchParams.append("assignedTo", user._id);
          searchParams.append("createdBy", user._id);
        }
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/issues?${searchParams.toString()}`,
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
        toast.error(`Failed to fetch issues: ${response.statusText}`);
      }

      let data = await response.json();
      console.log("Fetched issues:", data);

      // Validate and filter out invalid issues
      // data = data.filter((issue) => {
      //   if (!issue && !issue._id) {
      //     console.warn("Invalid issue detected:", issue);
      //     return false;
      //   }

      //   if (
      //     issue.assignedTo?._id !== user._id &&
      //     issue.createdBy?._id !== user._id &&
      //     !user.roles.includes("Admin") &&
      //     !user.roles.includes("SuperAdmin")
      //   ) {
      //     return false;
      //   }
      //   return true;
      // });

      if (user) {
        const userId = user._id;
        if (!userId) {
          toast.error("User ID not found in local storage");
        }
      }
      // console.log("Filtered issues:", data);

      setIssues(data);
    } catch (err) {
      console.error("Fetch issues error:", err);
      toast.error(`Failed to fetch issues: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!token || !user?._id) {
        toast.error("No authentication token or user ID found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues?createdBy=${user._id}`,
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
          "Assigned tasks response status:",
          response.status,
          "Response text:",
          text
        );
        toast.error(`Failed to fetch assigned tasks: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("Fetched assigned tasks:", data);
      const filteredIssues = Array.isArray(data) ? data : data.issues || [];

      setAssignedTasks(filteredIssues);
    } catch (err) {
      console.error("Fetch assigned tasks error:", err);
      toast.error(err.message || "Failed to fetch assigned tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIssues();
      fetchAssignedTasks();
      const interval = setInterval(() => {
        fetchIssues();
        fetchAssignedTasks();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const calculatePaymentSnapshotData = () => {
    const safeIssues = Array.isArray(issues) ? issues : [];
    const totalIssues = safeIssues.length;
    const statusCounts = {
      pending: safeIssues.filter((issue) => issue.status === "pending").length,
      "in-progress": safeIssues.filter(
        (issue) => issue.status === "in-progress"
      ).length,
      resolved: safeIssues.filter((issue) => issue.status === "resolved")
        .length,
    };

    const statusPercentages = {
      pending:
        totalIssues > 0
          ? ((statusCounts.pending / totalIssues) * 100).toFixed(2)
          : 0,
      "in-progress":
        totalIssues > 0
          ? ((statusCounts["in-progress"] / totalIssues) * 100).toFixed(2)
          : 0,
      resolved:
        totalIssues > 0
          ? ((statusCounts.resolved / totalIssues) * 100).toFixed(2)
          : 0,
    };

    return {
      statuses: [
        {
          label: "Pending",
          value: statusCounts.pending,
          percentage: `+${statusPercentages.pending}%`,
          color: "bg-orange-500",
        },
        {
          label: "In Progress",
          value: statusCounts["in-progress"],
          percentage: `+${statusPercentages["in-progress"]}%`,
          color: "bg-blue-500",
        },
        {
          label: "Resolved",
          value: statusCounts.resolved,
          percentage: `+${statusPercentages.resolved}%`,
          color: "bg-green-500",
        },
      ],
      total: totalIssues,
    };
  };

  // console.log("Issues state:", issues);
  const paymentSnapshotData = calculatePaymentSnapshotData();

  const combinedActivityLogData = assignedTasks.map((issue) => ({
    assignedTo: issue.assignedTo?.name || "N/A",
    assignedBy: issue.userName || "N/A",
    status: issue.status || "N/A",
    dateTime: issue.createdAt
      ? new Date(issue.createdAt).toLocaleString()
      : "N/A",
  }));

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setFormData({
      status: issue.status || "",
      rating: issue.rating || 0,
      feedback: issue.feedback || "",
      // comment: issue.comments || "",
      comment: "", // Reset comment field when viewing an issue
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
    if (e.preventDefault) e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to update an issue");
      return;
    }

    const validStatuses = ["pending", "in-progress", "resolved"];
    if (formData.status && !validStatuses.includes(formData.status)) {
      toast.error("Invalid rating selected");
      return;
    }

    if (formData.rating < 0 || formData.rating > 5) {
      toast.error("Invalid rating selected");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found");

      const payload = {};
      if (
        formData.status &&
        formData.status !== selectedIssue.status &&
        e !== "reopen"
      ) {
        payload.status = formData.status;
      }
      const currentRating = selectedIssue.rating ?? 0;
      if (formData.rating !== currentRating) {
        payload.rating = formData.rating;
      }
      if (formData.feedback && formData.feedback !== selectedIssue.feedback) {
        payload.feedback = formData.feedback;
      }
      if (formData.comment) {
        payload.comments = formData.comment;
      }

      if (Object.keys(payload).length === 0) {
        toast.error("No changes detected.");
        setIsModalOpen(false);
        return;
      }

      // console.log("Payload being sent to API:", payload);

      // Perform the update
      const response = await fetch(
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

      const data = await response.json();
      if (!response.ok) {
        console.error("Server response:", data);
        toast.error(
          data.message || `Failed to update task: ${response.statusText}`
        );
      }

      // Update the issues state with the new data
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

      const effectiveRating =
        payload.rating !== undefined ? payload.rating : currentRating;
      if (effectiveRating <= 2.5 && payload.rating !== undefined) {
        if (e !== "reopen") {
          setShowConfirmation(true);
          setReopenIssue(data.issue); // Use the updated issue
        }
      } else {
        setIsModalOpen(false);
        setFormData({ status: "", rating: 0, feedback: "", comment: "" });
        setSelectedIssue(null);
        toast.success("Task updated successfully!");
      }
    } catch (err) {
      console.error("Update issue error:", err);
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
        if (!token) toast.error("No authentication token found");
        // Call the reopen endpoint
        const response = await fetch(
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

        const data = await response.json();
        if (!response.ok) {
          console.error("Server response:", data);
          toast.error(
            data.message || `Failed to reopen task: ${response.statusText}`
          );
        }

        handleUpdateIssue("reopen");

        toast.success("Task reopened successfully!");
      } catch (err) {
        console.error("Reopen issue error:", err);
        toast.error(err.message || "Failed to reopen task");
      } finally {
        setIsLoading(false);
      }
    }

    // Close the modal and reset form regardless of reopen choice
    setIsModalOpen(false);
    setFormData({ status: "", rating: 0, feedback: "", comment: "" });
    setSelectedIssue(null);
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

  // const handleTabClick = (tab) => {
  //   setActiveTab(tab);
  // };

  const filteredIssues =
    filterStatus === "All"
      ? issues
      : issues.filter((issue) => issue?.status === filterStatus.toLowerCase());

  const getAttachmentUrl = (attachment) => {
    if (!attachment) return null;
    if (attachment.startsWith("http")) return attachment;
    return `${import.meta.env.VITE_BACKEND_URL}/${attachment}`;
  };

  const truncateDescription = (description) => {
    if (!description) return "";
    const words = description?.title.trim().split(" ");
    if (words.length <= 2) return description?.title;
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

          <div className="p-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-xs min-w-[1200px]">
                  <thead className="bg-gray-100 truncate">
                    <tr className="text-gray-800">
                      <th className="p-3 text-left text-sm font-medium">
                        Assigned By
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Branch
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Department
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Assigned To
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Description
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Priority
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Attachment
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        FeedBack
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Rating
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue) =>
                      issue ? (
                        <tr
                          key={issue._id}
                          className={`border-b border-gray-100 cursor-pointer  ${
                            issue.status === "resolved"
                              ? "bg-[#8b68b7] text-white"
                              : ""
                          }`}
                          onClick={() => handleViewIssue(issue)}
                        >
                          <td
                            className={`p-3 text-sm truncate ${
                              issue.status === "resolved"
                                ? "text-white"
                                : "text-gray-600"
                            } `}
                          >
                            {issue.createdBy?.name || "N/A"}
                          </td>
                          <td
                            className={`p-3 text-sm truncate ${
                              issue.status === "resolved"
                                ? "text-white"
                                : "text-gray-600"
                            } `}
                          >
                            {issue.branch
                              ? `${issue.branch.branchName}`
                              : "N/A"}
                          </td>
                          <td
                            className={`p-3 text-sm truncate ${
                              issue.status === "resolved"
                                ? "text-white"
                                : "text-gray-600"
                            } `}
                          >
                            {issue.department
                              ? `${issue.department.departmentName}`
                              : "N/A"}
                          </td>
                          <td
                            className={`p-3  ${
                              issue.status === "resolved"
                                ? "text-white"
                                : "text-gray-600"
                            } `}
                          >
                            {issue.assignedTo
                              ? `${issue.assignedTo.name} (${issue.assignedTo.email})`
                              : "N/A"}
                          </td>
                          <td
                            className={`p-3 text-sm truncate ${
                              issue.status === "resolved"
                                ? "text-white"
                                : "text-gray-600"
                            } `}
                          >
                            {truncateDescription(issue.description) || "N/A"}
                          </td>
                          <td
                            className={`p-3 truncate ${
                              issue.status === "resolved"
                                ? "text-white"
                                : "text-gray-600"
                            } `}
                          >
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
                          <td
                            className={`p-3 ${
                              issue.status === "resolved"
                                ? "text-white"
                                : "text-gray-600"
                            } `}
                          >
                            {issue.feedback || "N/A"}
                          </td>
                          <td
                            className={`p-3 ${
                              issue.status === "resolved"
                                ? "text-white"
                                : "text-gray-600"
                            } `}
                          >
                            {renderStars(issue.rating)}
                          </td>
                          <td
                            className={`p-3 text-sm truncate ${
                              issue.status === "resolved"
                                ? "text-white"
                                : "text-gray-600"
                            } `}
                          >
                            {issue.comments
                              ? issue.comments.length > 20
                                ? issue.comments.slice(0, 20) + "..."
                                : issue.comments
                              : "N/A"}
                          </td>
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </table>
              </div>
              {isLoading && (
                <div className="p-4 text-gray-600 text-center">
                  <Loading />
                </div>
              )}
              {!isLoading && filteredIssues.length === 0 && (
                <div className="p-4 text-gray-600 text-center">
                  No tasks available
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Modal for Task Details */}
        {isModalOpen && selectedIssue && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg px-6 py-4 w-full max-w-3xl h-[80vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Task Details</h2>
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
                  {selectedIssue?.description?.description || "N/A"}
                </p>
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
                {/* Comments Section */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Comments</h3>
                  {selectedIssue.comments ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedIssue.comments}
                    </div>
                  ) : (
                    "No comments yet"
                  )}
                </div>
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
                    const canAddComment = isAssignee; // Only assignee can add comments

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
                                className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
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
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              rows="4"
                              placeholder="Enter feedback here..."
                            />
                          </div>
                        )}
                        {canAddComment && (
                          <div className="mb-4">
                            <label
                              htmlFor="modalComment"
                              className="block text-sm font-medium mb-1"
                            >
                              Add Comment
                            </label>
                            <textarea
                              id="modalComment"
                              name="comment"
                              value={formData.comment}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  comment: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              rows="3"
                              placeholder="Enter your comment here..."
                            />
                          </div>
                        )}
                        {canUpdateStatus ||
                        canUpdateRating ||
                        canUpdateFeedback ||
                        canAddComment ? (
                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(false)}
                              className="bg-black cursor-pointer text-white px-4 py-2 rounded-md "
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className={`bg-primary cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center gap-2
    ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
  `}
                            >
                              {isLoading && (
                                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              )}
                              <span>
                                {isLoading ? "Updating..." : "Update Task"}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <p className="text-red-600 text-sm mb-4">
                              You are not authorized to update this task or add
                              comments.
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
                      You must be logged in to update the task or add comments.
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
                (These are to help you start using BUGBUSTER)
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
                {paymentSnapshotData.statuses ? (
                  paymentSnapshotData.statuses.map((item, index) => (
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
                  ))
                ) : (
                  <div className="text-xs text-gray-600">
                    No status data available
                  </div>
                )}
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
          {/* Assigned Tasks */}
          <div className="relative bg-white rounded-lg shadow h-[430px] flex flex-col">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Assigned Tasks</h3>
            </div>

            {/* Scrollable Table Container */}
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
                    combinedActivityLogData.map((log, index) => (
                      <tr key={index} className="border-b border-gray-100">
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

            {/* Loader Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
                <Loading />
              </div>
            )}
          </div>

          {/* Customers */}
          <div className="bg-white rounded-lg shadow h-[430px] flex flex-col">
            <div className="bg-primary text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-lg font-semibold">Customers</h3>
            </div>
            <div className="p-6 flex-1">
              <div className="relative h-full">
                <span className="absolute right-0 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                  {customersData.revenueNote}
                </span>
                <div className="h-full">
                  <canvas ref={customersChartRef} className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
