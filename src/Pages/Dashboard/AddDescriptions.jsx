import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { FaTimes } from "react-icons/fa";
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

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeline: "",
    timeUnit: "Hours",
  });
  const [alert, setAlert] = useState({ type: "", message: "", show: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeUnits = ["Hours", "Days", "Minutes"];

  const showAlert = (type, message) => {
    setAlert({ type, message, show: true });
    setTimeout(() => setAlert({ type: "", message: "", show: false }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log(`Input changed: ${name} = ${value}`);
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
    setAlert({ type: "", message: "", show: false });

    if (!validateForm()) {
      showAlert("error", "Please fill in all required fields with valid data.");
      return;
    }

    setIsSubmitting(true);

    // Simulate delay without actual API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setFormData({
      title: "",
      description: "",
      timeline: "",
      timeUnit: "Hours",
    });
    showAlert("success", "Description submitted successfully!");
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isSubmitting ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Add Description</h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg p-6">
            <form onSubmit={handleSubmit}>
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
                    className="w-full px-3 py-2 border rounded-md"
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
                    className="w-full px-3 py-2 border rounded-md"
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
                      className="w-full px-3 py-2 border rounded-md"
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
                        className="w-full px-3 py-2 border rounded-md appearance-none pr-10"
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
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer"
                  disabled={isSubmitting}
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      title: "",
                      description: "",
                      timeline: "",
                      timeUnit: "Hours",
                    })
                  }
                  className="bg-gray-800 text-white px-4 py-2 rounded-md cursor-pointer"
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

      {isSubmitting && <Loading fullscreen />}
    </div>
  );
}
