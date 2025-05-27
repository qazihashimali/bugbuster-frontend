import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import Loading from "../Components/Loading";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterRole, setFilterRole] = useState("All");
  const [dropdowns, setDropdowns] = useState({
    blocks: [],
    branches: [],
    departments: [],
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roles: [],
    phone: "",
    houseNo: "",
    block: "",
    branch: "",
    department: "",
  });

  const roleOptions = ["EndUser", "ServiceProvider", "Admin"];
  const roleDisplay = roleOptions.reduce(
    (acc, role) => ({ ...acc, [role]: role }),
    {}
  );

  const fetchUsers = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in.");

      const response = await fetch("https://bugbuster-backend.vercel.app/api/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Response status:", response.status, "Response text:", text);
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
      if (Date.now() - start < 2000)
        await new Promise((resolve) => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const response = await fetch("https://bugbuster-backend.vercel.app/api/auth/dropdowns", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Dropdowns response status:", response.status, "Response text:", text);
        throw new Error(`Failed to fetch dropdowns: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setDropdowns({
        blocks: data.blocks || [],
        branches: data.branches || [],
        departments: data.departments || [],
      });
    } catch (err) {
      console.error("Fetch dropdowns error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDropdowns();
  }, []);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      roles: user.roles || [],
      phone: user.phone || "",
      houseNo: user.houseNo || "",
      block: user.block?._id || "",
      branch: user.branch?._id || "",
      department: user.department?._id || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Client-side validation
      if (formData.roles.includes("EndUser") && (!formData.houseNo || !formData.block)) {
        throw new Error("House number and block are required for EndUser");
      }
      if ((formData.roles.includes("EndUser") || formData.roles.includes("ServiceProvider")) && !formData.phone) {
        throw new Error("Phone is required for EndUser or ServiceProvider");
      }
      if (formData.roles.includes("ServiceProvider") && (!formData.branch || !formData.department)) {
        throw new Error("Branch and department are required for ServiceProvider");
      }

      const response = await fetch(`https://bugbuster-backend.vercel.app/api/auth/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update user");

      if (!data.user) throw new Error("Invalid response: user data missing");
      setUsers(users.map((u) => (u._id === selectedUser._id ? data.user : u)));
      setIsModalOpen(false);
      setFormData({ name: "", email: "", roles: [], phone: "", houseNo: "", block: "", branch: "", department: "" });
      if (Date.now() - start < 2000)
        await new Promise((resolve) => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setError("");
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`https://bugbuster-backend.vercel.app/api/auth/users/${user._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete user");

      setUsers(users.filter((u) => u._id !== user._id));
      if (Date.now() - start < 2000)
        await new Promise((resolve) => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        roles: checked
          ? [...prev.roles, value]
          : prev.roles.filter((role) => role !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Filter users based on selected role
  const filteredUsers =
    filterRole || filterRole === "All"
      ? users
      : users.filter((user) => user.roles.includes(filterRole));

  return (
    <div className="relative container mx-auto p-6 bg-gray-100 min-h-screen" aria-busy={isLoading || isSubmitting}>
      <div className={`bg-white shadow-md rounded-lg ${isLoading || isSubmitting ? "blur-sm" : ""}`}>
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-bold">User Management</h1>
        </div>

        {error && <div className="p-4 text-red-600">{error}</div>}

        <div className="p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Users Details</h2>
              <div className="relative">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="border bg-white rounded p-1 text-sm text-gray-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {roleDisplay[role]}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <IoChevronDown className="text-gray-400" size={12} />
                </div>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Roles</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">House No</th>
                  <th className="p-3 text-left">Block</th>
                  <th className="p-3 text-left">Branch</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="">
                    <td className="p-3">{user.name || "N/A"}</td>
                    <td className="p-3">{user.email || "N/A"}</td>
                    <td className="p-3">
                      {user.roles?.length > 0 ? user.roles.join(", ") : "N/A"}
                    </td>
                    <td className="p-3">{user.phone || "N/A"}</td>
                    <td className="p-3">{user.houseNo || "N/A"}</td>
                    <td className="p-3">
                      {user.block ? `(${user.block.blockCode}) ${user.block.blockName}` : "N/A"}
                    </td>
                    <td className="p-3">
                      {user.branch ? `(${user.branch.branchCode}) ${user.branch.branchName}` : "N/A"}
                    </td>
                    <td className="p-3">
                      {user.department
                        ? `(${user.department.departmentCode}) ${user.department.departmentName}`
                        : "N/A"}
                    </td>
                    <td className="p-3 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(isLoading || isSubmitting) && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}

      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit User" : "View User"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>
            {isEditing ? (
              <div className="overflow-y-auto flex-1 pr-2">
                <form onSubmit={handleUpdateUser}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Roles</label>
                    {roleOptions.map((role) => (
                      <div key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`role-${role}`}
                          name="roles"
                          value={role}
                          checked={formData.roles.includes(role)}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label htmlFor={`role-${role}`}>{roleDisplay[role]}</label>
                      </div>
                    ))}
                  </div>
                  {(formData.roles.includes("EndUser") || formData.roles.includes("ServiceProvider")) && (
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  )}
                  {formData.roles.includes("EndUser") && (
                    <div className="mb-4">
                      <label htmlFor="houseNo" className="block text-sm font-medium mb-1">
                        House Number
                      </label>
                      <input
                        type="text"
                        id="houseNo"
                        name="houseNo"
                        value={formData.houseNo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  )}
                  {formData.roles.includes("EndUser") && (
                    <div className="mb-4">
                      <label htmlFor="block" className="block text-sm font-medium mb-1">
                        Block
                      </label>
                      <select
                        id="block"
                        name="block"
                        value={formData.block}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="">Select Block</option>
                        {dropdowns.blocks.map((block) => (
                          <option key={block._id} value={block._id}>
                            ({block.blockCode}) {block.blockName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.roles.includes("ServiceProvider") && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="branch" className="block text-sm font-medium mb-1">
                          Branch
                        </label>
                        <select
                          id="branch"
                          name="branch"
                          value={formData.branch}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        >
                          <option value="">Select Branch</option>
                          {dropdowns.branches.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                              ({branch.branchCode}) {branch.branchName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="department" className="block text-sm font-medium mb-1">
                          Department
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        >
                          <option value="">Select Department</option>
                          {dropdowns.departments.map((department) => (
                            <option key={department._id} value={department._id}>
                              ({department.departmentCode}) {department.departmentName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-md"
                      disabled={isLoading || isSubmitting}
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <p><strong>Name:</strong> {selectedUser.name || "N/A"}</p>
                <p><strong>Email:</strong> {selectedUser.email || "N/A"}</p>
                <p><strong>Roles:</strong> {selectedUser.roles?.length > 0 ? selectedUser.roles.join(", ") : "N/A"}</p>
                <p><strong>Phone:</strong> {selectedUser.phone || "N/A"}</p>
                <p><strong>House Number:</strong> {selectedUser.houseNo || "N/A"}</p>
                <p><strong>Block:</strong> {selectedUser.block ? `(${selectedUser.block.blockCode}) ${selectedUser.block.blockName}` : "N/A"}</p>
                <p><strong>Branch:</strong> {selectedUser.branch ? `(${selectedUser.branch.branchCode}) ${selectedUser.branch.branchName}` : "N/A"}</p>
                <p><strong>Department:</strong> {selectedUser.department ? `(${selectedUser.department.departmentCode}) ${selectedUser.department.departmentName}` : "N/A"}</p>
                <p><strong>Created At:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "N/A"}</p>
                <div className="flex justify-end mt-4">
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
      )}
    </div>
  );
};

export default Users;