import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, db, storage } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { MdPhotoLibrary } from "react-icons/md";
import Label from "./Label";
import { useNavigate } from "react-router-dom";
import { store } from "../lib/store";

// Declare global window type
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

const PhoneAuthProduction = () => {
  const navigate = useNavigate();
  const { getUserInfo } = store();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1); // 1: Enter phone and user details, 2: Enter verification code
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and registration
  const [recaptchaVerified, setRecaptchaVerified] = useState(false); // Track if reCAPTCHA is verified
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    avatar: null as File | null,
    avatarUrl: "",
    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India"
    }
  });

  // Initialize reCAPTCHA when component mounts and clean up on unmount
  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    const initializeRecaptcha = () => {
      console.log("Initializing reCAPTCHA on component mount");

      // Log Firebase auth state for debugging
      console.log("Firebase Auth current user:", auth.currentUser);
      console.log("Firebase Auth current language code:", auth.languageCode);
      console.log("Firebase Auth settings:", {
        appVerificationDisabledForTesting: auth.settings.appVerificationDisabledForTesting
      });

      // Clear any existing reCAPTCHA first
      if (window.recaptchaVerifier) {
        try {
          console.log("Clearing existing reCAPTCHA verifier");
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error("Error clearing existing reCAPTCHA:", e);
        }
      }

      try {
        console.log("Creating new reCAPTCHA verifier with configuration:", {
          size: 'normal',
          isolated: true,
          languageCode: 'en'
        });

        // Create a new reCAPTCHA verifier with improved configuration
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: (response) => {
            console.log("reCAPTCHA verified successfully with response token:", response);
            // Set the verified state to true
            setRecaptchaVerified(true);
            toast.success("Security check completed! You can now proceed.");
          },
          'expired-callback': () => {
            console.log("reCAPTCHA expired");
            toast.error("Security check expired. Please solve it again.");
            // Reset the verified state
            setRecaptchaVerified(false);

            // Re-initialize the reCAPTCHA
            setTimeout(() => {
              initializeRecaptcha();
            }, 500);
          },
          // Add these additional parameters to improve reliability
          'isolated': true, // Use isolated mode for better compatibility
          'hl': 'en' // Set language to English
        });
      } catch (initError) {
        console.error("ERROR INITIALIZING RECAPTCHA:", initError);
        console.error("Error details:", {
          message: initError.message,
          code: initError.code,
          stack: initError.stack
        });
      }

      // Render the reCAPTCHA
      try {
        window.recaptchaVerifier.render();
        console.log("reCAPTCHA rendered successfully");
      } catch (error) {
        console.error("Error rendering reCAPTCHA:", error);
      }
    };

    // Initialize reCAPTCHA
    initializeRecaptcha();

    // Clean up on component unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error("Error clearing reCAPTCHA on unmount:", e);
        }
      }
    };
  }, []);

  // Send verification code
  const sendVerificationCode = async (useInvisibleRecaptcha = false) => {
    try {
      setLoading(true);
      setError("");

      // Format phone number (ensure it has country code)
      const formattedPhoneNumber = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      console.log("Sending verification code to:", formattedPhoneNumber);

      // Check if reCAPTCHA is already initialized
      if (!window.recaptchaVerifier) {
        console.log("reCAPTCHA not initialized, creating a new one");

        // Create a new reCAPTCHA verifier with the appropriate size
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: useInvisibleRecaptcha ? 'invisible' : 'normal',
          callback: (response) => {
            console.log("reCAPTCHA verified:", response);
            setRecaptchaVerified(true);
            toast.success("Security check completed!");
          },
          'expired-callback': () => {
            console.log("reCAPTCHA expired");
            setRecaptchaVerified(false);
          },
          'isolated': true,
          'hl': 'en'
        });

        try {
          await window.recaptchaVerifier.render();
          console.log("reCAPTCHA rendered successfully");
        } catch (renderError) {
          console.error("Error rendering reCAPTCHA:", renderError);
        }
      }

      console.log("Using reCAPTCHA verifier, type:", useInvisibleRecaptcha ? "invisible" : "normal");

      // Send verification code with the newly created verifier
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        window.recaptchaVerifier
      );

      console.log("Verification code sent successfully");

      // Save confirmation result
      window.confirmationResult = confirmationResult;

      // Move to verification step
      setStep(2);
      toast.success("Verification code sent!");
    } catch (error: any) {
      // Log detailed error information to console for debugging
      console.error("FIREBASE ERROR DETAILS:");
      console.error("Error object:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error JSON:", JSON.stringify(error, null, 2));

      if (error.code === 'auth/invalid-app-credential') {
        console.error("SPECIFIC ERROR: Invalid app credential - This typically means the reCAPTCHA verification failed");
      }

      if (error.code === 'auth/captcha-check-failed') {
        console.error("SPECIFIC ERROR: Captcha check failed - The reCAPTCHA response token was invalid");
      }

      // Simple user-facing error message
      let errorMessage = "Failed to send verification code. Please try again.";

      // Only show specific error messages for certain errors
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "Invalid phone number format. Please include country code (e.g., +1234567890)";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please try again later or use a different phone number.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }

      // Reset reCAPTCHA state
      setRecaptchaVerified(false);

      // Re-initialize reCAPTCHA with a delay
      setTimeout(() => {
        try {
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }

          // Create a new reCAPTCHA verifier with invisible size for retry
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: (response) => {
              console.log("Invisible reCAPTCHA verified:", response);
              setRecaptchaVerified(true);
            },
            'expired-callback': () => {
              console.log("reCAPTCHA expired");
              setRecaptchaVerified(false);
            },
            'isolated': true
          });

          try {
            window.recaptchaVerifier.render();
          } catch (renderError) {
            console.error("Error rendering reCAPTCHA:", renderError);
          }
        } catch (recaptchaError) {
          console.error("Error re-initializing reCAPTCHA:", recaptchaError);
        }
      }, 1000);

      // Always clear reCAPTCHA on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error("Error clearing reCAPTCHA:", e);
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify code and sign in
  const verifyCode = async () => {
    try {
      setLoading(true);
      setError("");

      if (!window.confirmationResult) {
        throw new Error("Verification session expired. Please try again.");
      }

      // Confirm the verification code
      const result = await window.confirmationResult.confirm(verificationCode);

      // User signed in successfully
      const user = result.user;

      // Check if this is a registration or login
      if (isRegistering) {
        // Upload avatar if provided
        let avatarUrl = "";
        if (userInfo.avatar) {
          const storageRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
          await uploadBytes(storageRef, userInfo.avatar);
          avatarUrl = await getDownloadURL(storageRef);
        }

        // Save user profile to Firestore
        console.log("Saving user profile to Firestore with UID:", user.uid);
        try {
          await setDoc(doc(db, "users", user.uid), {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            phoneNumber: user.phoneNumber,
            avatar: avatarUrl,
            id: user.uid,
            address: userInfo.address,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }, { merge: true });
          console.log("User profile saved successfully");
        } catch (error) {
          console.error("Error saving user profile:", error);
          toast.error("Error saving user profile. Please try again.");
        }

        toast.success("Successfully registered and logged in!");
      } else {
        // Just update last login time for existing users
        await setDoc(doc(db, "users", user.uid), {
          lastLogin: new Date().toISOString()
        }, { merge: true });

        toast.success("Successfully logged in!");
      }

      // Reset form
      setUserInfo({
        firstName: "",
        lastName: "",
        avatar: null,
        avatarUrl: "",
        address: {
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India"
        }
      });

      // Update the global store with the user information
      console.log("Updating global store with user ID:", user.uid);
      await getUserInfo(user.uid);

      // Automatically redirect to home page after successful login
      setTimeout(() => {
        navigate("/");
      }, 500);

    } catch (error: any) {
      // Log detailed error information to console for debugging
      console.error("FIREBASE VERIFICATION ERROR DETAILS:");
      console.error("Error object:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error JSON:", JSON.stringify(error, null, 2));

      // Simple user-facing error message
      setError("Failed to verify code. Please try again.");
      toast.error("Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number and user info submit
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Phone submit form submitted");

    try {
      // Clear any previous errors
      setError("");

      // Check if reCAPTCHA is initialized
      if (!window.recaptchaVerifier) {
        setError("Security check not loaded. Please refresh the page and try again.");
        return;
      }

      // Validate user information if registering
      if (isRegistering) {
        if (!userInfo.firstName || !userInfo.lastName) {
          setError("First name and last name are required");
          return;
        }

        // Validate address fields if registering
        if (!userInfo.address.addressLine1 || !userInfo.address.city ||
            !userInfo.address.state || !userInfo.address.postalCode) {
          setError("Please fill in all required address fields");
          return;
        }

        // Validate postal code format for India
        if (userInfo.address.country === "India" && !/^\d{6}$/.test(userInfo.address.postalCode)) {
          setError("Please enter a valid 6-digit postal code for India");
          return;
        }
      }

      // Validate phone number format
      if (!phoneNumber) {
        setError("Please enter a phone number");
        return;
      }

      const formattedPhoneNumber = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      // Basic validation for phone number format
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formattedPhoneNumber)) {
        setError("Invalid phone number format. Please include country code (e.g., +1234567890)");
        return;
      }

      // For India, validate phone number format more strictly
      if (formattedPhoneNumber.startsWith("+91") && !/^\+91[6-9]\d{9}$/.test(formattedPhoneNumber)) {
        setError("Invalid Indian phone number. Format should be +91 followed by a 10-digit number starting with 6-9");
        return;
      }

      // Try sending verification code with normal reCAPTCHA first
      try {
        await sendVerificationCode(false);
      } catch (verificationError: any) {
        console.error("Error with normal reCAPTCHA, trying invisible:", verificationError);

        // If the first attempt fails with specific errors, try with invisible reCAPTCHA
        if (verificationError.code === 'auth/invalid-app-credential' ||
            verificationError.code === 'auth/captcha-check-failed') {

          // Clear existing reCAPTCHA
          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            } catch (e) {
              console.error("Error clearing reCAPTCHA:", e);
            }
          }

          toast.info("Trying alternative verification method...");

          // Try with invisible reCAPTCHA
          await sendVerificationCode(true);
        } else {
          // Re-throw other errors
          throw verificationError;
        }
      }
    } catch (error: any) {
      // Log detailed error information to console for debugging
      console.error("PHONE SUBMIT ERROR DETAILS:");
      console.error("Error object:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error stack:", error.stack);
      console.error("Full error JSON:", JSON.stringify(error, null, 2));

      // Simple user-facing error message
      setError("Failed to process your request. Please try again.");
      toast.error("Failed to process your request. Please try again.");
    }
  };

  // Handle verification code submit
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode();
  };

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUserInfo({
        ...userInfo,
        avatar: file,
        avatarUrl: URL.createObjectURL(file)
      });
    }
  };

  return (
    <div className="bg-gray-950 rounded-lg">
      {/* Info message about verification */}
      <div className="bg-blue-900 text-white p-3 rounded-t-lg text-sm">
        <p className="font-bold">Phone Verification</p>
        <p>You will receive a verification code via SMS. Standard message rates may apply.</p>
      </div>

      {step === 1 ? (
        <form onSubmit={handlePhoneSubmit} className="max-w-5xl mx-auto pt-10 px-10 lg:px-0 text-white">
          <div className="border-b border-b-white/10 pb-5">
            <h2 className="text-lg font-semibold uppercase leading-7">
              {isRegistering ? "Registration Form" : "Phone Login"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              {isRegistering
                ? "Please provide your information to create an account. You'll receive a verification code on your phone."
                : "Enter your phone number to receive a verification code."}
            </p>
          </div>

          <div className="border-b border-b-white/10 pb-5">
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              {isRegistering && (
                <>
                  <div className="sm:col-span-3">
                    <Label title="First name" htmlFor="firstName" />
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={userInfo.firstName}
                      onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label title="Last name" htmlFor="lastName" />
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={userInfo.lastName}
                      onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                      required
                    />
                  </div>
                </>
              )}

              <div className={isRegistering ? "sm:col-span-3" : "sm:col-span-6"}>
                <label htmlFor="phoneNumber" className="block text-sm font-medium leading-6 text-white">
                  Phone Number (with country code)
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                  required
                />
                <div className="mt-1 text-xs text-gray-400">
                  Make sure to include the country code (e.g., +91 for India)
                </div>
              </div>

              {isRegistering && (
                <div className="col-span-full">
                  <div className="mt-2 flex items-center gap-x-3">
                    <div className="flex-1">
                      <Label title="Profile Photo (Optional)" />
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-14 h-14 border border-gray-600 rounded-full p-1">
                            {userInfo.avatarUrl ? (
                              <img
                                src={userInfo.avatarUrl}
                                alt="userImage"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <MdPhotoLibrary className="mx-auto h-full w-full text-gray-500" />
                            )}
                          </div>
                          <div className="mt-4 flex items-center mb-1 text-sm leading-6 text-gray-400">
                            <label htmlFor="file-upload">
                              <span className="relative cursor-pointer rounded-md px-2 py-1 bg-gray-900 font-semibold text-gray-200 hover:bg-gray-800">
                                Upload a file
                              </span>
                              <input
                                type="file"
                                name="file-upload"
                                id="file-upload"
                                className="sr-only"
                                onChange={handleAvatarChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs leading-5 text-gray-400">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isRegistering && (
                <>
                  <div className="sm:col-span-6">
                    <h3 className="text-base font-semibold text-white mb-3">Address Information</h3>
                  </div>
                  <div className="sm:col-span-6">
                    <Label title="Address Line 1" htmlFor="addressLine1" />
                    <input
                      type="text"
                      name="addressLine1"
                      id="addressLine1"
                      value={userInfo.address.addressLine1}
                      onChange={(e) => setUserInfo({
                        ...userInfo,
                        address: {...userInfo.address, addressLine1: e.target.value}
                      })}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <Label title="Address Line 2 (Optional)" htmlFor="addressLine2" />
                    <input
                      type="text"
                      name="addressLine2"
                      id="addressLine2"
                      value={userInfo.address.addressLine2}
                      onChange={(e) => setUserInfo({
                        ...userInfo,
                        address: {...userInfo.address, addressLine2: e.target.value}
                      })}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label title="City" htmlFor="city" />
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={userInfo.address.city}
                      onChange={(e) => setUserInfo({
                        ...userInfo,
                        address: {...userInfo.address, city: e.target.value}
                      })}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label title="State / Province" htmlFor="state" />
                    <input
                      type="text"
                      name="state"
                      id="state"
                      value={userInfo.address.state}
                      onChange={(e) => setUserInfo({
                        ...userInfo,
                        address: {...userInfo.address, state: e.target.value}
                      })}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label title="Postal Code" htmlFor="postalCode" />
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      value={userInfo.address.postalCode}
                      onChange={(e) => setUserInfo({
                        ...userInfo,
                        address: {...userInfo.address, postalCode: e.target.value}
                      })}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label title="Country" htmlFor="country" />
                    <select
                      name="country"
                      id="country"
                      value={userInfo.address.country}
                      onChange={(e) => setUserInfo({
                        ...userInfo,
                        address: {...userInfo.address, country: e.target.value}
                      })}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {error && (
            <p className="bg-white/90 text-red-600 text-center py-2 rounded-md tracking-wide font-semibold mt-4">
              {error}
            </p>
          )}

          {/* reCAPTCHA container - positioned before the submit button */}
          <div className="mt-6 mb-4">
            <div className={`p-3 rounded-md mb-3 ${recaptchaVerified ? 'bg-green-900' : 'bg-gray-800'} transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white">
                  <span className="font-bold">Security Check:</span> {recaptchaVerified
                    ? "Completed! You can now proceed."
                    : "Please complete the reCAPTCHA below before proceeding"}
                </p>
                {recaptchaVerified && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div id="recaptcha-container" className="flex justify-center"></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !phoneNumber ||
              !recaptchaVerified || // Disable if reCAPTCHA is not verified
              (isRegistering && (
                !userInfo.firstName ||
                !userInfo.lastName ||
                !userInfo.address.addressLine1 ||
                !userInfo.address.city ||
                !userInfo.address.state ||
                !userInfo.address.postalCode
              ))
            }
            className={`mt-3 w-full py-2 uppercase text-base font-bold tracking-wide text-white rounded-md hover:!bg-white hover:text-red-600 hover:border-2 hover:border-red-600 duration-300 ease-in disabled:bg-gray-500 disabled:hover:bg-gray-500 disabled:hover:text-white disabled:hover:border-transparent
              ${recaptchaVerified ? 'bg-primary animate-pulse' : 'bg-gray-500'}`}
          >
            {loading ? "Sending..." : recaptchaVerified ? "Send Verification Code" : "Complete Security Check Above"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerificationSubmit} className="max-w-5xl mx-auto pt-10 px-10 lg:px-0 text-white">
          <div className="border-b border-b-white/10 pb-5">
            <h2 className="text-lg font-semibold uppercase leading-7">
              Verify Phone Number
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Enter the verification code sent to {phoneNumber}
            </p>
          </div>

          <div className="border-b border-b-white/10 pb-5">
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="verificationCode" className="block text-sm font-medium leading-6 text-white">
                  Verification Code
                </label>
                <input
                  type="text"
                  name="verificationCode"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm sm:leading-6 mt-2"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="bg-white/90 text-red-600 text-center py-2 rounded-md tracking-wide font-semibold mt-4">
              {error}
            </p>
          )}

          <div className="flex gap-4 mt-5">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                // Reset reCAPTCHA state when going back
                setRecaptchaVerified(false);

                // Re-initialize reCAPTCHA
                if (window.recaptchaVerifier) {
                  try {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                  } catch (e) {
                    console.error("Error clearing reCAPTCHA:", e);
                  }
                }

                // Re-initialize after a short delay
                setTimeout(() => {
                  const initializeRecaptcha = () => {
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                      size: 'normal',
                      callback: (response) => {
                        console.log("reCAPTCHA verified:", response);
                        setRecaptchaVerified(true);
                        toast.success("Security check completed! You can now proceed.");
                      },
                      'expired-callback': () => {
                        console.log("reCAPTCHA expired");
                        toast.error("Security check expired. Please solve it again.");
                        setRecaptchaVerified(false);
                      }
                    });

                    try {
                      window.recaptchaVerifier.render();
                    } catch (error) {
                      console.error("Error rendering reCAPTCHA:", error);
                    }
                  };

                  initializeRecaptcha();
                }, 500);
              }}
              className="bg-gray-700 w-1/2 py-2 uppercase text-base font-bold tracking-wide text-white rounded-md hover:bg-gray-600 duration-300 ease-in"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading || !verificationCode}
              className="bg-primary w-1/2 py-2 uppercase text-base font-bold tracking-wide text-white rounded-md hover:!bg-white hover:text-red-600 hover:border-2 hover:border-red-600 duration-300 ease-in disabled:bg-gray-500 disabled:hover:bg-gray-500 disabled:hover:text-white disabled:hover:border-transparent"
            >
              {loading ? "Verifying..." : isRegistering ? "Verify & Complete Registration" : "Verify & Login"}
            </button>
          </div>
        </form>
      )}

      <p className="text-sm leading-6 text-gray-400 text-center py-10">
        {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
            // Reset reCAPTCHA state when switching between login and registration
            setRecaptchaVerified(false);

            // Re-initialize reCAPTCHA
            if (window.recaptchaVerifier) {
              try {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
              } catch (e) {
                console.error("Error clearing reCAPTCHA:", e);
              }
            }

            // Re-initialize after a short delay
            setTimeout(() => {
              const initializeRecaptcha = () => {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                  size: 'normal',
                  callback: (response) => {
                    console.log("reCAPTCHA verified:", response);
                    setRecaptchaVerified(true);
                    toast.success("Security check completed! You can now proceed.");
                  },
                  'expired-callback': () => {
                    console.log("reCAPTCHA expired");
                    toast.error("Security check expired. Please solve it again.");
                    setRecaptchaVerified(false);
                  }
                });

                try {
                  window.recaptchaVerifier.render();
                } catch (error) {
                  console.error("Error rendering reCAPTCHA:", error);
                }
              };

              initializeRecaptcha();
            }, 500);
          }}
          className="text-gray-200 font-semibold underline underline-offset-2 decoration-[1px] hover:text-red-600 duration-300 ease-in"
        >
          {isRegistering ? "Login with Phone" : "Register Now"}
        </button>
      </p>

      {loading && <Loading />}
    </div>
  );
};

export default PhoneAuthProduction;
