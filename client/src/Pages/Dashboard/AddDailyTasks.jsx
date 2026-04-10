import { useState, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import { FaPlusCircle, FaPlus, FaTrash } from "react-icons/fa";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

const ACTIVITIES = [
  "Customer Interaction",
  "End-to-End/Business Process",
  "ERP Integration",
  "Existing Map Update",
  "Internal Meeting",
  "Other (Provide Description)",
  "Support",
  "Testing",
  "Training",
  "Connectiviy",
  "Architecting",
  "Development",
];

const PROJECTS = [
  "Project",
  "WorkWise",
  "Unified Commerce Solutions",
  "Hungrie",
  "Support",
  "Bug Buster",
  "Go Foods",
  "NITSEL (Internal)",
  "NITSEL (Training)",
  "FBR Invoicing",
  "Market Place",
  "Daneen Bakhsh",
];

const today = () => new Date().toISOString().split("T")[0];

const emptyTask = () => ({
  id: Date.now() + Math.random(),
  project: "",
  activity: "",
  hours: "",
  description: "",
});

export default function DailyReport() {
  // Pulled from localStorage login response
  const [userName, setUserName] = useState("");
  const [userBranch, setUserBranch] = useState(null); // { _id, branchName, branchCode }
  const [userDepartments, setUserDepartments] = useState([]); // [{ _id, departmentName, departmentCode }]

  // User-selected fields
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState(today());
  const [tasks, setTasks] = useState([emptyTask()]);

  const [isLoading, setIsLoading] = useState(false);

  // On mount: read user object saved at login from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      toast.error("No logged-in user found");
      return;
    }
    try {
      const user = JSON.parse(raw);
      setUserName(user.name || "");
      setUserBranch(user.branch || null);
      setUserDepartments(
        Array.isArray(user.departments) ? user.departments : []
      );
    } catch {
      toast.error("Failed to parse user data");
    }
  }, []);

  // Task helpers
  const addTask = () => setTasks((prev) => [...prev, emptyTask()]);

  const removeTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const updateTask = (id, field, value) =>
    setTasks((prev) =>
      prev.map((t) => (t.id !== id ? t : { ...t, [field]: value }))
    );

  const totalHours = tasks.reduce(
    (sum, t) => sum + (parseFloat(t.hours) || 0),
    0
  );

  const handleClear = () => {
    setDepartment("");
    setDate(today());
    setTasks([emptyTask()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validTasks = tasks.filter(
      (t) => t.project && t.activity && t.hours && t.description.trim()
    );

    if (validTasks.length === 0) {
      toast.error("Please fill at least one complete task row");
      return;
    }

    setIsLoading(true);
    const start = Date.now();

    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No authentication token found");

      const payload = {
        userName,
        branch: userBranch?._id || "",
        department,
        date,
        tasks: validTasks.map(({ project, activity, hours, description }) => ({
          project,
          activity,
          hours: parseFloat(hours),
          description,
        })),
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      console.log(payload);

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Failed to submit report");
        return;
      }

      setDepartment("");
      setDate(today());
      setTasks([emptyTask()]);

      if (Date.now() - start < 2000) {
        await new Promise((r) => setTimeout(r, 2000 - (Date.now() - start)));
      }
      toast.success("Daily report submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Daily Task Report</h1>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {/* User Name — from login, read only */}
              <div>
                <label className="block text-sm font-medium mb-1 bg-white w-fit relative top-[13px] ml-[14px] px-1 z-20">
                  User Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  value={userName}
                  disabled
                />
              </div>

              {/* Date — user picks, defaults to today */}
              <div>
                <label className="block text-sm font-medium mb-1 bg-white w-fit relative top-[13px] ml-[14px] px-1 z-20">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              {/* Branch — from login, read only */}
              <div>
                <label className="block text-sm font-medium mb-1 bg-white w-fit relative top-[13px] ml-[14px] px-1 z-20">
                  Branch
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  value={
                    userBranch
                      ? `${userBranch.branchName} (${userBranch.branchCode})`
                      : "N/A"
                  }
                  disabled
                />
              </div>

              {/* Department — from login user.departments, user selects */}
              <div>
                <label className="block text-sm font-medium mb-1 bg-white w-fit relative top-[13px] ml-[14px] px-1 z-20">
                  Department
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    {userDepartments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.departmentName} ({d.departmentCode})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <IoChevronDown className="text-gray-400" size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Tasks Section */}
            <div className="mt-8">
              <h2 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">
                Daily Tasks
              </h2>

              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      Task {index + 1}
                    </span>
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(task.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                      >
                        <FaTrash size={12} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    {/* Project — hardcoded */}
                    <div>
                      <label className="block text-sm font-medium mb-1 bg-gray-50 w-fit relative top-[13px] ml-[14px] px-1 z-20">
                        Project
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          value={task.project}
                          onChange={(e) =>
                            updateTask(task.id, "project", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Project</option>
                          {PROJECTS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <IoChevronDown className="text-gray-400" size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Activity — hardcoded */}
                    <div>
                      <label className="block text-sm font-medium mb-1 bg-gray-50 w-fit relative top-[13px] ml-[14px] px-1 z-20">
                        Activity
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          value={task.activity}
                          onChange={(e) =>
                            updateTask(task.id, "activity", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Activity</option>
                          {ACTIVITIES.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <IoChevronDown className="text-gray-400" size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Work Hours — user types */}
                    <div>
                      <label className="block text-sm font-medium mb-1 bg-gray-50 w-fit relative top-[13px] ml-[14px] px-1 z-20">
                        Work Hours
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        value={task.hours}
                        onChange={(e) =>
                          updateTask(task.id, "hours", e.target.value)
                        }
                        placeholder="e.g. 2.5"
                        min="0.5"
                        max="24"
                        step="0.5"
                        required
                      />
                    </div>
                  </div>

                  {/* Description — user types */}
                  <div>
                    <label className="block text-sm font-medium mb-1 bg-gray-50 w-fit relative top-[13px] ml-[14px] px-1 z-20">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white resize-none"
                      rows={3}
                      value={task.description}
                      onChange={(e) =>
                        updateTask(task.id, "description", e.target.value)
                      }
                      placeholder="Brief description of work done..."
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Add Task Button */}
              <button
                type="button"
                onClick={addTask}
                className="mt-1 text-primary hover:opacity-80 flex items-center gap-2 text-sm border border-dashed border-primary px-4 py-2 rounded-md w-full justify-center"
              >
                <FaPlus size={12} /> Add Another Task
              </button>

              {/* Total Hours */}
              <div className="flex justify-end mt-4">
                <span className="text-sm text-gray-500 mr-2">Total Hours:</span>
                <span className="text-sm font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                  {totalHours.toFixed(1)} hrs
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClear}
                className="bg-black cursor-pointer text-white px-4 py-2 rounded-md"
              >
                Clear
              </button>
              <button
                type="submit"
                className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md flex items-center"
                disabled={isLoading}
              >
                <FaPlusCircle className="mr-2" /> Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
    </div>
  );
}
