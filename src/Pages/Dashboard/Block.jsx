import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlusCircle, FaTimes } from 'react-icons/fa';
import Loading from '../../Components/Loading';

const Block = () => {
  const [blocks, setBlocks] = useState([]);
  const [blockCode, setBlockCode] = useState('');
  const [blockName, setBlockName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchBlocks = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('https://bug-buster-backend.vercel.app/api/blocks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response status:', response.status, 'Response text:', text);
        throw new Error(`Failed to fetch blocks: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setBlocks(Array.isArray(data) ? data : data.blocks || []);
      if (Date.now() - start < 2000) await new Promise(resolve => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleAddBlock = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('https://bug-buster-backend.vercel.app/api/blocks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockCode, blockName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add block');
      if (!data.block) throw new Error('Invalid response: block data missing');

      setBlocks([...blocks, data.block]);
      setBlockCode('');
      setBlockName('');
      if (Date.now() - start < 2000) await new Promise(resolve => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewBlock = (block) => {
    setSelectedBlock(block);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditBlock = (block) => {
    setSelectedBlock(block);
    setBlockCode(block.blockCode);
    setBlockName(block.blockName);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateBlock = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`https://bug-buster-backend.vercel.app/api/blocks/${selectedBlock._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockCode, blockName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update block');
      if (!data.block) throw new Error('Invalid response: block data missing');

      setBlocks(blocks.map(b => b._id === selectedBlock._id ? data.block : b));
      setIsModalOpen(false);
      setBlockCode('');
      setBlockName('');
      if (Date.now() - start < 2000) await new Promise(resolve => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlock = async (block) => {
    if (!window.confirm('Are you sure you want to delete this block?')) return;

    setError('');
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`https://bug-buster-backend.vercel.app/api/blocks/${block._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete block');

      setBlocks(blocks.filter(b => b._id !== block._id));
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
          <h1 className="text-2xl font-bold">Blocks</h1>
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
                  <th className="p-3 text-left">Block Code</th>
                  <th className="p-3 text-left">Block Name</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block) => (
                  <tr key={block._id}>
                    <td className="p-3">{block.blockCode}</td>
                    <td className="p-3">{block.blockName}</td>
                    <td className="p-3 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewBlock(block)}
                        className="text-orange-600 hover:text-orange-800"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditBlock(block)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block)}
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
          <form onSubmit={handleAddBlock}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="blockCode"
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
                  Block Code
                </label>
                <input
                  type="text"
                  id="blockCode"
                  value={blockCode}
                  onChange={(e) => setBlockCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Block Code"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="blockName"
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
                  Block Name
                </label>
                <input
                  type="text"
                  id="blockName"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Block Name"
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
                  setBlockCode('');
                  setBlockName('');
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

      {isModalOpen && selectedBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Block' : 'View Block'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-gray-800">
                <FaTimes />
              </button>
            </div>
            {isEditing ? (
              <form onSubmit={handleUpdateBlock}>
                <div className="mb-4">
                  <label htmlFor="modalBlockCode" className="block text-sm font-medium mb-1">
                    Block Code
                  </label>
                  <input
                    type="text"
                    id="modalBlockCode"
                    value={blockCode}
                    onChange={(e) => setBlockCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="modalBlockName" className="block text-sm font-medium mb-1">
                    Block Name
                  </label>
                  <input
                    type="text"
                    id="modalBlockName"
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
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
                <p className="mb-2"><strong>Block Code:</strong> {selectedBlock.blockCode}</p>
                <p className="mb-2"><strong>Block Name:</strong> {selectedBlock.blockName}</p>
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

export default Block;