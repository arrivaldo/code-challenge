import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: { first: "", last: "" },
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    age: "",
    eyeColor: "",
    balance: "",
    picture: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setError("Please upload a JPEG, PNG, or GIF image");
        return;
      }
      
      if (file.size > maxSize) {
        setError("Image size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setError("");
      
      // Create preview URL
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

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setSuccess(`Uploading image... ${progress}%`);
          }
        }
      );
      
      if (response.data.success) {
        return response.data.url;
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords don't match");
    }
  
    setLoading(true);
    setError("");
    setSuccess("");
  
    try {
      let pictureUrl = "";
      
      // Upload new image if selected
      if (selectedFile) {
        try {
          pictureUrl = await uploadImage(selectedFile);
          if (!pictureUrl) {
            throw new Error("Failed to upload image");
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          return setError(uploadError.message);
        }
      } else if (formData.picture) {
        // Use direct URL if provided
        pictureUrl = formData.picture;
      }
  
      const { confirmPassword, ...userData } = formData;
      const finalUserData = {
        ...userData,
        picture: pictureUrl || "http://placehold.it/32x32"
      };
  
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        finalUserData
      );
      
      if (response.data.success) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);
      } 
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-7">
      <div className="flex-grow flex justify-center items-center">
        <div className="border shadow p-6 w-full max-w-2xl bg-white">
          <h2 className="text-3xl font-bold mb-4 text-black">Signup</h2>
          {error && (
            <div className="mb-4 p-2 text-red-500 bg-red-50 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-2 text-green-500 bg-green-50 rounded">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
            {/* Name Fields */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                value={formData.name.first}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="text"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                value={formData.name.last}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="text"
                required
              />
            </div>

            {/* Basic Info */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="text"
              />
            </div>

            {/* Password Fields */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="password"
                required
                minLength="6"
                placeholder="At least 6 characters"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="password"
                required
                minLength="6"
              />
            </div>

            {/* Contact Info */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="tel"
                placeholder="+1 (123) 456-7890"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="text"
              />
            </div>

            {/* Additional Info */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="number"
                min="18"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eye Color
              </label>
              <select
                name="eyeColor"
                value={formData.eyeColor}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select</option>
                <option value="brown">Brown</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="hazel">Hazel</option>
                <option value="gray">Gray</option>
              </select>
            </div>

            {/* Financial Info */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Balance
              </label>
              <input
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="text"
                placeholder="$1,000.00"
              />
            </div>

            {/* Profile Picture Upload */}
            <div className="mb-4 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, or GIF (max 5MB)
                  </p>
                </div>
                {previewUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="h-16 w-16 object-cover rounded-full border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Or enter image URL:</p>
                <input
                  name="picture"
                  value={formData.picture}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  disabled={loading || !!selectedFile}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 mb-4">
              <button
                type="submit"
                className={`w-full py-2 rounded text-white font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
              <p className="text-center text-sm mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-600 hover:text-teal-800 font-medium">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;