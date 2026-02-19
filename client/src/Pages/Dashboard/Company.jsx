import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaPlusCircle, FaTimes } from "react-icons/fa";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

const createCompany = async ({ name, createdBy }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) toast.error("No authentication token found");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/company`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email: createdBy }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error:", errorData);
      toast.error(errorData.message);
    }

    return response.json();
  } catch (error) {
    console.error("Create error:", error);
    toast.error(error.message || "Failed to create company");
  }
};

const getAllCompanies = async () => {
  try {
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

const getCompanyById = async (id) => {
  if (!id || id === "undefined") {
    toast.error("Invalid company ID");
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) toast.error("No authentication token found");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/company/${id}`,
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
      toast.error(errorData.message);
    }

    const data = await response.json();
    return data.company;
  } catch (error) {
    toast.error(error.message || "Failed to fetch company details");
  }
};

const updateCompany = async ({ id, name, createdBy }) => {
  try {
    const req = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/company/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "PUT",
        body: JSON.stringify({ name, createdBy }),
      }
    );
    const res = await req.json();

    return res.company;
  } catch (error) {
    toast.error(error.message || "Failed to update company");
  }
};

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState(
    JSON.parse(localStorage.getItem("user"))?.email
  );

  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchCompanies = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const companies = await getAllCompanies();

      // console.log("Fetched companies:", companies);

      const validCompanies = companies.filter(
        (company) => company._id && company._id !== "undefined"
      );
      setCompanies(validCompanies);
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch companies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const start = Date.now();
    try {
      const response = await createCompany({
        name: companyName,
        createdBy: companyEmail || undefined,
      });
      setCompanies([...companies, response.company]);
      setCompanyName("");
      setCompanyEmail("");
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      console.error("Create error:", err);
      toast.error(err.message || "Failed to create company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCompany = async (companyId) => {
    setIsLoading(true);
    try {
      const company = await getCompanyById(companyId);
      setSelectedCompany(company);
      setIsEditing(false);
      setIsModalOpen(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompany = async (companyId) => {
    setIsLoading(true);
    try {
      const company = await getCompanyById(companyId);
      setSelectedCompany(company);
      setCompanyName(company.name);
      setCompanyEmail(company.createdBy || "");
      setIsEditing(true);
      setIsModalOpen(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    const start = Date.now();
    try {
      const response = await updateCompany({
        id: selectedCompany._id,
        createdBy: companyEmail,
        name: companyName,
      });

      setCompanies(
        companies.map((c) => (c._id === selectedCompany._id ? response : c))
      );
      setIsModalOpen(false);
      setCompanyName("");
      setCompanyEmail("");
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update company");
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
          <h1 className="text-2xl font-bold">Company</h1>
        </div>

        <div className="p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3">
              <h2 className="text-lg font-semibold">Details</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100 truncate">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">
                    Company Name
                  </th>
                  <th className="p-3 text-left text-sm font-medium">Email</th>
                  <th className="p-3 text-center text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company?._id} className="">
                    <td className="p-3 text-sm">{company?.name}</td>
                    <td className="p-3 text-sm">
                      {company?.createdBy ?? "manager@nitsel.com"}
                    </td>
                    <td className="p-3 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewCompany(company._id)}
                        className="text-orange-600 cursor-pointer hover:text-orange-800"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditCompany(company._id)}
                        className="text-orange-600 cursor-pointer hover:text-orange-800"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleAddCompany}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter Company Name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="companyEmail"
                  className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                >
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  value={companyEmail}
                  disabled
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Company Email"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setCompanyName("");
                  setCompanyEmail("");
                }}
                className="bg-black text-white px-4 py-2 rounded-md  cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md flex cursor-pointer items-center"
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

      {isModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Company" : "View Company"}
              </h2>
            </div>
            {isEditing ? (
              <form onSubmit={handleUpdateCompany}>
                <div className="mb-4">
                  <label
                    htmlFor="modalCompanyName"
                    className="block text-sm font-medium mb-1"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="modalCompanyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalCompanyEmail"
                    className="block text-sm font-medium mb-1"
                  >
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    disabled
                    id="modalCompanyEmail"
                    value={companyEmail || "manager@nitsel.com"}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="bg-primary text-white px-4 py-2 rounded-md"
                    disabled={isLoading}
                  >
                    Update
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p>
                  <strong>Company Name:</strong> {selectedCompany?.name}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {selectedCompany?.createdBy || "manager@nitsel.com"}
                </p>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-black text-white px-4 py-2 rounded-md cursor-pointer"
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

export default Company;
