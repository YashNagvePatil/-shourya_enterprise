import React, { useState, useEffect } from "react";
import { useCreateProduct } from "../hook/useAdmin";

const CreateProductPage = () => {
  const {
    handleCreateProduct,
    clearState,
    isLoading,
    isSuccess,
    isError,
    error,
    message,
  } = useCreateProduct();

  // Local Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    shortDescription: "",
    category: "",
    brand: "",
    mrp: "",
    price: "",
    bv: "",
    pv: "",
    directCommission: "",
    stock: "",
    packageTier: "None",
    gstPercentage: "18",
    isActivationPackage: false,
  });

  // Selected Image Files & Previews
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Auto-cleanup / state reset on unmount
  useEffect(() => {
    return () => clearState();
  }, []);

  // Reset form on successful creation
  useEffect(() => {
    if (isSuccess) {
      setFormData({
        name: "",
        sku: "",
        description: "",
        shortDescription: "",
        category: "",
        brand: "",
        mrp: "",
        price: "",
        bv: "",
        pv: "",
        directCommission: "",
        stock: "",
        packageTier: "None",
        gstPercentage: "18",
        isActivationPackage: false,
      });
      setSelectedFiles([]);
      setImagePreviews([]);
    }
  }, [isSuccess]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Image Selection (Max 5)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedFiles.length > 5) {
      alert("Maximum 5 images allowed.");
      return;
    }

    const updatedFiles = [...selectedFiles, ...files];
    setSelectedFiles(updatedFiles);

    // Generate Preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove Single Selected Image
  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Attach File Array to payload
    const payload = {
      ...formData,
      images: selectedFiles,
    };

    await handleCreateProduct(payload);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-light p-6 md:p-12 border-t-2 border-black">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-light tracking-wide uppercase text-black">
            Create Product
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
            Inventory & MLM Package Management
          </p>
        </header>

        {/* Success / Error Banners */}
        {isSuccess && (
          <div className="mb-8 p-4 bg-gray-50 border border-black text-black text-sm font-light flex justify-between items-center">
            <span>✓ {message}</span>
            <button
              onClick={clearState}
              className="text-xs uppercase tracking-wider underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {isError && (
          <div className="mb-8 p-4 bg-gray-50 border border-red-600 text-red-600 text-sm font-light flex justify-between items-center">
            <span>✕ {error}</span>
            <button
              onClick={clearState}
              className="text-xs uppercase tracking-wider underline cursor-pointer text-red-600"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Basic Information */}
          <section className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
              01. Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Premium Starter Kit"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  SKU (Unique Code) *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  placeholder="e.g. SKU-MLM-001"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black uppercase transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Wellness"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Generic"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                Short Description
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Brief summary for listings"
                className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Write full product specifications..."
                className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </section>

          {/* Section 2: Pricing & Stock */}
          <section className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
              02. Pricing & Stock
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  MRP Rate *
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Selling Price (DP) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  GST (%)
                </label>
                <input
                  type="number"
                  name="gstPercentage"
                  value={formData.gstPercentage}
                  onChange={handleChange}
                  placeholder="18"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Section 3: MLM & Binary Settings */}
          <section className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
              03. MLM Attributes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Business Volume (BV)
                </label>
                <input
                  type="number"
                  name="bv"
                  value={formData.bv}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Point Value (PV)
                </label>
                <input
                  type="number"
                  name="pv"
                  value={formData.pv}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Direct Commission
                </label>
                <input
                  type="number"
                  name="directCommission"
                  value={formData.directCommission}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 font-light rounded-none focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 p-4 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActivationPackage"
                  name="isActivationPackage"
                  checked={formData.isActivationPackage}
                  onChange={handleChange}
                  className="w-4 h-4 rounded-none accent-black cursor-pointer"
                />
                <label
                  htmlFor="isActivationPackage"
                  className="text-sm font-light text-gray-800 cursor-pointer"
                >
                  Mark as User Activation Package
                </label>
              </div>

              {formData.isActivationPackage && (
                <div className="flex items-center space-x-3">
                  <label className="text-xs uppercase tracking-wider text-gray-600">
                    Tier:
                  </label>
                  <select
                    name="packageTier"
                    value={formData.packageTier}
                    onChange={handleChange}
                    className="bg-white border border-gray-300 p-2 text-sm font-light rounded-none focus:outline-none focus:border-black"
                  >
                    <option value="None">None</option>
                    <option value="Basic">Basic</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Product Images Upload */}
          <section className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
              04. Product Media (Max 5)
            </h2>

            <div className="border border-dashed border-gray-400 p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                id="file-upload"
                onChange={handleImageChange}
                disabled={selectedFiles.length >= 5}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer inline-block border border-black px-6 py-3 text-xs uppercase tracking-widest font-light transition-colors ${
                  selectedFiles.length >= 5
                    ? "opacity-40 cursor-not-allowed bg-gray-200"
                    : "bg-white hover:bg-black hover:text-white"
                }`}
              >
                Select Product Images
              </label>
              <p className="text-xs text-gray-400 mt-2">
                Supported formats: JPEG, PNG, WEBP (Max 5 MB each)
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative border border-gray-200 group bg-white p-1"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-black text-white w-6 h-6 text-xs flex items-center justify-center opacity-90 hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submit Action Button */}
          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto px-10 py-4 text-xs uppercase tracking-widest transition-colors font-light border rounded-none ${
                isLoading
                  ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-black border-black text-white hover:bg-white hover:text-black"
              }`}
            >
              {isLoading ? "Processing & Uploading..." : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;