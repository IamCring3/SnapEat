import { useState } from "react";
import { store } from "../lib/store";
import toast from "react-hot-toast";
import { AddressType } from "../../type";

interface ShippingAddressProps {
  onAddressSubmit: (address: ShippingAddressType) => void;
}

export interface ShippingAddressType extends AddressType {
  fullName: string;
  phoneNumber: string;
}

const ShippingAddressForm = ({ onAddressSubmit }: ShippingAddressProps) => {
  const { currentUser } = store();

  // Try to load saved address from localStorage or user profile
  const getSavedAddress = (): ShippingAddressType | null => {
    try {
      // First check localStorage for the most recently used address
      const savedAddress = localStorage.getItem('lastShippingAddress');
      if (savedAddress) {
        return JSON.parse(savedAddress);
      }

      // If no address in localStorage, check if user has an address in their profile
      if (currentUser?.address) {
        return {
          fullName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
          addressLine1: currentUser.address.addressLine1 || "",
          addressLine2: currentUser.address.addressLine2 || "",
          city: currentUser.address.city || "",
          state: currentUser.address.state || "",
          postalCode: currentUser.address.postalCode || "",
          country: currentUser.address.country || "India",
          phoneNumber: currentUser?.phoneNumber || "",
        };
      }
    } catch (error) {
      console.error("Error loading saved address:", error);
    }
    return null;
  };

  const savedAddress = getSavedAddress();

  const [address, setAddress] = useState<ShippingAddressType>({
    fullName: savedAddress?.fullName || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
    addressLine1: savedAddress?.addressLine1 || "",
    addressLine2: savedAddress?.addressLine2 || "",
    city: savedAddress?.city || "",
    state: savedAddress?.state || "",
    postalCode: savedAddress?.postalCode || "",
    country: savedAddress?.country || "India",
    phoneNumber: savedAddress?.phoneNumber || currentUser?.phoneNumber || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!address.fullName || !address.addressLine1 || !address.city ||
        !address.state || !address.postalCode || !address.country || !address.phoneNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    if (!phoneRegex.test(address.phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Postal code validation for India
    if (address.country === "India" && !/^\d{6}$/.test(address.postalCode)) {
      toast.error("Please enter a valid 6-digit postal code");
      return;
    }

    // Save address to localStorage for future use
    try {
      localStorage.setItem('lastShippingAddress', JSON.stringify(address));
    } catch (error) {
      console.error("Error saving address to localStorage:", error);
    }

    onAddressSubmit(address);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={address.fullName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="addressLine1"
              id="addressLine1"
              value={address.addressLine1}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
              Address Line 2
            </label>
            <input
              type="text"
              name="addressLine2"
              id="addressLine2"
              value={address.addressLine2}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <input
              type="text"
              name="city"
              id="city"
              value={address.city}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
              required
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State / Province *
            </label>
            <input
              type="text"
              name="state"
              id="state"
              value={address.state}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
              required
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              Postal Code *
            </label>
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              value={address.postalCode}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
              required
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country *
            </label>
            <select
              name="country"
              id="country"
              value={address.country}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
              required
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={address.phoneNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full rounded-md border border-transparent bg-red-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Save Address & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingAddressForm;
