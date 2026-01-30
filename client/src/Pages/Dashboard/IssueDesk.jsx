import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import { FaPlusCircle } from "react-icons/fa";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

export default function IssueDesk() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    branch: "",
    department: "",
    assignedTo: "",
    description: "",
    priority: "Medium",
    attachment: null,
    status: "pending",
  });
  const [selectedDescription, setSelectedDescription] = useState("");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState({});
  const [dropdowns, setDropdowns] = useState({
    branches: [],
    departments: [],
    users: [],
    filteredUsers: [],
    descriptions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    const loadInitialData = async () => {
      const userData = localStorage.getItem("user");

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData((prev) => ({ ...prev, userName: parsedUser.name }));
      }

      if (!hasFetched.current) {
        hasFetched.current = true;
        setIsLoading(true);

        try {
          const token = localStorage.getItem("token");
          if (!token) toast.error("No authentication token found");

          const dropdownResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/issues/dropdowns`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!dropdownResponse.ok) {
            const text = await dropdownResponse.text();
            console.error(
              "Dropdowns response status:",
              dropdownResponse.status,
              "Response text:",
              text
            );
            toast.error(
              `Failed to fetch dropdown data: ${dropdownResponse.status} ${dropdownResponse.statusText}`
            );
          }
          const dropdownData = await dropdownResponse.json();

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
            descriptions: Array.isArray(dropdownData.descriptions)
              ? dropdownData.descriptions
              : [],
          });
        } catch (err) {
          console.error(err);
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.branch && formData.department) {
      const filtered = dropdowns.users.filter(
        (user) =>
          user.branch === formData.branch &&
          user.department === formData.department
      );
      setDropdowns((prev) => ({ ...prev, filteredUsers: filtered }));
    } else {
      setDropdowns((prev) => ({ ...prev, filteredUsers: prev.users }));
    }
  }, [formData.branch, formData.department, dropdowns.users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (
      name === "branch" ||
      name === "department" ||
      name === "assignedTo" ||
      name === "priority" ||
      name === "status"
    ) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDescriptionSelect = (description) => {
    if (description === "custom") {
      setSelectedDescription({ title: "custom" });
      setFormData((prev) => ({ ...prev, description: "" }));
    } else if (description) {
      setSelectedDescription(description);
      setFormData((prev) => ({
        ...prev,
        description: description._id,
      }));
    }
    setIsDescriptionOpen(false);
  };

  const handleCustomDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found");

      const formDataToSend = new FormData();
      formDataToSend.append("userName", formData.userName);
      formDataToSend.append("branch", formData.branch);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("assignedTo", formData.assignedTo);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("status", formData.status);
      if (formData.attachment) {
        formDataToSend.append("attachment", formData.attachment);
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();
      if (!response.ok) toast.error(data.message || "Failed to submit issue");

      if (!data.issue) toast.error("Invalid response: issue data missing");

      setFormData({
        userName: user?.name || "",
        branch: "",
        department: "",
        assignedTo: "",
        description: "",
        priority: "Medium",
        attachment: null,
        status: "pending",
      });
      setSelectedDescription("");
      setIsDetailsOpen({});
      setIsDescriptionOpen(false);
      const attachmentInput = document.getElementById("attachment");
      if (attachmentInput) {
        attachmentInput.value = null;
      }

      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      toast.success("Issue submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit issue. Please try again.");
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
          <h1 className="text-2xl font-bold">Issue Desk</h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    User Name
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter user name"
                    disabled
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="branch"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Branch
                  </label>
                  <div className="relative">
                    <select
                      id="branch"
                      name="branch"
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Branch</option>
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
                    Department
                  </label>
                  <div className="relative">
                    <select
                      id="department"
                      name="department"
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {dropdowns.departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.departmentName} (
                          {department.departmentCode})
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
                    htmlFor="assignedTo"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Assigned To
                  </label>
                  <div className="relative">
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.assignedTo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select User</option>
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

              {/* Description and Priority Section - Side by Side */}
              <div className="mt-6 flex gap-6 items-start">
                {/* Priority and Attachment Section */}
                <div className="flex-shrink-0 w-64 space-y-4">
                  {/* Priority */}
                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                    >
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        id="priority"
                        name="priority"
                        className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.priority}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <IoChevronDown className="text-gray-400" size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Attachment */}
                  <div>
                    <label
                      htmlFor="attachment"
                      className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                    >
                      Attachment
                    </label>
                    <div className="border rounded-md p-3">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("attachment").click()
                        }
                        className="w-full bg-gray-300 cursor-pointer text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400 transition"
                      >
                        Choose File
                      </button>
                      <input
                        id="attachment"
                        type="file"
                        name="attachment"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                      />
                      <p className="mt-2 text-xs text-gray-500 break-words text-center">
                        {formData.attachment
                          ? formData.attachment.name
                          : "No file chosen"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="flex-1">
                  <label
                    htmlFor="addDescription"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Add Description
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary flex justify-between items-center"
                      onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    >
                      <span>
                        {selectedDescription
                          ? selectedDescription.title
                          : "Select Descriptions"}
                      </span>
                      <IoChevronDown className="text-gray-400" size={16} />
                    </button>
                    {isDescriptionOpen && (
                      <ul className="absolute w-full bg-white border border-gray-200 rounded-md mt-1 z-50 max-h-40 overflow-y-auto shadow-lg backdrop-blur-0 bg-opacity-100">
                        <li className="px-4 py-2 text-gray-800 font-semibold">
                          Predefined Descriptions
                        </li>
                        {dropdowns.descriptions.map((desc) => (
                          <div key={desc._id}>
                            <li
                              className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                              onClick={() => handleDescriptionSelect(desc)}
                            >
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedDescription?._id === desc._id
                                  }
                                  onChange={() => {}}
                                  className="mr-2 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-primary"
                                />
                                <span>{desc?.title}</span>
                              </div>
                              <button
                                type="button"
                                className="text-orange-600 hover:text-orange-800 ml-2 flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsDetailsOpen((prev) => ({
                                    ...prev,
                                    [desc._id]: !prev[desc._id],
                                  }));
                                }}
                              >
                                <IoChevronDown
                                  className="ml-1 text-gray-500"
                                  size={14}
                                />
                              </button>
                            </li>
                            {isDetailsOpen[desc._id] && (
                              <li className="px-6 py-2 text-white bg-primary rounded-b-md">
                                Details: {desc.description?.title} (Timeline:{" "}
                                {desc.timeline} {desc.timeUnit})
                              </li>
                            )}
                          </div>
                        ))}
                        <li
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                          onClick={() => handleDescriptionSelect("custom")}
                        >
                          <div className="flex items-center w-full">
                            <input
                              type="checkbox"
                              checked={selectedDescription?.title?.includes(
                                "custom"
                              )}
                              onChange={() => {}}
                              className="mr-2 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-primary"
                            />
                            <span>Add Custom Description</span>
                          </div>
                        </li>
                      </ul>
                    )}

                    {selectedDescription.title?.includes("custom") && (
                      <div className="mt-2">
                        <textarea
                          id="description"
                          name="description"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 text-black placeholder-gray-500"
                          rows="4"
                          value={formData.description}
                          onChange={handleCustomDescriptionChange}
                          placeholder="Enter custom issue description"
                          required
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      userName: user?.name || "",
                      branch: "",
                      department: "",
                      assignedTo: "",
                      description: "",
                      priority: "Medium",
                      attachment: null,
                      status: "pending",
                    });
                    setSelectedDescription("");
                    setIsDetailsOpen({});
                    setIsDescriptionOpen(false);
                    const attachment = document.getElementById("attachment");
                    if (attachment) {
                      attachment.value = "";
                    }
                  }}
                  className="bg-black cursor-pointer text-white px-4 py-2 rounded-md"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md flex items-center"
                  disabled={
                    isLoading ||
                    (!formData.description &&
                      !selectedDescription.title?.includes("custom"))
                  }
                >
                  <FaPlusCircle className="mr-2" /> Add
                </button>
              </div>
            </form>
          </div>
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
