import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import LocationMap from '../../components/contactInfo/locationMap';
import { jwtDecode } from 'jwt-decode'; // ⬅️ make sure this is installed

export default function EventForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    owner_name: '',
    images: [],
    event_date: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      if (!decoded.isAdmin) return navigate("/not-authorized");
    } catch (err) {
      console.error("Invalid token:", err);
      return navigate("/login");
    }
  }, [navigate]);

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file =>
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== acceptedFiles.length) {
      toast.warning("Some files were rejected. Only image files under 5MB are allowed.");
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  }, []);

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeInputChange = (type, value) => {
    let cleanedValue = value.replace(/[^\d]/g, '');
    if (cleanedValue.length > 0) {
      const firstDigit = parseInt(cleanedValue[0]);
      if (firstDigit > 1) {
        cleanedValue = '0' + cleanedValue;
      }
      if (cleanedValue.length >= 2) {
        const hours = parseInt(cleanedValue.slice(0, 2));
        if (hours > 12) {
          toast.warning('Please enter a number between 00 and 12 for hours');
          cleanedValue = '12' + cleanedValue.slice(2);
        }
      }
    }
    if (cleanedValue.length > 2) {
      cleanedValue = cleanedValue.slice(0, 2) + ':' + cleanedValue.slice(2);
    }
    if (cleanedValue.includes(':')) {
      const minutes = parseInt(cleanedValue.split(':')[1]);
      if (minutes > 59) {
        toast.warning('Minutes must be between 00 and 59');
        cleanedValue = cleanedValue.slice(0, 3) + '59';
      }
    }
    setFormData(prev => ({
      ...prev,
      [type]: cleanedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = {
      title: 'Please enter an event title',
      description: 'Please enter an event description',
      location: 'Please select an event location',
      owner_name: 'Please enter the organizer name',
      event_date: 'Please select an event date',
      start_time: 'Please enter a start time',
      end_time: 'Please enter an end time'
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field]?.trim()) {
        toast.error(message);
        return;
      }
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.start_time) || !timeRegex.test(formData.end_time)) {
      toast.error('Please enter valid time format (HH:MM)');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      toast.error('End time must be after start time');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("owner_name", formData.owner_name);
      payload.append("location", formData.location);
      payload.append("event_date", formData.event_date);
      payload.append("start_time", formData.start_time);
      payload.append("end_time", formData.end_time);
      formData.images.forEach(img => payload.append("images", img));

      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.message || "Failed to create event");
        return;
      }

      toast.success("Event created successfully!");
      navigate(`/events/${data.event_id}`);
    } catch (error) {
      toast.error("Error creating event");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxSize: 5 * 1024 * 1024
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col ">
      <div className="w-full py-6 px-4 md:px-12 lg:px-24 xl:px-40 mt-3">
        <h1 className="text-4xl font-semibold text-red-700 text-center mb-6">
          Create New Event
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-green-800 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-green-800 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 resize-none"
                rows="5"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-green-800 mb-1">Organizer Name</label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-green-800 mb-1">Event Date</label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold text-green-800 mb-1">Start Time</label>
                <input
                  type="text"
                  value={formData.start_time}
                  onChange={(e) => handleTimeInputChange('start_time', e.target.value)}
                  placeholder="HH:MM"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  maxLength="5"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-green-800 mb-1">End Time</label>
                <input
                  type="text"
                  value={formData.end_time}
                  onChange={(e) => handleTimeInputChange('end_time', e.target.value)}
                  placeholder="HH:MM"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  maxLength="5"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-green-800 mb-1">Images</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-gray-600">
                  {isDragActive ? 'Drop the images here...' : 'Drag & drop images or click to select files'}
                </p>
                <p className="text-sm text-gray-500 mt-1">JPEG, PNG, GIF (max 5MB each)</p>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(img)}
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
            </div>

            <LocationMap onLocationSelect={(loc) => setFormData(prev => ({ ...prev, location: loc }))} />
            {formData.location && (
              <p className="text-sm text-green-800 mt-1">{formData.location}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              className="w-full bg-red-700 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting || formData.images.length === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Event Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
