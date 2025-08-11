import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaPlusCircle, FaTimes } from "react-icons/fa";
import Loading from "../../Components/Loading";

const createCompany = async ({ name, createdBy }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/company`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email: createdBy }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error:", errorData);
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to create company");
  }
};

const getAllCompanies = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/company`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

   

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.companies;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch companies");
  }
};

const getCompanyById = async (id) => {
  if (!id || id === "undefined") {
    throw new Error("Invalid company ID");
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/company/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.company;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch company");
  }
};

const updateCompany = async ({ id, name, createdBy }) => {
  try {
    const req = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/company/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "PUT",
      body: JSON.stringify({ name, createdBy }),
    });
    const res = await req.json();

    return res.company;
  } catch (error) {
    throw new Error(error?.message || "Failed to update company");
  }
};

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState(
    JSON.parse(localStorage.getItem("user"))?.email
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setError(err.message || "Failed to fetch companies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
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
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCompany = async (companyId) => {
    setError("");
    setIsLoading(true);
    try {
      const company = await getCompanyById(companyId);
      setSelectedCompany(company);
      setIsEditing(false);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompany = async (companyId) => {
    setError("");
    setIsLoading(true);
    try {
      const company = await getCompanyById(companyId);
      setSelectedCompany(company);
      setCompanyName(company.name);
      setCompanyEmail(company.createdBy || "");
      setIsEditing(true);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const response = await updateCompany({
        id: selectedCompany._id,
        createdBy: companyEmail || undefined,
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
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative container mx-auto p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading || isSubmitting ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Company</h1>
        </div>

        {error && <div className="p-4 text-red-600">{error}</div>}

        <div className="p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3">
              <h2 className="text-lg font-semibold">Details</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Company Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company?._id} className="">
                    <td className="p-3">{company?.name}</td>
                    <td className="p-3">{company?.createdBy || "N/A"}</td>
                    <td className="p-3 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewCompany(company._id)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditCompany(company._id)}
                        className="text-orange-600 hover:text-orange-800"
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
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Company Name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="companyEmail"
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
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  value={companyEmail}
                  disabled
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Company Email"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
                disabled={isLoading || isSubmitting}
              >
                <FaPlusCircle className="mr-2" /> Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompanyName("");
                  setCompanyEmail("");
                }}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {(isLoading || isSubmitting) && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}

      {isModalOpen && selectedCompany && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Company" : "View Company"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
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
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex justify-end space-x-4">
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
            ) : (
              <div>
                <p>
                  <strong>Company Name:</strong> {selectedCompany.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedCompany.createdBy || "N/A"}
                </p>
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

export default Company;
