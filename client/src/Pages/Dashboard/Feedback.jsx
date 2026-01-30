import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { FaStarHalfStroke } from "react-icons/fa6";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

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

  const [isLoading, setIsLoading] = useState(false);

  const hasFetched = useRef(false);

  const renderEditableStars = (rating, onStarClick) => {
    return (
      <div className="p-4 rounded-lg text-center bg-primary text-white w-full max-w-xs h-[201px] flex flex-col justify-center mt-4">
        <h3 className="text-lg font-semibold pb-4">Rating</h3>
        <div className="text-5xl font-bold mb-2">{rating.toFixed(1)}/5</div>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2, 3, 4].map((index) => {
            const starValue = index + 1;
            const isFull = rating >= starValue;
            const isHalf = rating >= starValue - 0.5 && rating < starValue;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onStarClick(index)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                {isFull ? (
                  <FaStar className="w-6 h-6 text-yellow-400" />
                ) : isHalf ? (
                  <FaStarHalfStroke className="w-6 h-6 text-yellow-400" />
                ) : (
                  <FaStar className="w-6 h-6 text-gray-400" />
                )}
              </button>
            );
          })}
        </div>
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

        try {
          const token = localStorage.getItem("token");
          if (!token) toast.error("No authentication token found");

          const dropdownResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/feedback/dropdowns`,
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
          });
        } catch (err) {
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

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found");

      const payload = {
        userName: formData.userName,
        branch: formData.branch,
        department: formData.department,
        feedbackTo: formData.feedbackTo,
        feedback: formData.feedback,
        rating: formData.rating,
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/feedback`,
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
        toast.error(data.message);
      }

      if (!data.feedback) toast.error("Failed to submit feedback");

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
      toast.success("Feedback submitted successfully!");
    } catch (err) {
      toast.error(err.message);
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
          <h1 className="text-2xl font-bold">Feedback</h1>
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
                    htmlFor="feedbackTo"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Feedback To
                  </label>
                  <div className="relative">
                    <select
                      id="feedbackTo"
                      name="feedbackTo"
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
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

              {/* Rating and Feedback Section - Side by Side */}
              <div className="mt-6 flex gap-6 items-start">
                {/* Rating Section */}
                <div className="flex-shrink-0">
                  {renderEditableStars(formData.rating, handleStarClick)}
                </div>

                {/* Feedback Textarea Section */}
                <div className="flex-1">
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    name="feedback"
                    className="w-full  px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="7"
                    value={formData.feedback}
                    onChange={handleInputChange}
                    placeholder="Enter feedback"
                    maxLength={500}
                    required
                  ></textarea>
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
                      feedbackTo: "",
                      feedback: "",
                      rating: 0,
                    });
                  }}
                  className="bg-black cursor-pointer text-white px-4 py-2 rounded-md "
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md"
                  disabled={isLoading}
                >
                  Add
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
