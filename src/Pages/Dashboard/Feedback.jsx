import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import { FaTimes, FaStar } from "react-icons/fa";
import { FaStarHalfStroke } from "react-icons/fa6";
import Loading from "../../Components/Loading";

const Alert = ({ type, message, onClose }) => {
  const alertStyles = {
    success: "bg-blue-100 border-blue-500 text-blue-700",
    error: "bg-red-100 border-red-500 text-red-700",
  };

  return (
    <div
      className={`border-l-4 p-4 mb-4 flex justify-between items-center ${alertStyles[type]}`}
    >
      <p>{message}</p>
      <button onClick={onClose} className="text-gray-700 hover:text-gray-900">
        <FaTimes />
      </button>
    </div>
  );
};

export default function Feedback() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    branch: "",
    department: "",
    feedbackTo: "",
    feedback: "",
    rating: 0,
  });
  const [dropdowns, setDropdowns] = useState({
    branches: [],
    departments: [],
    users: [],
    filteredUsers: [],
  });
  const [alert, setAlert] = useState({ type: "", message: "", show: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasFetched = useRef(false);

  const showAlert = (type, message) => {
    setAlert({ type, message, show: true });
    setTimeout(() => setAlert({ type: "", message: "", show: false }), 5000);
  };

  const renderEditableStars = (rating, onStarClick) => {
    return (
      <div className="flex justify-center p-2 bg-gray-50 rounded-md">
        {[0, 1, 2, 3, 4].map((index) => {
          const starValue = index + 1;
          const isFull = rating >= starValue;
          const isHalf = rating >= starValue - 0.5 && rating < starValue;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onStarClick(index)}
              className="focus:outline-none mx-2 transition-transform hover:scale-110 hover:drop-shadow-md"
            >
              {isFull ? (
                <FaStar className="w-9 h-9 text-[#FFD700]" />
              ) : isHalf ? (
                <FaStarHalfStroke className="w-9 h-9 text-[#FFD700]" />
              ) : (
                <FaStar className="w-9 h-9 text-gray-300" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const handleStarClick = (starIndex) => {
    const currentRating = formData.rating;
    const starValue = starIndex + 1;
    let newRating;

    if (currentRating === starValue) {
      newRating = starValue - 0.5;
    } else if (currentRating === starValue - 0.5) {
      newRating = starValue;
    } else {
      newRating = starValue - 0.5;
    }

    setFormData((prev) => ({ ...prev, rating: newRating }));
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const userData = localStorage.getItem("user");

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData((prev) => ({ ...prev, userName: parsedUser.name || "" }));
      }

      if (!hasFetched.current) {
        hasFetched.current = true;
        setIsLoading(true);
        const start = Date.now();
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No authentication token found");

          // Fetch dropdowns
          const dropdownResponse = await fetch(
            "https://bug-buster-backend.vercel.app/api/feedback/dropdowns",
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
            throw new Error(
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
          });

          if (Date.now() - start < 2000) {
            await new Promise((resolve) =>
              setTimeout(resolve, 2000 - (Date.now() - start))
            );
          }
        } catch (err) {
          showAlert("error", err.message);
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
    setFormData({ ...formData, [name]: value });
    console.log(`Input changed: ${name} = ${value}`);
  };

  const validateForm = () => {
    return (
      formData.userName &&
      formData.branch &&
      formData.department &&
      formData.feedbackTo &&
      formData.feedback &&
      formData.rating > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "", show: false });

    if (!validateForm()) {
      showAlert("error", "Please fill in all required fields, including a rating.");
      return;
    }

    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const payload = {
        userName: formData.userName,
        branch: formData.branch,
        department: formData.department,
        feedbackTo: formData.feedbackTo,
        feedback: formData.feedback,
        rating: formData.rating,
      };

      const response = await fetch(
        "https://bug-buster-backend.vercel.app/api/feedback",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit feedback. Please try again."
        );
      }

      if (!data.feedback)
        throw new Error("Invalid response: feedback data missing");
      setFormData({
        userName: user?.name || "",
        branch: "",
        department: "",
        feedbackTo: "",
        feedback: "",
        rating: 0,
      });
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      showAlert("success", "Feedback submitted successfully!");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading || isSubmitting ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Feedback</h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="userName"
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
                    User Name
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    Branch
                  </label>
                  <div className="relative">
                    <select
                      id="branch"
                      name="branch"
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    Department
                  </label>
                  <div className="relative">
                    <select
                      id="department"
                      name="department"
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {dropdowns.departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.departmentName} ({department.departmentCode})
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
                    htmlFor="feedbackTo"
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
                    Feedback To
                  </label>
                  <div className="relative">
                    <select
                      id="feedbackTo"
                      name="feedbackTo"
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={formData.feedbackTo}
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
              <div className="mt-4">
                {renderEditableStars(formData.rating, handleStarClick)}
              </div>

              <div className="mt-4">
                <label
                  htmlFor="feedback"
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
                    marginBottom: "0px",
                  }}
                >
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="4"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  placeholder="Enter feedback"
                  maxLength={500}
                  required
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md"
                  disabled={isLoading || isSubmitting}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      userName: user?.name || "",
                      branch: "",
                      department: "",
                      feedbackTo: "",
                      feedback: "",
                      rating: 0,
                    });
                  }}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        {alert.show && (
          <div className="p-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: "", message: "", show: false })}
            />
          </div>
        )}
      </div>

      {(isLoading || isSubmitting) && <Loading fullscreen />}
    </div>
  );
}