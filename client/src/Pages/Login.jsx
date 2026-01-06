import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
        throw new Error("Failed to fetch dropdown data");
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
        setSuccessMessage("Company Found Successfully");
        setIsCompanyNotFound(false);
      } else {
        results = [];
        setSuccessMessage("");
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
      setSuccessMessage("");
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
      setSuccessMessage("");
      setBranch("");
      setDepartment("");

      // Fetch branches and departments for the selected company
      const data = await upsertCompany(companyName);
      console.log("handleCompanySelect - upsertCompany response:", {
        companyName,
        data,
      });
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
      setSuccessMessage("");
    }
  }, []);

  const handleAddCompany = async () => {
    try {
      const newCompany = await upsertCompany(companySearch, "yes");
      setDropdowns((prev) => ({
        ...prev,
        companies: [...prev.companies, newCompany],
        branches: Array.isArray(newCompany.dropdowns?.branches)
          ? newCompany.dropdowns.branches
          : [],
        departments: Array.isArray(newCompany.dropdowns?.departments)
          ? newCompany.dropdowns.departments
          : [],
      }));
      setCompany(newCompany._id);
      setCompanySearch(newCompany.name);
      setIsCompanyModalOpen(false);
      setCompanyResults([]);
      setIsCompanyNotFound(false);
      setSuccessMessage("");
      setBranch("");
      setDepartment("");
    } catch (err) {
      toast.error(err.message);
    }
  };

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
    setError("");
    setSuccessMessage("");

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
        if (!response.ok) toast.error(data.message || "Something went wrong");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard", { replace: true });
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

        // if (!phone || !branch || !department || !company) {
        //   throw new Error(
        //     "Phone, branch, department, and company are required"
        //   );
        // }

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

        setVerifiedEmail(email);
        setResendAttempts(data.resendAttempts || 0);
        setShowOtpInput(true);
        setTimer(40);
        setIsTimerActive(true);
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
    setError("");
    setSuccessMessage("");

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
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        fontFamily: "Arial, sans-serif",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "30%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "10px",
          backgroundColor: "#34076b",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "28px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            backgroundColor: "#34076b",
          }}
        >
          <img
            src="logo (2).png"
            alt="Logo"
            style={{
              width: "100px",
              height: "40px",
              marginRight: "60px",
              marginTop: "10px",
            }}
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: "#F2F7F7",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundImage: `url(https://images.pexels.com/photos/840996/pexels-photo-840996.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)`,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "4px",
            boxShadow: "0 1px 8px rgba(0, 0, 0, 0.08)",
            padding: "30px",
            width: "320px",
            position: "absolute",
            left: "-180px",
            top: "50%",
            transform: "translateY(-50%)",
            maxHeight: !isLogin ? "500px" : "auto",
            overflowY: !isLogin ? "auto" : "visible",
            scrollbarWidth: !isLogin ? "none" : "auto",
            msOverflowStyle: !isLogin ? "none" : "auto",
          }}
        >
          <style>
            {`
              div[style*="overflow-y: auto"]::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <h2
            style={{
              fontSize: "17px",
              fontWeight: "400",
              color: "#333",
              marginTop: "5px",
              marginBottom: "25px",
            }}
          >
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

          {error && (
            <div
              style={{ color: "red", marginBottom: "15px", fontSize: "14px" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isForgotPassword && !showOtpInput && (
              <div style={{ marginBottom: "15px" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #E0E0E0",
                    borderRadius: "3px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>
            )}

            {!isLogin && !isForgotPassword && !showOtpInput && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #E0E0E0",
                      borderRadius: "3px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <input
                    type="text"
                    value={companySearch}
                    onClick={() => setIsCompanyModalOpen(true)}
                    placeholder="Select Company"
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #E0E0E0",
                      borderRadius: "3px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      backgroundColor: "#f5f5f5",
                      cursor: "pointer",
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    Select Role(s):
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "14px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={roles.EndUser}
                        onChange={() => handleRoleChange("EndUser")}
                        style={{ marginRight: "8px" }}
                      />
                      End User
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "14px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={roles.ServiceProvider}
                        onChange={() => handleRoleChange("ServiceProvider")}
                        style={{ marginRight: "8px" }}
                      />
                      Service Provider
                    </label>
                  </div>
                </div>
                {(roles.EndUser || roles.ServiceProvider) && (
                  <>
                    <div style={{ marginBottom: "15px" }}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #E0E0E0",
                          borderRadius: "3px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #E0E0E0",
                          borderRadius: "3px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        required
                      >
                        <option value="">Select Branch</option>
                        {console.log(
                          "Branch dropdown - company:",
                          company,
                          "branches:",
                          dropdowns.branches
                        )}
                        {dropdowns.branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.branchName} ({branch.branchCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #E0E0E0",
                          borderRadius: "3px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        required
                      >
                        <option value="">Select Department</option>
                        {console.log(
                          "Department dropdown - company:",
                          company,
                          "departments:",
                          dropdowns.departments
                        )}
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
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "4px",
                    width: "300px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {console.log("Company modal - state:", {
                    isCompanyNotFound,
                    companySearch,
                    companyResults,
                  })}
                  <h3
                    style={{
                      fontSize: "16px",
                      marginBottom: "15px",
                      color: "#333",
                    }}
                  >
                    Select or Add Company
                  </h3>
                  {successMessage && (
                    <div
                      style={{
                        color: "green",
                        marginBottom: "15px",
                        fontSize: "14px",
                        textAlign: "center",
                        opacity: successMessage ? 1 : 0,
                        transition: "opacity 0.3s ease-in-out",
                      }}
                    >
                      {successMessage}
                    </div>
                  )}
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setSuccessMessage("");
                      setIsCompanyNotFound(false);
                    }}
                    placeholder="Search company..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #E0E0E0",
                      borderRadius: "3px",
                      fontSize: "14px",
                      marginBottom: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                  {Array.isArray(companyResults) &&
                    companyResults.length > 0 && (
                      <div
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          marginBottom: "15px",
                        }}
                      >
                        {companyResults.map((comp) => (
                          <div
                            key={comp._id}
                            onClick={() => handleCompanySelect(comp.name)}
                            style={{
                              padding: "10px",
                              cursor: "pointer",
                              borderBottom: "1px solid #E0E0E0",
                              fontSize: "14px",
                              color: "#333",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f5f5f5")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "white")
                            }
                          >
                            {comp.name}
                          </div>
                        ))}
                      </div>
                    )}
                  {isCompanyNotFound && companySearch && (
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
                  )}
                  <button
                    onClick={() => {
                      setIsCompanyModalOpen(false);
                      setCompanySearch("");
                      setCompanyResults([]);
                      setIsCompanyNotFound(false);
                      setSuccessMessage("");
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      color: "#333",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #E0E0E0",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e0e0e0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {showOtpInput && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 6) setOtp(value);
                    }}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #E0E0E0",
                      borderRadius: "3px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>
                <div
                  style={{
                    marginBottom: "15px",
                    textAlign: "center",
                    fontSize: "14px",
                    color: "#555",
                  }}
                >
                  {isTimerActive ? (
                    `Resend OTP available in ${timer} seconds`
                  ) : resendAttempts < 4 ? (
                    <>
                      Didn't receive OTP?{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleResendOTP();
                        }}
                        style={{
                          color: "#34076b",
                          textDecoration: "none",
                          fontWeight: "500",
                          cursor: isLoading ? "default" : "pointer",
                        }}
                      >
                        {isLoading ? "Sending..." : "Resend"}
                      </a>
                      <div
                        style={{
                          fontSize: "13px",
                          marginTop: "5px",
                          color: "#777",
                        }}
                      >
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
                <div style={{ marginBottom: "15px" }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #E0E0E0",
                      borderRadius: "3px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "15px", position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: "100%",
                      padding: "10px 30px 10px 12px",
                      border: "1px solid #E0E0E0",
                      borderRadius: "3px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "#666",
                    }}
                  >
                    {!showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </>
            )}

            {isForgotPassword && isResetPassword && showOtpInput && (
              <div style={{ marginBottom: "15px", position: "relative" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: "100%",
                    padding: "10px 30px 10px 12px",
                    border: "1px solid #E0E0E0",
                    borderRadius: "3px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
                <span
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "#666",
                  }}
                >
                  {!showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "18px",
                fontWeight: "400",
                cursor: "pointer",
                marginBottom: "15px",
                backgroundColor: "#34076b",
              }}
              disabled={isLoading}
            >
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
            </button>

            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#555",
                marginBottom: "16px",
              }}
            >
              {isLogin ? (
                <>
                  <div>
                    <a
                      href="#"
                      style={{
                        color: "#333",
                        textDecoration: "none",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsForgotPassword(true);
                        setIsLogin(false);
                        setError("");
                        setSuccessMessage("");
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
                    </a>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    Don't have an account?{" "}
                    <a
                      href="#"
                      style={{
                        color: "#333",
                        textDecoration: "none",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsLogin(false);
                        setIsForgotPassword(false);
                        setError("");
                        setSuccessMessage("");
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
                    </a>
                  </div>
                </>
              ) : isForgotPassword ? (
                <a
                  href="#"
                  style={{
                    color: "#333",
                    textDecoration: "none",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                    setIsForgotPassword(false);
                    setIsResetPassword(false);
                    setError("");
                    setSuccessMessage("");
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
                </a>
              ) : !showOtpInput ? (
                <a
                  href="#"
                  style={{
                    color: "#333",
                    textDecoration: "none",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                    setIsForgotPassword(false);
                    setError("");
                    setSuccessMessage("");
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
                </a>
              ) : null}
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#888",
                marginTop: "20px",
              }}
            >
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
