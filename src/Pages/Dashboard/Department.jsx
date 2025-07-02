import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlusCircle, FaTimes } from 'react-icons/fa';
import Loading from '../../Components/Loading';

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [departmentCode, setDepartmentCode] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchDepartments = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('https://bug-buster-server.vercel.app/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response status:', response.status, 'Response text:', text);
        throw new Error(`Failed to fetch departments: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setDepartments(Array.isArray(data) ? data : data.departments || []);
      if (Date.now() - start < 2000) await new Promise(resolve => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('https://bug-buster-server.vercel.app/api/departments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ departmentCode, departmentName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add department');
      if (!data.department) throw new Error('Invalid response: department data missing');

      setDepartments([...departments, data.department]);
      setDepartmentCode('');
      setDepartmentName('');
      if (Date.now() - start < 2000) await new Promise(resolve => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDepartment = (department) => {
    setSelectedDepartment(department);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setDepartmentCode(department.departmentCode);
    setDepartmentName(department.departmentName);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`https://bug-buster-server.vercel.app/api/departments/${selectedDepartment._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ departmentCode, departmentName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update department');
      if (!data.department) throw new Error('Invalid response: department data missing');

      setDepartments(departments.map(d => d._id === selectedDepartment._id ? data.department : d));
      setIsModalOpen(false);
      setDepartmentCode('');
      setDepartmentName('');
      if (Date.now() - start < 2000) await new Promise(resolve => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (department) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    setError('');
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`https://bug-buster-server.vercel.app/api/departments/${department._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete department');

      setDepartments(departments.filter(d => d._id !== department._id));
      if (Date.now() - start < 2000) await new Promise(resolve => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className={`bg-white shadow-md rounded-lg ${isLoading || isSubmitting ? 'blur-sm' : ''}`}>
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Departments</h1>
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
                  <th className="p-3 text-left">Department Code</th>
                  <th className="p-3 text-left">Department Name</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department._id}>
                    <td className="p-3">{department.departmentCode}</td>
                    <td className="p-3">{department.departmentName}</td>
                    <td className="p-3 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewDepartment(department)}
                        className="text-orange-600 hover:text-orange-800"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Delete"
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
          <form onSubmit={handleAddDepartment}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="departmentCode"
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
                  Department Code
                </label>
                <input
                  type="text"
                  id="departmentCode"
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Department Code"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="departmentName"
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
                  Department Name
                </label>
                <input
                  type="text"
                  id="departmentName"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Department Name"
                  required
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
                  setDepartmentCode('');
                  setDepartmentName('');
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

      {isModalOpen && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Department' : 'View Department'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-gray-800">
                <FaTimes />
              </button>
            </div>
            {isEditing ? (
              <form onSubmit={handleUpdateDepartment}>
                <div className="mb-4">
                  <label htmlFor="modalDepartmentCode" className="block text-sm font-medium mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    id="modalDepartmentCode"
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="modalDepartmentName" className="block text-sm font-medium mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    id="modalDepartmentName"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
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
                <p className="mb-2"><strong>Department Code:</strong> {selectedDepartment.departmentCode}</p>
                <p className="mb-2"><strong>Department Name:</strong> {selectedDepartment.departmentName}</p>
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

export default Department;