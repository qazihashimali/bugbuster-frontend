import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import { FaEye, FaPlusCircle, FaEdit, FaTrash } from "react-icons/fa";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeline: "",
    timeUnit: "",
  });
  const [descriptions, setDescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescriptionId, setEditDescriptionId] = useState(null);
  const hasFetched = useRef(false);
  const timeUnits = ["Select Unit", "Hours", "Days", "Minutes"];

  useEffect(() => {
    const loadInitialData = async () => {
      if (!hasFetched.current) {
        hasFetched.current = true;
        setIsLoading(true);

        try {
          const token = localStorage.getItem("token");
          if (!token)
            toast.error("No authentication token found. Please log in.");

          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/descriptions`,
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
              "Descriptions response status:",
              response.status,
              "Response text:",
              text
            );
            toast.error(
              `Failed to fetch descriptions: ${response.status} ${response.statusText}`
            );
          }
          const descriptionsData = await response.json();
          // console.log("Descriptions data:", descriptionsData);

          setDescriptions(
            Array.isArray(descriptionsData) ? descriptionsData : []
          );
        } catch (err) {
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // console.log(`Input changed: ${name} = ${value}`);
  };

  const validateForm = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.timeline &&
      parseFloat(formData.timeline) > 0 &&
      formData.timeUnit
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "error",
        "Please fill in all required fields with valid data."
      );

      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please log in.");

        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/descriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDescriptions([data.description, ...descriptions]);
        setFormData({
          title: "",
          description: "",
          timeline: "",
          timeUnit: "",
        });
        setIsModalOpen(false);
        toast.success(data.message || "Description submitted successfully.");
      } else {
        toast.error(data.message || "Failed to submit description.");
      }
    } catch (error) {
      console.error("Error submitting description:", error);
      toast.error("Failed to submit description. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDescription = (description) => {
    // console.log("Viewing description:", description);
    setSelectedDescription(description);
    setIsModalOpen(true);
  };

  const handleEditDescription = (description) => {
    // console.log("Editing description:", description);
    setFormData({
      title: description.title,
      description: description.description,
      // timeline: description.timeline,
      timeline:
        description.timeline !== undefined
          ? description.timeline.toString()
          : "",

      timeUnit: description.timeUnit,
    });
    setEditDescriptionId(description._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateDescription = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Please fill in all required fields with valid data.");
      toast.error("Please fill in all required fields with valid data.");

      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please log in.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/descriptions/${editDescriptionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      // console.log(
      //   "PUT response status:",
      //   response.status,
      //   "Response:",
      //   await response.clone().json(),
      //   formData
      // );

      const data = await response.json();

      if (response.ok) {
        setDescriptions(
          descriptions.map((desc) =>
            desc._id === editDescriptionId ? data.description : desc
          )
        );
        setFormData({
          title: "",
          description: "",
          timeline: "",
          timeUnit: "",
        });
        setIsModalOpen(false);
        setIsEditing(false);
        setEditDescriptionId(null);
        toast.success(data.message || "Description updated successfully.");
      } else {
        toast.error(data.message || "Failed to update description.");
      }
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("Failed to update description. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDescription = async (description) => {
    if (!window.confirm("Are you sure you want to delete this description?"))
      return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please log in.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/descriptions/${
          description._id
        }`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "DELETE response status:",
        response.status,
        "Response:",
        await response.clone().json()
      );

      const data = await response.json();

      if (response.ok) {
        setDescriptions(
          descriptions.filter((desc) => desc._id !== description._id)
        );
        toast.success(data.message || "Description deleted successfully.");
      } else {
        toast.error(data.message || "Failed to delete description.");
      }
    } catch (error) {
      console.error("Error deleting description:", error);
      toast.error("Failed to delete description. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserPermissions = (description) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !description?.createdBy?._id)
      return { canEdit: false, canDelete: false };

    const isCreator = description.createdBy._id === user._id;
    const roles = user.roles || [];

    const isAdmin = roles.includes("Admin") || roles.includes("SuperAdmin");
    const isServiceProvider = roles.includes("ServiceProvider");

    // ✅ Admin / SuperAdmin — full access
    if (isAdmin) {
      return { canEdit: true, canDelete: true };
    }

    // ✅ ServiceProvider — edit only
    if (isServiceProvider) {
      return { canEdit: true, canDelete: false };
    }

    // ✅ Creator — edit own
    if (isCreator) {
      return { canEdit: true, canDelete: true };
    }

    return { canEdit: false, canDelete: false };
  };
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">Description Desk</h1>

          {(JSON.parse(localStorage.getItem("user")).roles.includes("Admin") ||
            JSON.parse(localStorage.getItem("user")).roles.includes(
              "SuperAdmin"
            ) ||
            !JSON.parse(localStorage.getItem("user")).roles.includes(
              "ServiceProvider"
            )) && (
            <button
              onClick={() => {
                setSelectedDescription(null);
                setIsEditing(false);
                setFormData({
                  title: "",
                  description: "",
                  timeline: "",
                  timeUnit: "",
                });
                setIsModalOpen(true);
              }}
              className="bg-white cursor-pointer text-primary px-4 py-1 rounded-md hover:bg-gray-100 flex items-center"
            >
              <FaPlusCircle className="mr-2" />
              Add Description
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="bg-primary rounded-t-lg text-white p-3">
            <h2 className="text-lg font-semibold">Details</h2>
          </div>
          <div className="bg-white shadow rounded-lg overflow-x-auto no-scrollbar">
            <table className="min-w-[900px] w-full">
              <thead className="bg-gray-100 truncate">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Title</th>
                  <th className="p-3 text-left text-sm font-medium">
                    Description
                  </th>
                  <th className="p-3 text-left text-sm font-medium">Type</th>
                  <th className="p-3 text-left text-sm font-medium">
                    Timeline
                  </th>
                  <th className="p-3 text-left text-sm font-medium">
                    Created By
                  </th>
                  <th className="p-3 text-center text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {descriptions.map((desc) => {
                  const { canEdit, canDelete } = getUserPermissions(desc);
                  return (
                    <tr key={desc._id}>
                      <td className="p-3  text-sm truncate">{desc.title}</td>
                      <td className="p-3  text-sm truncate">
                        {desc.description.length > 50
                          ? `${desc.description.substring(0, 50)}...`
                          : desc.description}
                      </td>
                      <td className="p-3  text-sm">{desc.type}</td>
                      <td className="p-3  text-sm">
                        {desc?.timeline
                          ? `${desc?.timeline} ${desc?.timeUnit}`
                          : "N/A"}
                      </td>
                      <td className="p-3  text-sm">
                        {desc.createdBy
                          ? `${desc.createdBy.name} (${desc.createdBy.email})`
                          : "N/A"}
                      </td>
                      <td className="p-3 flex flex-col sm:flex-row justify-center gap-2">
                        <button
                          onClick={() => handleViewDescription(desc)}
                          className="text-orange-600 cursor-pointer hover:text-orange-800 mr-2"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        {(canEdit || canDelete) && (
                          <>
                            {canEdit && (
                              <button
                                onClick={() => handleEditDescription(desc)}
                                className="text-orange-600 cursor-pointer hover:text-orange-800 mr-2"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteDescription(desc)}
                                className="text-orange-600  cursor-pointer hover:text-orange-800"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (isEditing || !selectedDescription) && (
        <div className="fixed inset-0 bg-black/90  flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[40rem]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Description" : "Add New Description"}
              </h2>
            </div>
            <form onSubmit={isEditing ? handleUpdateDescription : handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-1 bg-white w-fit relative top-[13px] ml-[14px] px-1 z-20"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter description title"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-1 bg-white w-fit relative top-[13px] ml-[14px] px-1 z-20"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="5"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description details"
                    maxLength={500}
                    required
                  ></textarea>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="timeline"
                      className="block text-sm font-medium mb-1 bg-white w-fit relative top-[13px] ml-[14px] px-1 z-20"
                    >
                      Timeline
                    </label>
                    <input
                      type="number"
                      id="timeline"
                      name="timeline"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      placeholder="Enter timeline"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label
                      htmlFor="timeUnit"
                      className="block text-sm font-medium mb-1 bg-white w-fit relative top-[13px] ml-[14px] px-1 z-20"
                    >
                      Unit
                    </label>
                    <div className="relative">
                      <select
                        id="timeUnit"
                        name="timeUnit"
                        className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.timeUnit}
                        onChange={handleInputChange}
                        required
                      >
                        {timeUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <IoChevronDown className="text-gray-400" size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      title: "",
                      description: "",
                      timeline: "",
                      timeUnit: "",
                    });
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setEditDescriptionId(null);
                  }}
                  className="bg-black cursor-pointer text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md flex items-center"
                  disabled={isLoading}
                >
                  <FaPlusCircle className="mr-2" />{" "}
                  {isEditing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && selectedDescription && !isEditing && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[32rem]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">View Description</h2>
            </div>
            <div>
              <p className="mb-2">
                <strong>Title:</strong> {selectedDescription.title}
              </p>
              <p className="mb-2">
                <strong>Description:</strong> {selectedDescription.description}
              </p>
              <p className="mb-2">
                <strong>Timeline:</strong> {selectedDescription.timeline}{" "}
                {selectedDescription.timeUnit}
              </p>
              <p className="mb-2">
                <strong>Created By:</strong>{" "}
                {selectedDescription.createdBy
                  ? `${selectedDescription.createdBy.name} (${selectedDescription.createdBy.email})`
                  : "N/A"}
              </p>
              <p className="mb-2">
                <strong>Created At:</strong>{" "}
                {new Date(selectedDescription.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedDescription(null);
                  setIsModalOpen(false);
                }}
                className="bg-black cursor-pointer text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
    </div>
  );
}
