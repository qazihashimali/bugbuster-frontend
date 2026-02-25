import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

const Users = () => {
  const user =
    (localStorage.getItem("user") &&
      JSON.parse(localStorage.getItem("user"))) ||
    null;
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isReportsToOpen, setIsReportsToOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterRole, setFilterRole] = useState("All");
  const [filterCompany, setFilterCompany] = useState("All");
  const [companies, setCompanies] = useState([]);
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
    reportHim: [],
  });

  const roleOptions = ["EndUser", "ServiceProvider", "Admin", "SuperAdmin"];
  const roleDisplay = roleOptions.reduce(
    (acc, role) => ({ ...acc, [role]: role }),
    {}
  );

  const fetchUsers = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found.");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/users`,
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
          "Response status:",
          response.status,
          "Response text:",
          text
        );
        toast.error(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
      console.log(data);
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllCompanies = async () => {
    try {
      if (parentDB !== user?.company) {
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/company`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to fetch companies");
    }
  };

  const fetchDropdowns = async (companyName = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/auth/dropdowns?company=${encodeURIComponent(companyName)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        toast.error(`Failed to fetch dropdowns: ${response.status}`);
      const data = await response.json();
      setDropdowns({
        blocks: data.blocks || [],
        branches: data.branches || [],
        departments: data.departments || [],
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDropdowns();
    getAllCompanies().then((data) => {
      setCompanies(data || []);
    });
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
      branch: user.branch?._id || "",
      department: user.department?._id || "",
      reportHim: user.reportHim || [],
    });

    fetchDropdowns(user.company); // pass the company name directly

    setIsEditing(true);
    setIsModalOpen(true);
  };

  const parentDB = import.meta.env.VITE_ALLOWED_COMPANIES;

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found.");

      if (
        (formData.roles.includes("EndUser") ||
          formData.roles.includes("ServiceProvider")) &&
        !formData.phone
      ) {
        toast.error("Phone number is required for selected roles");
      }
      if (
        formData.roles.includes("ServiceProvider") &&
        (!formData.branch || !formData.department)
      ) {
        toast.error("Branch and department are required for selected role");
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/users/${
          selectedUser._id
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok) toast.error(data.message || "Failed to update user");

      if (!data.user) toast.error("No user data returned from server");
      setUsers(users.map((u) => (u._id === selectedUser._id ? data.user : u)));
      setIsModalOpen(false);
      // setFormData({ name: "", email: "", roles: [], phone: "", houseNo: "", block: "", branch: "", department: "" });
      setFormData({
        name: "",
        email: "",
        roles: [],
        phone: "",
        branch: "",
        department: "",
        reportHim: [],
      });

      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found.");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/users/${user._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) toast.error(data.message || "Failed to delete user");

      setUsers(users.filter((u) => u._id !== user._id));
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   if (type === "checkbox") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       roles: checked
  //         ? [...prev.roles, value]
  //         : prev.roles.filter((role) => role !== value),
  //     }));
  //   } else {
  //     setFormData((prev) => ({ ...prev, [name]: value }));
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value, type, checked, selectedOptions } = e.target;

    // Roles checkbox
    if (type === "checkbox" && name === "roles") {
      setFormData((prev) => ({
        ...prev,
        roles: checked
          ? [...prev.roles, value]
          : prev.roles.filter((r) => r !== value),
      }));
      return;
    }

    // Reports To (multi-select)
    if (name === "reportHim") {
      const values = Array.from(selectedOptions, (o) => o.value);
      setFormData((prev) => ({ ...prev, reportHim: values }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReportsToToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      reportHim: Array.isArray(prev.reportHim)
        ? prev.reportHim.includes(id)
          ? prev.reportHim.filter((item) => item !== id)
          : [...prev.reportHim, id]
        : [id],
    }));
  };

  const filteredUsers = users.filter((user) => {
    const roleMatch = filterRole === "All" || user.roles.includes(filterRole);

    const companyMatch =
      filterCompany === "All" || user.company === filterCompany;

    return roleMatch && companyMatch;
  });

  const reportToOptions = users.filter(
    (u) =>
      u?._id !== selectedUser?._id &&
      u.roles.includes("ServiceProvider") &&
      u.company === selectedUser?.company
  );

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
        <div className="bg-primary text-white p-3 sm:p-4 rounded-t-lg">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
            User Management
          </h1>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-base sm:text-lg font-semibold">
                Users Details
              </h2>
              <div className="flex justify-end items-center space-x-4">
                {/* Role Dropdown */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border bg-white rounded p-2 text-sm text-gray-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto min-w-[140px]"
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

                {/* Company Dropdown (conditional) */}
                {parentDB === user?.company && (
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value)}
                      className="border bg-white rounded p-2 text-sm text-gray-800 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto min-w-[140px]"
                    >
                      <option value="All">All Companies</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company.name}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <IoChevronDown className="text-gray-400" size={12} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Table View with Scrollbar */}
            <div className="hidden lg:block overflow-x-auto no-scrollbar">
              <div className="min-w-[1000px]">
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
                      {/* <th className="p-3 text-left text-sm font-medium">House No</th>
                      <th className="p-3 text-left text-sm font-medium">Block</th> */}
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
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-3 text-sm">{user.name || "N/A"}</td>
                        <td className="p-3 text-sm">{user.email || "N/A"}</td>
                        <td className="p-3 text-sm">
                          {user.roles?.length > 0
                            ? user.roles.join(", ")
                            : "N/A"}
                        </td>
                        <td className="p-3 text-sm">{user.phone || "N/A"}</td>
                        {/* <td className="p-3 text-sm">{user.houseNo || "N/A"}</td>
                        <td className="p-3 text-sm">
                          {user.block ? `(${user.block.blockCode}) ${user.block.blockName}` : "N/A"}
                        </td> */}
                        <td className="p-3 text-sm">
                          {user.branch
                            ? `(${user.branch.branchCode}) ${user.branch.branchName}`
                            : "N/A"}
                        </td>
                        <td className="p-3 text-sm">
                          {user.department
                            ? `(${user.department.departmentCode}) ${user.department.departmentName}`
                            : "N/A"}
                        </td>
                        <td className="p-3 flex justify-center space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-orange-600 cursor-pointer hover:text-orange-800 p-1"
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-orange-600 cursor-pointer hover:text-orange-800 p-1"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-orange-600 cursor-pointer hover:text-orange-800 p-1"
                          >
                            <FaTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="border-b border-gray-200 p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-gray-900">
                        {user?.name || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {user?.email || "N/A"}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-3">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-orange-600 cursor-pointer hover:text-orange-800 p-2"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-orange-600 cursor-pointer hover:text-orange-800 p-2"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-orange-600 cursor-pointer hover:text-orange-800 p-2"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Roles:</span>
                      <span className="ml-2 text-gray-600">
                        {user?.roles?.length > 0
                          ? user.roles.join(", ")
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2 text-gray-600">
                        {user?.phone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">House:</span>
                      <span className="ml-2 text-gray-600">
                        {user?.houseNo || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Block:</span>
                      <span className="ml-2 text-gray-600">
                        {user?.block ? `${user.block.blockCode}` : "N/A"}
                      </span>
                    </div>
                    {user.branch && (
                      <div className="sm:col-span-2">
                        <span className="font-medium text-gray-700">
                          Branch:
                        </span>
                        <span className="ml-2 text-gray-600">
                          ({user.branch.branchCode}) {user.branch.branchName}
                        </span>
                      </div>
                    )}
                    {user.department && (
                      <div className="sm:col-span-2">
                        <span className="font-medium text-gray-700">
                          Department:
                        </span>
                        <span className="ml-2 text-gray-600">
                          ({user?.department?.departmentCode}){" "}
                          {user?.department?.departmentName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                {isEditing ? "Edit User" : "View User"}
              </h2>
            </div>
            {isEditing ? (
              <div className="overflow-y-auto no-scrollbar flex-1 pr-2">
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      Persons who Report Him.{" "}
                    </label>

                    {/* Dropdown Button */}
                    <button
                      type="button"
                      onClick={() => setIsReportsToOpen(!isReportsToOpen)}
                      className="w-full focus:outline-none focus:ring-2 focus:ring-primary px-3 py-2 border rounded-md text-left text-sm bg-white flex justify-between items-center"
                    >
                      <span className="text-gray-700">
                        {formData.reportHim?.length
                          ? reportToOptions
                              .filter((p) => formData.reportHim.includes(p._id))
                              .map((p) => p.name)
                              .join(", ")
                          : "Select persons"}
                      </span>
                      <IoChevronDown className="text-gray-400" size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {isReportsToOpen && (
                      <div className="absolute  z-20 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto no-scrollbar">
                        {reportToOptions.map((person) => (
                          <label
                            key={person._id}
                            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={formData.reportHim.includes(person._id)}
                              onChange={() => handleReportsToToggle(person._id)}
                            />
                            {person.name} ({person.roles})
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Roles
                    </label>
                    <div className="space-y-1">
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
                          <label htmlFor={`role-${role}`} className="text-sm">
                            {roleDisplay[role]}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(formData.roles.includes("EndUser") ||
                    formData.roles.includes("ServiceProvider")) && (
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium mb-1"
                      >
                        Phone
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        required
                      />
                    </div>
                  )}
                  {/* {formData.roles.includes("EndUser") && (
                    <>
                      <div>
                        <label htmlFor="houseNo" className="block text-sm font-medium mb-1">
                          House Number
                        </label>
                        <input
                          type="text"
                          id="houseNo"
                          name="houseNo"
                          value={formData.houseNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="block" className="block text-sm font-medium mb-1">
                          Block
                        </label>
                        <select
                          id="block"
                          name="block"
                          value={formData.block}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                    </>
                  )} */}
                  {formData.roles.includes("ServiceProvider") && (
                    <>
                      <div>
                        <label
                          htmlFor="branch"
                          className="block text-sm font-medium mb-1"
                        >
                          Branch
                        </label>
                        <select
                          id="branch"
                          name="branch"
                          value={formData.branch}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          required
                        >
                          <option value="">Select Branch</option>
                          {dropdowns.branches.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                              ({branch?.branchCode}) {branch?.branchName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="department"
                          className="block text-sm font-medium mb-1"
                        >
                          Department
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          required
                        >
                          <option value="">Select Department</option>
                          {dropdowns.departments.map((department) => (
                            <option key={department._id} value={department._id}>
                              ({department.departmentCode}){" "}
                              {department.departmentName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-4 sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-black cursor-pointer text-white px-4 py-2 rounded-md  text-sm order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md text-sm order-1 sm:order-2"
                      disabled={isLoading}
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="overflow-y-auto no-scrollbar  flex-1">
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
                      {selectedUser.roles?.length > 0
                        ? selectedUser.roles.join(", ")
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser?.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      House Number:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser?.houseNo || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Block:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser?.block
                        ? `(${selectedUser?.block?.blockCode}) ${selectedUser?.block?.blockName}`
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Branch:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser?.branch
                        ? `(${selectedUser.branch.branchCode}) ${selectedUser.branch.branchName}`
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Department:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser?.department
                        ? `(${selectedUser.department.departmentCode}) ${selectedUser.department.departmentName}`
                        : "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Created At:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedUser?.createdAt
                        ? new Date(selectedUser?.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-6 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-black cursor-pointer text-white px-4 py-2 rounded-md  text-sm"
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
