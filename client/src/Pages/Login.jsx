import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import useDebounce from "../hooks/Debounce";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [roles, setRoles] = useState({
    EndUser: false,
    ServiceProvider: false,
  });
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [company, setCompany] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resendAttempts, setResendAttempts] = useState(0);
  const [timer, setTimer] = useState(40);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    branches: [],
    departments: [],
    blocks: [],
    companies: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [companyResults, setCompanyResults] = useState([]);
  const [isCompanyNotFound, setIsCompanyNotFound] = useState(false);

  const debouncedCompanySearch = useDebounce(companySearch, 500);

  const fetchDropdowns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/dropdowns`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        toast.error("Failed to fetch dropdown data");
      }

      const data = await response.json();
      setDropdowns({
        branches: Array.isArray(data.branches) ? data.branches : [],
        departments: Array.isArray(data.departments) ? data.departments : [],
        blocks: Array.isArray(data.blocks) ? data.blocks : [],
        companies: Array.isArray(data.companies) ? data.companies : [],
      });
    } catch (err) {
      toast.error(err.message);
      setDropdowns({
        branches: [],
        departments: [],
        blocks: [],
        companies: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const upsertCompany = async (name, create) => {
    const payload = { name };
    if (create === "yes") {
      payload.create = create;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/metadata`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      return data;
    } catch (error) {
      toast.error("Failed to fetch dropdown data", error);
    }
  };

  const searchCompanies = useCallback(async (searchTerm) => {
    if (!searchTerm) return;
    try {
      const data = await upsertCompany(searchTerm);
      console.log("searchCompanies - upsertCompany response:", {
        searchTerm,
        data,
      });
      let results = [];
      if (data.message === "Company found successfully" && data.company) {
        results = [data.company].filter(Boolean);
        toast.success("Company found successfully");
        setIsCompanyNotFound(false);
      } else {
        results = [];

        setTimeout(() => setIsCompanyNotFound(true), 100); // Delay to stabilize UI
      }
      setCompanyResults(results);
      setBranch("");
      setDepartment("");
      if (data.dropdowns) {
        setDropdowns((prev) => {
          const newState = {
            ...prev,
            branches: Array.isArray(data.dropdowns.branches)
              ? data.dropdowns.branches
              : [],
            departments: Array.isArray(data.dropdowns.departments)
              ? data.dropdowns.departments
              : [],
          };
          console.log("searchCompanies - Updated dropdowns:", newState);
          return newState;
        });
      }
    } catch (err) {
      toast.error(err.message);

      setCompanyResults([]);
      setIsCompanyNotFound(true);
      setBranch("");
      setDepartment("");
    }
  }, []);

  const handleCompanySelect = useCallback(async (companyName) => {
    try {
      setCompany(companyName);
      setCompanySearch(companyName);
      setIsCompanyModalOpen(false);
      setCompanyResults([]);
      setIsCompanyNotFound(false);

      setBranch("");
      setDepartment("");

      // Fetch branches and departments for the selected company
      const data = await upsertCompany(companyName);

      if (data.dropdowns) {
        setDropdowns((prev) => {
          const newState = {
            ...prev,
            branches: Array.isArray(data.dropdowns.branches)
              ? data.dropdowns.branches
              : [],
            departments: Array.isArray(data.dropdowns.departments)
              ? data.dropdowns.departments
              : [],
          };
          console.log("handleCompanySelect - Updated dropdowns:", newState);
          return newState;
        });
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  // const handleAddCompany = async () => {
  //   try {
  //     const newCompany = await upsertCompany(companySearch, "yes");
  //     setDropdowns((prev) => ({
  //       ...prev,
  //       companies: [...prev.companies, newCompany],
  //       branches: Array.isArray(newCompany.dropdowns?.branches)
  //         ? newCompany.dropdowns.branches
  //         : [],
  //       departments: Array.isArray(newCompany.dropdowns?.departments)
  //         ? newCompany.dropdowns.departments
  //         : [],
  //     }));
  //     setCompany(newCompany._id);
  //     setCompanySearch(newCompany.name);
  //     setIsCompanyModalOpen(false);
  //     setCompanyResults([]);
  //     setIsCompanyNotFound(false);
  //     setSuccessMessage("");
  //     setBranch("");
  //     setDepartment("");
  //   } catch (err) {
  //     toast.error(err.message);
  //   }
  // };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  useEffect(() => {
    searchCompanies(debouncedCompanySearch);
  }, [debouncedCompanySearch, searchCompanies]);

  const handleRoleChange = (role) => {
    setRoles((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          toast.error(data.message || "Something went wrong");
        }
        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          toast.success(`Welcome back, ${data?.user?.name}!`);
          navigate("/dashboard", { replace: true });
        }
      } else if (isForgotPassword && !showOtpInput) {
        if (!email) {
          toast.error("Email is required");
        }
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();
        if (!response.ok) toast.error(data.message || "Something went wrong");

        setVerifiedEmail(email);
        setResendAttempts(data.resendAttempts || 0);
        setShowOtpInput(true);
        setIsResetPassword(true);
        setTimer(40);
        setIsTimerActive(true);
      } else if (isResetPassword && showOtpInput) {
        if (!newPassword) {
          toast.error("New password is required");
        }
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: verifiedEmail, otp, newPassword }),
          }
        );

        const data = await response.json();
        if (!response.ok) toast.error(data.message || "Something went wrong");

        setIsLogin(true);
        setIsForgotPassword(false);
        setIsResetPassword(false);
        setEmail("");
        setPassword("");
        setNewPassword("");
        setOtp("");
        setShowOtpInput(false);
        setVerifiedEmail("");
        setResendAttempts(0);
        setTimer(40);
        setIsTimerActive(false);
      } else if (!showOtpInput) {
        const selectedRoles = Object.keys(roles).filter((role) => roles[role]);
        if (selectedRoles.length === 0) {
          toast.error("At least one role must be selected");
        }

        const body = {
          name,
          email,
          password,
          roles: selectedRoles,
          phone,
          branch,
          department,
          company,
        };

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        const data = await response.json();
        if (!response.ok) toast.error(data.message || "Something went wrong");

        if (data && data.email) {
          setVerifiedEmail(email);
          setResendAttempts(data.resendAttempts || 0);
          setShowOtpInput(true);
          setTimer(40);
          setIsTimerActive(true);
        }
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: verifiedEmail, otp }),
          }
        );

        const data = await response.json();
        if (!response.ok) toast.error(data.message || "Something went wrong");

        setIsLogin(true);
        setName("");
        setEmail("");
        setPassword("");
        setRoles({ EndUser: false, ServiceProvider: false });
        setPhone("");
        setBranch("");
        setDepartment("");
        setCompany("");
        setOtp("");
        setShowOtpInput(false);
        setVerifiedEmail("");
        setResendAttempts(0);
        setTimer(40);
        setIsTimerActive(false);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendAttempts >= 4) {
      toast.error("Maximum OTP resend attempts reached. Please restart.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: verifiedEmail }),
        }
      );

      const data = await response.json();
      if (!response.ok) toast.error(data.message || "Something went wrong");

      setResendAttempts(data.resendAttempts);
      setTimer(40);
      setIsTimerActive(true);
      setOtp("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans m-0 p-0 overflow-hidden">
      <div className="w-[30%] flex flex-col items-center pt-[10px] bg-[#34076b]">
        <div className="text-white text-[28px] font-bold flex items-center bg-[#34076b]">
          <img
            src="/logo2.png"
            alt="Logo"
            className="w-[100px] h-[40px] mr-[60px] mt-[10px]"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center bg-[url('/login_img.jpg')] justify-start relative bg-[#F2F7F7] bg-no-repeat bg-cover">
        <div
          className={`
          bg-white 
          rounded 
          shadow-[0_1px_8px_rgba(0,0,0,0.08)] 
          p-[30px] 
          w-[320px] 
          absolute 
          -left-[180px] 
          top-1/2 
          -translate-y-1/2
          ${!isLogin ? "max-h-[500px] overflow-y-auto no-scrollbar" : ""}
        `}
        >
          <h2 className="text-[17px] font-normal text-[#333] mt-[5px] mb-[25px]">
            {isLogin
              ? "Login to your account"
              : isForgotPassword
              ? showOtpInput
                ? "Reset Password"
                : "Forgot Password"
              : showOtpInput
              ? "Verify OTP"
              : "Create your account"}
          </h2>

          <form onSubmit={handleSubmit}>
            {isForgotPassword && !showOtpInput && (
              <div className="mb-[15px]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                  required
                />
              </div>
            )}

            {!isLogin && !isForgotPassword && !showOtpInput && (
              <>
                <div className="mb-[15px]">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                    required
                  />
                </div>
                <div className="mb-[15px]">
                  <input
                    type="text"
                    value={companySearch}
                    onClick={() => setIsCompanyModalOpen(true)}
                    placeholder="Select Company"
                    readOnly
                    className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border bg-[#f5f5f5] cursor-pointer"
                    required
                  />
                </div>
                <div className="mb-[15px]">
                  <label className="block mb-[5px] text-[14px] text-[#333]">
                    Select Role(s):
                  </label>
                  <div className="flex flex-col gap-[10px]">
                    <label className="flex items-center text-[14px]">
                      <input
                        type="checkbox"
                        checked={roles.EndUser}
                        onChange={() => handleRoleChange("EndUser")}
                        className="mr-2"
                      />
                      End User
                    </label>
                    <label className="flex items-center text-[14px]">
                      <input
                        type="checkbox"
                        checked={roles.ServiceProvider}
                        onChange={() => handleRoleChange("ServiceProvider")}
                        className="mr-2"
                      />
                      Service Provider
                    </label>
                  </div>
                </div>
                {(roles.EndUser || roles.ServiceProvider) && (
                  <>
                    <div className="mb-[15px]">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                        required
                      />
                    </div>
                    <div className="mb-[15px]">
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                        required
                      >
                        <option value="">Select Branch</option>

                        {dropdowns.branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.branchName} ({branch.branchCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-[15px]">
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                        required
                      >
                        <option value="">Select Department</option>

                        {dropdowns.departments.map((department) => (
                          <option key={department._id} value={department._id}>
                            {department.departmentName} (
                            {department.departmentCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </>
            )}

            {isCompanyModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
                <div className="bg-white p-[20px] rounded-[4px] w-[300px] max-h-[400px] overflow-y-auto">
                  {console.log("Company modal - state:", {
                    isCompanyNotFound,
                    companySearch,
                    companyResults,
                  })}
                  <h3 className="text-[16px] font-semibold mb-[15px] text-[#333]">
                    Select or Add Company
                  </h3>

                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);

                      setIsCompanyNotFound(false);
                    }}
                    placeholder="Search company..."
                    className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                  />
                  {Array.isArray(companyResults) &&
                    companyResults.length > 0 && (
                      <div className="max-h-[200px] overflow-y-auto mb-[15px]">
                        {companyResults.map((comp) => (
                          <div
                            key={comp._id}
                            onClick={() => handleCompanySelect(comp.name)}
                            className="p-[10px] cursor-pointer border-b border-[#E0E0E0] text-[14px] text-[#333] transition-colors duration-200 hover:bg-[#f5f5f5]"
                          >
                            {comp.name}
                          </div>
                        ))}
                      </div>
                    )}
                  {isCompanyNotFound && (
                    <p className="text-red-500 text-xs mb-4">
                      Company not found.Contact Bugbuster Admin!
                    </p>
                  )}
                  {/* {isCompanyNotFound && companySearch && (
                    <div
                      style={{
                        marginBottom: "15px",
                        opacity: isCompanyNotFound ? 1 : 0,
                        transition: "opacity 0.3s ease-in-out",
                      }}
                    >
                      <div
                        style={{
                          color: "red",
                          fontSize: "14px",
                          marginBottom: "10px",
                          textAlign: "center",
                        }}
                      >
                        Company not found. Please add company.
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCompany}
                        style={{
                          width: "100%",
                          padding: "10px",
                          color: "white",
                          backgroundColor: "#34076b",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#2a0557")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#34076b")
                        }
                      >
                        Add Company: {companySearch}
                      </button>
                    </div>
                  )} */}
                  <button
                    onClick={() => {
                      setIsCompanyModalOpen(false);
                      setCompanySearch("");
                      setCompanyResults([]);
                      setIsCompanyNotFound(false);
                    }}
                    className="w-full p-[10px] text-[#333] bg-[#f5f5f5] border border-[#E0E0E0] rounded-md text-[14px] cursor-pointer transition-colors duration-200 hover:bg-[#e0e0e0]"
                  >
                    {companySearch &&
                    companyResults.length === 0 &&
                    !isCompanyNotFound
                      ? "Searching..."
                      : "Cancel"}
                  </button>
                </div>
              </div>
            )}

            {showOtpInput && (
              <>
                <div className="mb-[15px]">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 6) setOtp(value);
                    }}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                    required
                  />
                </div>
                <div className="mb-[15px] text-center text-[14px] text-[#555]">
                  {isTimerActive ? (
                    `Resend OTP available in ${timer} seconds`
                  ) : resendAttempts < 4 ? (
                    <>
                      Didn't receive OTP?{" "}
                      <Link
                        to={"#"}
                        onClick={(e) => {
                          e.preventDefault();
                          handleResendOTP();
                        }}
                        className="text-[#34076b] cursor-pointer"
                      >
                        {isLoading ? "Sending..." : "Resend"}
                      </Link>
                      <div className="text-[13px] mt-[5px] text-[#777] ">
                        Attempts remaining: {4 - resendAttempts}
                      </div>
                    </>
                  ) : (
                    "Maximum resend attempts reached"
                  )}
                </div>
              </>
            )}

            {(isLogin || (!isLogin && !isForgotPassword && !showOtpInput)) && (
              <>
                <div className="mb-[15px]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                    required
                  />
                </div>
                <div className="mb-[15px] relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[10px] top-[50%] transform -translate-y-1/2 cursor-pointer text-[16px] text-[#666]"
                  >
                    {!showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </>
            )}

            {isForgotPassword && isResetPassword && showOtpInput && (
              <div className="mb-[15px] relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-[12px] py-[10px] border border-[#E0E0E0] rounded-[3px] text-[14px] outline-none box-border"
                  required
                />
                <span
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-[10px] top-[50%] transform -translate-y-1/2 cursor-pointer text-[16px] text-[#666]"
                >
                  {!showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full p-[10px] text-white rounded-md cursor-pointer bg-[#34076b] text-[18px]  mb-[15px] flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}

              <span>
                {isLoading
                  ? isLogin
                    ? "Signing in..."
                    : isForgotPassword
                    ? showOtpInput
                      ? "Resetting Password..."
                      : "Sending OTP..."
                    : showOtpInput
                    ? "Verifying OTP..."
                    : "Creating account..."
                  : isLogin
                  ? "Continue"
                  : isForgotPassword
                  ? showOtpInput
                    ? "Reset Password"
                    : "Send OTP"
                  : showOtpInput
                  ? "Verify OTP"
                  : "Continue"}
              </span>
            </button>

            <div className="text-center text-[14px] text-[#555] mb-[15px]">
              {isLogin ? (
                <>
                  <div>
                    <Link
                      to={"#"}
                      className="text-[#333] no-underline"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsForgotPassword(true);
                        setIsLogin(false);

                        setEmail("");
                        setPassword("");
                        setNewPassword("");
                        setOtp("");
                        setShowOtpInput(false);
                        setVerifiedEmail("");
                        setResendAttempts(0);
                        setTimer(40);
                        setIsTimerActive(false);
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="mt-[10px]">
                    Don't have an account?{" "}
                    <Link
                      to={"#"}
                      className="text-[#333] no-underline"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsLogin(false);
                        setIsForgotPassword(false);

                        setEmail("");
                        setPassword("");
                        setNewPassword("");
                        setName("");
                        setRoles({ EndUser: false, ServiceProvider: false });
                        setPhone("");
                        setBranch("");
                        setDepartment("");
                        setCompany("");
                        setOtp("");
                        setShowOtpInput(false);
                        setVerifiedEmail("");
                        setResendAttempts(0);
                        setTimer(40);
                        setIsTimerActive(false);
                      }}
                    >
                      Register
                    </Link>
                  </div>
                </>
              ) : isForgotPassword ? (
                <Link
                  to={"#"}
                  className="text-[#333] no-underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                    setIsForgotPassword(false);
                    setIsResetPassword(false);

                    setEmail("");
                    setPassword("");
                    setNewPassword("");
                    setOtp("");
                    setShowOtpInput(false);
                    setVerifiedEmail("");
                    setResendAttempts(0);
                    setTimer(40);
                    setIsTimerActive(false);
                  }}
                >
                  Back to Login
                </Link>
              ) : !showOtpInput ? (
                <Link
                  to={"#"}
                  className="text-[#333] no-underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                    setIsForgotPassword(false);

                    setName("");
                    setEmail("");
                    setPassword("");
                    setNewPassword("");
                    setRoles({ EndUser: false, ServiceProvider: false });
                    setPhone("");
                    setBranch("");
                    setDepartment("");
                    setCompany("");
                    setOtp("");
                    setShowOtpInput(false);
                    setVerifiedEmail("");
                    setResendAttempts(0);
                    setTimer(40);
                    setIsTimerActive(false);
                  }}
                >
                  Login
                </Link>
              ) : null}
            </div>

            <div className="text-center text-[12px] text-[#888] mt-[20px]">
              By{" "}
              {isLogin
                ? "logging in"
                : isForgotPassword
                ? "resetting your password"
                : "signing up"}
              , you agree to our Terms of Service and Privacy Policy
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
