import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../PostsPages/showDataProduct.css";
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${process.env.REACT_APP_API_URL}/${path}`;
};

/**
 * SinglePost Component
 * This component displays a single product post with its details, images, and contact information.
 * It includes features like image gallery with navigation, keyboard controls, and contact seller functionality.
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const IMAGE_LOAD_TIMEOUT = 5000;

const loadImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    if (!imagePath) {
      reject(new Error('Invalid image data'));
      return;
    }

    const img = new Image();
    const timeoutId = setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, IMAGE_LOAD_TIMEOUT);

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load image'));
    };

    try {
      img.src = getImageUrl(imagePath);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(new Error('Invalid image format'));
    }
  });
};


const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios({
      url,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });

    if (response.status === 401) {
      throw new Error('Unauthorized access');
    }

    if (response.status === 404) {
      throw new Error('Post not found');
    }

    if (response.status >= 500) {
      throw new Error('Server error');
    }

    return response.data;
  } catch (error) {
    if (retries > 0 && error.message !== 'Unauthorized access') {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export default function ShowDataProduct() {
  // Get the post ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [post, setPost] = useState(null); // Stores the post data
  const [showContact, setShowContact] = useState(false); // Controls contact popup visibility
  const [selectedImage, setSelectedImage] = useState(null); // Currently selected image for full view
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index of currently displayed image
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [cache, setCache] = useState({});
  const imageLoadQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded)
        setCurrentUserId(decoded.userId); 
        setIsAdmin(decoded.isAdmin);
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, []);
  const handleClaimReceived = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("You must be logged in!");

    await axios.post(
      `${process.env.REACT_APP_API_URL}/api/donations/claims`,
      { post_id: post.post_id, message: "I received this item" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("Claim sent to the donator!");
  } catch (err) {
    if (err.response?.status === 400) {
      alert(err.response.data.message);
    } else {
      toast.error("Something went wrong!");
    }
  }
};

  const processImageQueue = useCallback(async () => {
    if (isProcessingQueue.current || imageLoadQueue.current.length === 0) return;

    isProcessingQueue.current = true;
    const imageToLoad = imageLoadQueue.current.shift();

    try {
      await loadImage(imageToLoad.base64);
      setLoadedImages(prev => ({
        ...prev,
        [imageToLoad.id]: true
      }));
    } catch (error) {
      console.error('Error loading image:', error);
    }

    isProcessingQueue.current = false;
    processImageQueue();
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id) {
        throw new Error('Invalid post ID');
      }

      if (cache[id]) {
        setPost(cache[id]);
        setIsLoading(false);
        return;
      }

      const data = await fetchWithRetry(`${process.env.REACT_APP_API_URL}/Posting/posts/${id}`);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      setCache(prev => ({
        ...prev,
        [id]: data
      }));
      
      setPost(data);

      if (data.primary_photo) {
        imageLoadQueue.current.push({
          id: 'primary',
          base64: data.primary_photo
        });
      }

      if (data.extra_images?.length) {
        data.extra_images.forEach((img, index) => {
          if (img) {
            imageLoadQueue.current.push({
              id: `extra_${index}`,
              base64: img
            });
          }
        });
      }

      processImageQueue();
    } catch (error) {
      console.error("Error fetching post:", error);
      let errorMessage = "Failed to load post. ";
      
      if (error.message === 'Unauthorized access') {
        errorMessage += "Please log in to view this post.";
        navigate('/login');
      } else if (error.message === 'Post not found') {
        errorMessage += "The post you're looking for doesn't exist.";
        navigate('/');
      } else if (error.message === 'Server error') {
        errorMessage += "Server is currently unavailable. Please try again later.";
      } else {
        errorMessage += "Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id, cache, processImageQueue, navigate]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

const allImages = useMemo(() => {
  if (!post) return [];
  const primary = post.primary_photo ? [post.primary_photo] : [];
  const extras = post.extra_images || [];
  return [...primary, ...extras];
}, [post]);


  const handleImageClick = useCallback((index) => {
    setCurrentImageIndex(index);
  }, []);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextImage, handlePrevImage]);
const showEditButton = post && (
  String(currentUserId) === String(post.user_id) 
);

  // Show loading state while fetching data
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Post</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={fetchPost}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="bg-gray-200 rounded-xl h-[500px] mb-4"></div>
              <div className="grid grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-[120px]"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-6">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-6">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-mono">
      <div className="relative max-w-full mx-auto">
        {/* Header Section - Title and Basic Info */}
        <div className="bg-white/90 p-8 rounded-xl shadow-md mb-8">
<>
  {/* Availability badge top-left */}
  {post.availability && (
    <div className={`absolute top-0 left-0 mt-2 ml-2 px-3 py-1 text-xs font-bold rounded-br-md z-10 shadow ${
      post.availability === 'available'
        ? 'bg-green-600 text-white'
        : post.availability === 'reserved'
        ? 'bg-yellow-500 text-white'
        : 'bg-gray-500 text-white'
    }`}>
      {post.availability.toUpperCase()}
    </div>
  )}

  {/* Centered Title */}
  <h1 className="text-4xl font-semibold text-green-600  text-center w-full">
    {post.title}
  </h1>
</>
          <div className="flex items-center justify-between">
<p className="text-sm text-gray-500">
  Posted by 
  <span
    className="font-semibold text-gray-800 cursor-pointer text-blue-600 hover:underline ml-1"
    onClick={() => navigate(`/user/${post.user_id}`)}
  >
    {post.username}
  </span>
  {isAdmin && (
    <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold text-white bg-red-600">
      ADMIN
    </span>
  )}
</p>

<p className="text-sm text-gray-500">
  Location: <span className="font-semibold text-gray-800">
    {post.location?.split('-')[0]?.trim() || 'Unknown'}
  </span>
</p>


           
          </div>
           <div className="w-1/6">
                {showEditButton && (<button
                onClick={() => navigate(`/edit_post/${post.post_id}`)}
                className="w-full bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-800
              transition text-lg font-semibold shadow-md mt-4"> Edit Post  </button>)}
        </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg">              
              <div className="image-gallery">
                {/* Main Image Container with Navigation Arrows */}
                <div className="main-image-container mb-5 bg-white  rounded-lg  relative">
                  {/* Previous Image Button */}
                  {allImages.length > 1 && (
                    <button
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                      onClick={handlePrevImage}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

{/* Main Image Display */}
<div className="flex items-center justify-center p-4">
  {allImages[currentImageIndex] && (
    <img
      src={getImageUrl(allImages[currentImageIndex])}
      alt="Main"
      className={`max-w-full max-h-[500px] w-auto h-auto object-contain rounded-sm transition-opacity duration-300 ${
        loadedImages[`extra_${currentImageIndex}`] ? 'opacity-100' : 'opacity-0'
      }`}
      loading="lazy"
      onLoad={(e) => {
        setLoadedImages(prev => ({
          ...prev,
          [`extra_${currentImageIndex}`]: true
        }));
      }}
    />
  )}
</div>


                  {/* Next Image Button */}
                  {allImages.length > 1 && (
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                      onClick={handleNextImage}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Thumbnail Gallery - Shows all available images */}
                {allImages.length > 1 && (
                  <div className="thumbnail-gallery mt-4 p-5">
                    <div className="grid grid-cols-5 gap-3">
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          className={`thumbnail-container relative w-[120px] h-[120px] cursor-pointer rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ${
                            currentImageIndex === idx ? 'ring-2 ring-green-500' : 'hover:ring-2 hover:ring-green-300'
                          }`}
                          onClick={() => handleImageClick(idx)}
                        >
                          <img
                            src={getImageUrl(img)}
                            alt={`Thumbnail ${idx + 1}`}
                            className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-300 ${
                              loadedImages[`extra_${idx}`] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                            loading="lazy"
                            onLoad={(e) => {
                              setLoadedImages(prev => ({
                                ...prev,
                                [`extra_${idx}`]: true
                              }));
                            }}
                          />
                          {/* Selected Image Indicator */}
                          {currentImageIndex === idx && (
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-l shadow-lg mb-8">
    
              <h2 className="text-xl font-semibold text-green-700 mb-4">تفاصيل المنشور</h2>
  
              <div className="space-y-6">
                {/* Product Description */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">الوصف</h3>
                  <p className="text-gray-700 leading-relaxed">{post.description}</p>
                </div>

                {/* Product Features */}
                {post.features && post.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">الفئة</h3>
                    <ul className="space-y-3">
                      {post.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}


                {/* Contact Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg  font-semibold text-red-600 mb-3">معلومات التواصل</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">الايميل</p>
                      <p className="text-gray-800 font-medium">{post.email}</p>
                    </div>
                    {post.phone && (
                      <div>
                        <p className="text-sm text-gray-500">رقم الهاتف</p>
                        <p className="text-gray-800 font-medium">{post.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">الموقع</p>
                      <p className="text-gray-800 font-medium">{post.location}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Seller Button */}
                <div className="pt-4">
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition text-lg font-semibold shadow-md"
                  >
                    التواصل مع المتبرع
                  </button>
                </div>
                    {post.availability === "available" &&
  currentUserId &&
  String(currentUserId) !== String(post.user_id) && (
    <button
      onClick={handleClaimReceived}
      className="w-full bg-yellow-500 text-white px-8 py-4 rounded-lg hover:bg-yellow-600 transition text-lg font-semibold shadow-md mt-4"
    >
      I received this item
    </button>
)}

                
              </div>
            </div>
          </div>
        </div>

        {/* Contact Popup Modal */}
        {showContact && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl text-center w-96">
              <h2 className="text-2xl font-bold text-green-700 mb-6">Contact Information</h2>

              {/* Email Section */}
              <div className="mb-6">
                <p className="text-gray-800 font-medium mb-2">Email:</p>
                <a
                  href={`mailto:${post.email}`}
                  className="text-blue-600 underline break-words hover:text-blue-800"
                >
                  {post.email}
                </a>
              </div>

              {/* Phone Number Section */}
              <div className="mb-6">
                <p className="text-gray-800 font-medium mb-2">رقم الهاتف:</p>
                <p className="text-gray-700 mb-3">{post.phone || "Not provided"}</p>

                {/* WhatsApp Button */}
                {post.phone && (
                  <a
                    href={`https://wa.me/${post.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition w-full"
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.52 3.48a11.9 11.9 0 0 0-16.86 0 11.9 11.9 0 0 0-2.65 13.07L.3 23.7l7.32-1.92a11.91 11.91 0 0 0 5.9 1.54 11.9 11.9 0 0 0 8.4-20.84zM12 21.48a9.39 9.39 0 0 1-4.77-1.3l-.34-.2-4.34 1.14 1.15-4.22-.22-.35a9.38 9.38 0 1 1 8.52 4.93zm5.26-7.32c-.28-.14-1.67-.82-1.92-.91-.26-.1-.45-.14-.63.14s-.73.9-.9 1.1c-.16.18-.33.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.92-.16-.28-.02-.43.12-.57.12-.12.28-.3.41-.45.14-.16.18-.28.28-.46.1-.18.05-.35-.02-.49-.07-.14-.63-1.5-.87-2.05-.23-.56-.47-.48-.63-.49h-.54c-.18 0-.46.06-.7.3s-.91.9-.91 2.2c0 1.3.94 2.55 1.07 2.73.14.18 1.85 2.83 4.48 3.96.63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.08 1.67-.68 1.9-1.34.23-.65.23-1.2.16-1.34-.08-.14-.26-.2-.54-.34z" />
                    </svg>
                    التواصل على الواتساب
                  </a>
                )}
                {currentUserId && String(currentUserId) !== String(post.user_id) && (
  <button
    onClick={() => {
      setShowContact(false);  // Close modal
      navigate(`/ar/dm/${post.user_id}`);  // Navigate to DM page
    }}
    className="mt-3 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition w-full"
  >
    💬 مراسلة المتبرع
  </button>
)}

              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowContact(false)}
                className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
