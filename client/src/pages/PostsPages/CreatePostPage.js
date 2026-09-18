import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import ContactInfo from '../../components/contactInfo/contactInfo';
import LocationMap from '../../components/contactInfo/locationMap';

function CreatePostPage({ onPostCreated }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [features, setFeatures] = useState(['']);

  const categoryOptions = [
    "Furniture", "Electronics", "Games", "Clothing", "Books",
    "Appliances", "Toys", "Tools", "Sports Equipment", "Food", "Other"
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file =>
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== acceptedFiles.length) {
      toast.warning("Some files were rejected. Only images under 5MB are allowed.");
    }
    setImages(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxSize: 5 * 1024 * 1024
  });

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
   // formData.append("features", JSON.stringify(features.filter(f => f.trim() !== '')));
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("location", location);
   // formData.append("category", category);
   const filteredFeatures = features.filter(f => f.trim() !== '');
const allFeatures = [category, ...filteredFeatures];
formData.append("features", JSON.stringify(allFeatures));

    images.forEach((img) => {
      formData.append("images", img);
    });

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create_post`, {
        method: "POST",
        headers: {
          jwt_token: localStorage.getItem("token"),
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Created Item Post Successfully");

        setTitle("");
        setDescription("");
        setImages([]);
        setFeatures(['']);
        setCategory("");
        setEmail("");
        setPhone("");
        setLocation("");
        setUploadProgress(0);

        if (data.post_id) {
          navigate(`/posts/${data.post_id}`);
        } else {
          navigate('/');
        }

        if (onPostCreated) onPostCreated();
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          toast.error(errorData.message || "Unable to create Item Post");
        } catch {
          toast.error(errorText || "Unable to create Item Post");
        }
      }
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error("An error occurred while creating the post.");
    } finally {
      setIsUploading(false);
    }
  };

 return (
  <div className="min-h-screen bg-gray-100 flex flex-col  ">
    <div className="w-full  py-6 px-4 md:px-12 lg:px-24 xl:px-40 mt-3 ">
      <h1 className="text-4xl font-semibold text-red-700 text-center ">
        Create a New Post
      </h1>

      {isUploading && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-center text-sm text-green-800 mt-2">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left Column */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-lg font-semibold text-green-800 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter item title"
              className="w-full border border-gray-300 rounded-md px-4 py-2 "
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg font-semibold text-green-800 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
              placeholder="Write a detailed description"
              className="w-full border border-gray-300 rounded-md px-4 py-2   resize-none" 
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-lg font-semibold text-green-800 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select a Category --</option>
              {categoryOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Info */}
          <ContactInfo email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-lg font-semibold text-green-800 mb-2">Images</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-600">
                {isDragActive
                  ? 'Drop the images here...'
                  : 'Drag & drop images or click to select files'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPEG, PNG, GIF (max 5MB each)
              </p>
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Location Picker */}
         <LocationMap onLocationSelect={setLocation} />
            {location && <p className="text-sm text-green-800 mt-1">{location}</p>}
        </div>

  
        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            disabled={isUploading || images.length === 0}
            className="w-full bg-red-700  text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
export default CreatePostPage;
