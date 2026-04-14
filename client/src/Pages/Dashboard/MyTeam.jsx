import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

const MyTeam = () => {
  const [activeTab, setActiveTab] = useState("team");
  const [teamUsers, setTeamUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const roleOptions = ["EndUser", "ServiceProvider", "Admin", "SuperAdmin"];
  const taskStatusOptions = ["All", "pending", "in-progress", "resolved"];
  const priorityOptions = ["All", "High", "Medium", "Low"];

  const fetchTeam = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No authentication token found.");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/team/my-team`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        return toast.error(
          `Failed to fetch team: ${response.status} ${response.statusText}`
        );
      const data = await response.json();
      // console.log(data);

      //   setTeamUsers(Array.isArray(data) ? data : data.users || data.team || []);
      setTeamUsers(data.team || []);
      if (Date.now() - start < 1000)
        await new Promise((r) => setTimeout(r, 1000 - (Date.now() - start)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No authentication token found.");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/team/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        return toast.error(
          `Failed to fetch tasks: ${response.status} ${response.statusText}`
        );
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : data.tasks || []);
      if (Date.now() - start < 1000)
        await new Promise((r) => setTimeout(r, 1000 - (Date.now() - start)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchTasks();
  }, []);

  const handleViewUser = (u) => {
    setSelectedUser(u);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const filteredUsers = teamUsers.filter(
    (u) => filterRole === "All" || u.roles?.includes(filterRole)
  );

  const filteredTasks = tasks.filter((t) => {
    const statusMatch = filterStatus === "All" || t.status === filterStatus;
    const priorityMatch =
      filterPriority === "All" || t.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      "in-progress": "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const label = {
      pending: "Pending",
      "in-progress": "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          map[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {label[status] || status || "N/A"}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const map = {
      High: "bg-red-100 text-red-700",
      Medium: "bg-orange-100 text-orange-700",
      Low: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          map[priority] || "bg-gray-100 text-gray-600"
        }`}
      >
        {priority || "N/A"}
      </span>
    );
  };

  return (
    <div
      className="relative container mx-auto p-3 sm:p-4 lg:p-6 bg-gray-100 min-h-screen"
      aria-busy={isLoading}
    >
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        {/* Header */}
        <div className="bg-primary text-white p-3 sm:p-4 rounded-t-lg">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">My Team</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-4">
          <div className="flex space-x-1">
            {["team", "tasks"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "team" ? "Team" : "Tasks"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Sub-header with filters */}
            <div className="bg-primary text-white p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-base sm:text-lg font-semibold">
                {activeTab === "team" ? "Team Members" : "Team Tasks"}
              </h2>
              <div className="flex flex-wrap justify-end items-center gap-3">
                {activeTab === "team" ? (
                  <div className="relative">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="border bg-white rounded p-2 text-sm text-gray-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
                    >
                      <option value="All">All Roles</option>
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <IoChevronDown className="text-gray-400" size={12} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border bg-white rounded p-2 text-sm text-gray-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
                      >
                        {taskStatusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s === "All"
                              ? "All Statuses"
                              : s === "in-progress"
                              ? "In Progress"
                              : s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <IoChevronDown className="text-gray-400" size={12} />
                      </div>
                    </div>
                    <div className="relative">
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="border bg-white rounded p-2 text-sm text-gray-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary min-w-[130px]"
                      >
                        {priorityOptions.map((p) => (
                          <option key={p} value={p}>
                            {p === "All" ? "All Priorities" : p}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <IoChevronDown className="text-gray-400" size={12} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── TEAM TAB ── */}
            {activeTab === "team" && (
              <>
                <div className="hidden lg:block overflow-x-auto no-scrollbar">
                  <div className="min-w-[800px]">
                    <table className="w-full table-auto">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium">
                            Name
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Email
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Roles
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Phone
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Branch
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Department
                          </th>
                          <th className="p-3 text-center text-sm font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="p-6 text-center text-sm text-gray-400"
                            >
                              No team members found.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr
                              key={u._id}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="p-3 text-sm">{u.name || "N/A"}</td>
                              <td className="p-3 text-sm">
                                {u.email || "N/A"}
                              </td>
                              <td className="p-3 text-sm">
                                {u.roles?.join(", ") || "N/A"}
                              </td>
                              <td className="p-3 text-sm">
                                {u.phone || "N/A"}
                              </td>
                              <td className="p-3 text-sm">
                                {u.branch
                                  ? `(${u.branch.branchCode}) ${u.branch.branchName}`
                                  : "N/A"}
                              </td>
                              <td className="p-3 text-sm">
                                {u.departments?.length
                                  ? u.departments
                                      .map(
                                        (d) =>
                                          `(${d.departmentCode}) ${d.departmentName}`
                                      )
                                      .join(", ")
                                  : "N/A"}
                              </td>
                              <td className="p-3 flex justify-center">
                                <button
                                  onClick={() => handleViewUser(u)}
                                  className="text-orange-600 cursor-pointer hover:text-orange-800 p-1"
                                >
                                  <FaEye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:hidden">
                  {filteredUsers.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">
                      No team members found.
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <div
                        key={u._id}
                        className="border-b border-gray-200 p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base text-gray-900">
                              {u.name || "N/A"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {u.email || "N/A"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewUser(u)}
                            className="text-orange-600 cursor-pointer hover:text-orange-800 p-2 ml-3"
                          >
                            <FaEye size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Roles:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {u.roles?.join(", ") || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Phone:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {u.phone || "N/A"}
                            </span>
                          </div>
                          {u.branch && (
                            <div className="sm:col-span-2">
                              <span className="font-medium text-gray-700">
                                Branch:
                              </span>
                              <span className="ml-2 text-gray-600">
                                ({u.branch.branchCode}) {u.branch.branchName}
                              </span>
                            </div>
                          )}
                          {u.departments?.length > 0 && (
                            <div className="sm:col-span-2">
                              <span className="font-medium text-gray-700">
                                Departments:
                              </span>
                              <span className="ml-2 text-gray-600">
                                {u.departments
                                  .map(
                                    (d) =>
                                      `(${d.departmentCode}) ${d.departmentName}`
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* ── TASKS TAB ── */}
            {activeTab === "tasks" && (
              <>
                <div className="hidden lg:block overflow-x-auto no-scrollbar">
                  <div className="min-w-[1000px]">
                    <table className="w-full table-auto">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium">
                            #
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Issue
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Raised By
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Assigned To
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Branch / Dept
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Status
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Priority
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            Created
                          </th>
                          <th className="p-3 text-center text-sm font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="p-6 text-center text-sm text-gray-400"
                            >
                              No tasks found.
                            </td>
                          </tr>
                        ) : (
                          filteredTasks.map((task) => (
                            <tr
                              key={task._id}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="p-3 text-sm text-gray-500">
                                {task.issueId || "—"}
                              </td>
                              <td className="p-3 text-sm font-medium max-w-[200px]">
                                {task.descriptions?.[0]?.title ||
                                  task.descriptions?.[0]?.description ||
                                  "N/A"}
                              </td>
                              <td className="p-3 text-sm">
                                {task.createdBy?.name || task.userName || "N/A"}
                              </td>
                              <td className="p-3 text-sm">
                                {task.assignedTo?.name || "N/A"}
                              </td>
                              <td className="p-3 text-sm">
                                <div>{task.branch?.branchName || "N/A"}</div>
                                <div className="text-xs text-gray-400">
                                  {task.department?.departmentName || ""}
                                </div>
                              </td>
                              <td className="p-3 text-sm">
                                {getStatusBadge(task.status)}
                              </td>
                              <td className="p-3 text-sm">
                                {getPriorityBadge(task.priority)}
                              </td>
                              <td className="p-3 text-sm whitespace-nowrap">
                                {task.createdAt
                                  ? new Date(
                                      task.createdAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td className="p-3 flex justify-center">
                                <button
                                  onClick={() => handleViewTask(task)}
                                  className="text-orange-600 cursor-pointer hover:text-orange-800 p-1"
                                >
                                  <FaEye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:hidden">
                  {filteredTasks.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">
                      No tasks found.
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task._id}
                        className="border-b border-gray-200 p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {task.issueId && (
                                <span className="text-xs text-gray-400 font-mono">
                                  #{task.issueId}
                                </span>
                              )}
                              <h3 className="font-semibold text-sm text-gray-900">
                                {task.descriptions?.[0]?.title ||
                                  task.descriptions?.[0]?.description ||
                                  "N/A"}
                              </h3>
                            </div>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {getStatusBadge(task.status)}
                              {getPriorityBadge(task.priority)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewTask(task)}
                            className="text-orange-600 cursor-pointer hover:text-orange-800 p-2 ml-2"
                          >
                            <FaEye size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
                          <div>
                            <span className="font-medium text-gray-700">
                              Raised By:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {task.createdBy?.name || task.userName || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Assigned To:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {task.assignedTo?.name || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Branch:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {task.branch?.branchName || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Dept:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {task.department?.departmentName || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Created:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {task.createdAt
                                ? new Date(task.createdAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}

      {/* View Modal */}
      {isModalOpen && (selectedUser || selectedTask) && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                {selectedUser
                  ? "Team Member Details"
                  : `Issue #${selectedTask?.issueId || ""} Details`}
              </h2>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1">
              {/* User detail */}
              {selectedUser && (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Roles:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser.roles?.join(", ") || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Branch:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser.branch
                        ? `(${selectedUser.branch.branchCode}) ${selectedUser.branch.branchName}`
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Departments:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser.departments?.length
                        ? selectedUser.departments
                            .map(
                              (d) => `(${d.departmentCode}) ${d.departmentName}`
                            )
                            .join(", ")
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Created At:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              )}

              {/* Task detail */}
              {selectedTask && (
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    {getStatusBadge(selectedTask.status)}
                    {getPriorityBadge(selectedTask.priority)}
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Raised By:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedTask.createdBy?.name ||
                        selectedTask.userName ||
                        "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Assigned To:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedTask.assignedTo?.name || "N/A"}{" "}
                      {selectedTask.assignedTo?.email
                        ? `(${selectedTask.assignedTo.email})`
                        : ""}
                    </span>
                  </div>

                  {selectedTask.furtherAssignedTo?.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Further Assigned To:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {selectedTask.furtherAssignedTo
                          .map((p) => p.name)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-gray-700">Branch:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedTask.branch
                        ? `(${selectedTask.branch.branchCode}) ${selectedTask.branch.branchName}`
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Department:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedTask.department
                        ? `(${selectedTask.department.departmentCode}) ${selectedTask.department.departmentName}`
                        : "N/A"}
                    </span>
                  </div>

                  {selectedTask.descriptions?.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Descriptions:
                      </span>
                      <div className="mt-1 space-y-2">
                        {selectedTask.descriptions.map((d) => (
                          <div
                            key={d._id}
                            className="bg-gray-50 rounded p-2 text-xs text-gray-600"
                          >
                            {d.title && (
                              <div className="font-medium text-gray-700 mb-0.5">
                                {d.title}
                              </div>
                            )}
                            <div>{d.description}</div>
                            {d.timeline && (
                              <div className="text-gray-400 mt-0.5">
                                Timeline: {d.timeline} {d.timeUnit}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTask.comments?.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Comments:
                      </span>
                      <div className="mt-1 space-y-1">
                        {selectedTask.comments.map((c) => (
                          <div
                            key={c._id}
                            className="bg-gray-50 rounded p-2 text-xs text-gray-600"
                          >
                            <span className="font-medium text-gray-700">
                              {c.commentedBy?.name}:
                            </span>{" "}
                            {c.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTask.feedbacks?.some((f) => f.feedback) && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Feedbacks:
                      </span>
                      <div className="mt-1 space-y-1">
                        {selectedTask.feedbacks
                          .filter((f) => f.feedback)
                          .map((f) => (
                            <div
                              key={f._id}
                              className="bg-gray-50 rounded p-2 text-xs text-gray-600"
                            >
                              <span className="font-medium text-gray-700">
                                {f.createdBy?.name}
                              </span>
                              {f.rating != null && f.rating > 0 && (
                                <span className="ml-1 text-yellow-500">
                                  {"★".repeat(f.rating)}
                                </span>
                              )}
                              {f.feedback && (
                                <span className="ml-1">— {f.feedback}</span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {selectedTask.attachment && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Attachment:
                      </span>
                      <a
                        href={selectedTask.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-orange-600 hover:underline text-xs"
                      >
                        View Attachment
                      </a>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-gray-700">
                      Created At:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedTask.createdAt
                        ? new Date(selectedTask.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6 pt-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                    setSelectedTask(null);
                  }}
                  className="bg-black cursor-pointer text-white px-4 py-2 rounded-md text-sm"
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

export default MyTeam;
