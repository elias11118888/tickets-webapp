"use client";
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [upload, { loading: uploading }] = useUpload();

  useEffect(() => {
    if (!userLoading && user) {
      fetchCategories();
    }
  }, [user, userLoading]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setUrlInput(url);
    if (url) {
      setPreviewUrl(url);
    }
  };

  const openUploadModal = (category) => {
    setSelectedCategory(category);
    setShowUploadModal(true);
    setUploadMethod("file");
    setSelectedFile(null);
    setUrlInput("");
    setPreviewUrl("");
    setError(null);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedCategory(null);
    setSelectedFile(null);
    setUrlInput("");
    setPreviewUrl("");
    setError(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedCategory) return;

    try {
      setUploadingCategory(selectedCategory.id);
      setError(null);

      let mediaUrl = "";
      let mediaType = "";

      if (uploadMethod === "file" && selectedFile) {
        const {
          url,
          mimeType,
          error: uploadError,
        } = await upload({ file: selectedFile });
        if (uploadError) throw new Error(uploadError);
        mediaUrl = url;
        mediaType = mimeType.startsWith("image/") ? "image" : "video";
      } else if (uploadMethod === "url" && urlInput) {
        const {
          url,
          mimeType,
          error: uploadError,
        } = await upload({ url: urlInput });
        if (uploadError) throw new Error(uploadError);
        mediaUrl = url;
        mediaType = mimeType.startsWith("image/") ? "image" : "video";
      } else {
        throw new Error("Please select a file or enter a URL");
      }

      const response = await fetch("/api/categories/update-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          mediaUrl: mediaUrl,
          mediaType: mediaType,
        }),
      });

      if (!response.ok) throw new Error("Failed to update category media");

      setSuccessMessage(
        `Successfully updated media for ${selectedCategory.name}`
      );
      setTimeout(() => setSuccessMessage(""), 3000);

      await fetchCategories();
      closeUploadModal();
    } catch (error) {
      console.error("Error uploading media:", error);
      setError(error.message || "Failed to upload media");
    } finally {
      setUploadingCategory(null);
    }
  };

  const getMediaPreview = (category) => {
    if (!category.image_url) return null;

    if (category.media_type === "video") {
      return (
        <video
          src={category.image_url}
          className="w-full h-48 object-cover rounded-lg"
          controls
          muted
        />
      );
    } else {
      return (
        <img
          src={category.image_url}
          alt={category.name}
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    }
  };

  const getPreviewComponent = () => {
    if (!previewUrl) return null;

    const isVideo = selectedFile
      ? selectedFile.type.startsWith("video/")
      : previewUrl.includes(".mp4") ||
        previewUrl.includes(".webm") ||
        previewUrl.includes(".mov");

    if (isVideo) {
      return (
        <video
          src={previewUrl}
          className="w-full h-48 object-cover rounded-lg"
          controls
          muted
        />
      );
    } else {
      return (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg"
          onError={() => setError("Invalid image URL")}
        />
      );
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#357AFF] rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-lock text-gray-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access the admin panel.
          </p>
          <a
            href="/account/signin"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <a href="/admin" className="text-[#357AFF] hover:text-[#2E69DE]">
                <i className="fas fa-arrow-left"></i>
              </a>
              <h1 className="text-2xl font-bold text-gray-900">
                Category Media Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Hello, {user.name || user.email}
              </span>
              <a
                href="/account/logout"
                className="text-sm text-gray-600 hover:text-[#357AFF]"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <i className="fas fa-check-circle text-green-500 mr-3"></i>
            <span className="text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Category Media
          </h2>
          <p className="text-gray-600">
            Upload and manage images or videos for event categories
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <i className="fas fa-exclamation-triangle text-red-400 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Categories
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchCategories}
              className="bg-[#357AFF] text-white px-6 py-3 rounded-lg hover:bg-[#2E69DE] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-folder-open text-gray-400 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600">
              Create some categories first to manage their media.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative">
                  {category.image_url ? (
                    <div className="relative">
                      {getMediaPreview(category)}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            category.media_type === "video"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {category.media_type === "video" ? "Video" : "Image"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-image text-gray-400 text-4xl mb-2"></i>
                        <p className="text-gray-500 text-sm">
                          No media uploaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <button
                    onClick={() => openUploadModal(category)}
                    disabled={uploadingCategory === category.id}
                    className="w-full bg-[#357AFF] text-white py-2 px-4 rounded-lg hover:bg-[#2E69DE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {uploadingCategory === category.id ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload mr-2"></i>
                        {category.image_url ? "Update Media" : "Upload Media"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Upload Media for {selectedCategory.name}
                </h3>
                <button
                  onClick={closeUploadModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Upload Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Method
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setUploadMethod("file")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      uploadMethod === "file"
                        ? "bg-[#357AFF] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <i className="fas fa-file-upload mr-2"></i>
                    File Upload
                  </button>
                  <button
                    onClick={() => setUploadMethod("url")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      uploadMethod === "url"
                        ? "bg-[#357AFF] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <i className="fas fa-link mr-2"></i>
                    URL Input
                  </button>
                </div>
              </div>

              {/* File Upload */}
              {uploadMethod === "file" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Image or Video
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
                  />
                </div>
              )}

              {/* URL Input */}
              {uploadMethod === "url" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
                  />
                </div>
              )}

              {/* Preview */}
              {previewUrl && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {getPreviewComponent()}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeUploadModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || (!selectedFile && !urlInput)}
                  className="px-6 py-2 bg-[#357AFF] text-white rounded-lg hover:bg-[#2E69DE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload mr-2"></i>
                      Upload Media
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;