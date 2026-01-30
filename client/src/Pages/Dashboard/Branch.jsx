import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaPlusCircle, FaTimes } from "react-icons/fa";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

const Branch = () => {
  const [branches, setBranches] = useState([]);
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchBranches = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found. Please log in.");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/branches`,
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
        toast.error("Failed to fetch branches");
      }

      const data = await response.json();
      setBranches(data);
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch branches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleAddBranch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found. Please log in.");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/branches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ branchCode, branchName }),
        }
      );

      const data = await response.json();
      if (!response.ok) toast.error(data.message || "Failed to add branch");

      setBranches([...branches, data.branch]);
      setBranchCode("");
      setBranchName("");
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

  const handleViewBranch = (branch) => {
    setSelectedBranch(branch);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditBranch = (branch) => {
    setSelectedBranch(branch);
    setBranchCode(branch.branchCode);
    setBranchName(branch.branchName);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found. Please log in.");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/branches/${
          selectedBranch._id
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ branchCode, branchName }),
        }
      );

      const data = await response.json();
      if (!response.ok) toast.error(data.message || "Failed to update branch");

      setBranches(
        branches.map((b) => (b._id === selectedBranch._id ? data.branch : b))
      );
      setIsModalOpen(false);
      setBranchCode("");
      setBranchName("");
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

  const handleDeleteBranch = async (branch) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;

    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/branches/${branch._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) toast.error(data.message || "Failed to delete branch");

      setBranches(branches.filter((b) => b._id !== branch._id));
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

  return (
    <div className="relative container mx-auto p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Branch</h1>
        </div>

        <div className="p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3">
              <h2 className="text-lg font-semibold">Details</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">
                    Branch Code
                  </th>
                  <th className="p-3 text-left text-sm font-medium">
                    Branch Name
                  </th>
                  <th className="p-3 text-center text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch._id} className="">
                    <td className="p-3 text-sm">{branch.branchCode}</td>
                    <td className="p-3 text-sm">{branch.branchName}</td>
                    <td className="p-3 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewBranch(branch)}
                        className="text-orange-600 cursor-pointer hover:text-orange-800"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditBranch(branch)}
                        className="text-orange-600 cursor-pointer hover:text-orange-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch)}
                        className="text-orange-600 cursor-pointer hover:text-orange-800"
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

        <div className="p-6">
          <form onSubmit={handleAddBranch}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="branchCode"
                  className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                >
                  Branch Code
                </label>
                <input
                  type="text"
                  id="branchCode"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter Branch Code"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="branchName"
                  className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                >
                  Branch Name
                </label>
                <input
                  type="text"
                  id="branchName"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter Branch Name"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setBranchCode("");
                  setBranchName("");
                }}
                className="bg-black cursor-pointer text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 cursor-pointer rounded-md flex items-center"
                disabled={isLoading}
              >
                <FaPlusCircle className="mr-2" /> Add
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

      {isModalOpen && selectedBranch && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Branch" : "View Branch"}
              </h2>
            </div>
            {isEditing ? (
              <form onSubmit={handleUpdateBranch}>
                <div className="mb-4">
                  <label
                    htmlFor="modalBranchCode"
                    className="block text-sm font-medium mb-1"
                  >
                    Branch Code
                  </label>
                  <input
                    type="text"
                    id="modalBranchCode"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalBranchName"
                    className="block text-sm font-medium mb-1"
                  >
                    Branch Name
                  </label>
                  <input
                    type="text"
                    id="modalBranchName"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
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
                    className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md"
                    disabled={isLoading}
                  >
                    Update
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p>
                  <strong>Branch Code:</strong> {selectedBranch.branchCode}
                </p>
                <p>
                  <strong>Branch Name:</strong> {selectedBranch.branchName}
                </p>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-black cursor-pointer text-white px-4 py-2 rounded-md"
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

export default Branch;
