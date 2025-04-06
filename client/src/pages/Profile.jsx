import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?.email) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/auth/profile?email=${storedUser.email}`
        );
        
        if (response.data.success) {
          setUser(response.data.user);
          setFormData(response.data.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        toast.error("Failed to load profile");
        console.error("Profile error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPEG, PNG, or GIF image");
        return;
      }
      
      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "firstName" || name === "lastName") {
      setFormData(prev => ({
        ...prev,
        name: {
          ...prev.name,
          [name === "firstName" ? "first" : "last"]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData(user);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updatedData = { ...formData };
      
      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          
          const uploadResponse = await axios.post(
            'http://localhost:5000/api/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          if (uploadResponse.data.success) {
            updatedData.picture = uploadResponse.data.url;
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Failed to upload image");
          return;
        }
      }

      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          email: user.email,
          updates: updatedData
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        setFormData(response.data.user);
        setEditMode(false);
        toast.success("Profile updated successfully");
        
        if (response.data.user.email !== user.email) {
          localStorage.setItem("user", JSON.stringify({
            email: response.data.user.email
          }));
        }
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">No user data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {user.name.first} {user.name.last}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Personal Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={formData.name.first}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={formData.name.last}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eye Color
                  </label>
                  <select
                    name="eyeColor"
                    value={formData.eyeColor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="brown">Brown</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="hazel">Hazel</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Account Status</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balance
                  </label>
                  <input
                    name="balance"
                    value={formData.balance}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Company and Profile Picture */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Company</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="tel"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Profile Picture</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={formData.picture}
                          alt={`${formData.name.first} ${formData.name.last}`}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/gif"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className={`w-full py-2 rounded text-white font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Personal Information and Account Status */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">First Name:</span> {user.name.first}</p>
                  <p><span className="font-medium">Last Name:</span> {user.name.last}</p>
                  <p><span className="font-medium">Age:</span> {user.age}</p>
                  <p><span className="font-medium">Eye Color:</span> {user.eyeColor}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Account Status</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={user.isActive ? "text-green-500" : "text-red-500"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                  <p><span className="font-medium">Balance:</span> {user.balance}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Company and Profile Picture */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Company</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Company:</span> {user.company}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Phone:</span> {user.phone}</p>
                  <p><span className="font-medium">Address:</span> {user.address}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Profile Picture</h2>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow">
                  {imageError || !user.picture ? (
                    <div 
                      className="w-full h-full bg-gray-200 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: fallbackImage }}
                    />
                  ) : (
                    <img
                      src={user.picture}
                      alt={`${user.name.first} ${user.name.last}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;