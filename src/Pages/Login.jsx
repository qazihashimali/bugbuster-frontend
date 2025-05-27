// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaEyeSlash, FaEye } from "react-icons/fa";

// const Auth = () => {
//   const navigate = useNavigate();
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [roles, setRoles] = useState({ EndUser: false, ServiceProvider: false });
//   const [phone, setPhone] = useState('');
//   const [block, setBlock] = useState('');
//   const [branch, setBranch] = useState('');
//   const [department, setDepartment] = useState('');
//   const [otp, setOtp] = useState('');
//   const [showOtpInput, setShowOtpInput] = useState(false);
//   const [verifiedEmail, setVerifiedEmail] = useState('');
//   const [resendAttempts, setResendAttempts] = useState(0);
//   const [timer, setTimer] = useState(40);
//   const [isTimerActive, setIsTimerActive] = useState(false);
//   const [dropdowns, setDropdowns] = useState({ branches: [], departments: [], blocks: [] });
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');

//   const fetchDropdowns = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/dropdowns', {
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch dropdown data');
//       }

//       const data = await response.json();
//       setDropdowns(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDropdowns();
//   }, []);

//   useEffect(() => {
//     let interval = null;
//     if (isTimerActive && timer > 0) {
//       interval = setInterval(() => {
//         setTimer((prev) => prev - 1);
//       }, 1000);
//     } else if (timer === 0) {
//       setIsTimerActive(false);
//       clearInterval(interval);
//     }
//     return () => clearInterval(interval);
//   }, [isTimerActive, timer]);

//   const handleRoleChange = (role) => {
//     setRoles((prev) => ({ ...prev, [role]: !prev[role] }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       if (isLogin) {
//         const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/login', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email, password }),
//         });

//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message || 'Something went wrong');

//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));
//         navigate('/dashboard', { replace: true });
//       } else if (!showOtpInput) {
//         const selectedRoles = Object.keys(roles).filter((role) => roles[role]);
//         if (selectedRoles.length === 0) {
//           throw new Error('At least one role must be selected');
//         }

//         const body = {
//           name,
//           email,
//           password,
//           roles: selectedRoles,
//           phone: roles.EndUser ? phone : undefined,
//           block: roles.EndUser ? block : undefined,
//           branch: roles.ServiceProvider ? branch : undefined,
//           department: roles.ServiceProvider ? department : undefined,
//         };

//         const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/signup', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(body),
//         });

//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message || 'Something went wrong');

//         setVerifiedEmail(data.email);
//         setResendAttempts(data.resendAttempts || 0);
//         setShowOtpInput(true);
//         setTimer(40);
//         setIsTimerActive(true);
//       } else {
//         const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/verify-otp', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email: verifiedEmail, otp }),
//         });

//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message || 'Something went wrong');

//         setIsLogin(true);
//         setName('');
//         setEmail('');
//         setPassword('');
//         setRoles({ EndUser: false, ServiceProvider: false });
//         setPhone('');
//         setBlock('');
//         setBranch('');
//         setDepartment('');
//         setOtp('');
//         setShowOtpInput(false);
//         setVerifiedEmail('');
//         setResendAttempts(0);
//         setTimer(40);
//         setIsTimerActive(false);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (resendAttempts >= 4) {
//       setError('Maximum OTP resend attempts reached. Please restart signup.');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       const selectedRoles = Object.keys(roles).filter((role) => roles[role]);
//       const body = {
//         name,
//         email: verifiedEmail,
//         password,
//         roles: selectedRoles,
//         phone: roles.EndUser ? phone : undefined,
//         block: roles.EndUser ? block : undefined,
//         branch: roles.ServiceProvider ? branch : undefined,
//         department: roles.ServiceProvider ? department : undefined,
//       };

//       const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || 'Something went wrong');

//       setResendAttempts(data.resendAttempts);
//       setTimer(40);
//       setIsTimerActive(true);
//       setOtp('');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       display: 'flex',
//       height: '100vh',
//       width: '100%',
//       fontFamily: 'Arial, sans-serif',
//       margin: 0,
//       padding: 0,
//       overflow: 'hidden'
//     }}>
//       <div style={{
//         width: '30%',
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         paddingTop: '10px',
//         backgroundColor: '#34076b',
//       }}>
//         <div style={{
//           color: 'white',
//           fontSize: '28px',
//           fontWeight: 'bold',
//           display: 'flex',
//           alignItems: 'center',
//           backgroundColor: '#34076b',
//         }}>
//           <img src="logo (2).png" 
//                alt="Logo" 
//                style={{ width: '100px', height: '40px', marginRight: '60px', marginTop: '10px' }} />
//         </div>
//       </div>

//       <div style={{
//         flex: 1,
//         backgroundColor: '#F2F7F7',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'flex-start',
//         position: 'relative',
//         backgroundRepeat: 'no-repeat',
//         backgroundSize: 'cover',
//         backgroundImage: `url(https://images.pexels.com/photos/840996/pexels-photo-840996.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)`,
//       }}>
//         <div style={{
//           backgroundColor: 'white',
//           borderRadius: '4px',
//           boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)',
//           padding: '30px',
//           width: '320px',
//           position: 'absolute',
//           left: '-180px',
//           top: '50%',
//           transform: 'translateY(-50%)'
//         }}>
//           <h2 style={{
//             fontSize: '17px',
//             fontWeight: '400',
//             color: '#333',
//             marginTop: '5px',
//             marginBottom: '25px'
//           }}>
//             {isLogin ? 'Login to your account' : showOtpInput ? 'Verify OTP' : 'Create your account'}
//           </h2>

//           {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

//           <form onSubmit={handleSubmit}>
//             {!isLogin && !showOtpInput && (
//               <>
//                 <div style={{ marginBottom: '15px' }}>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="Full Name"
//                     style={{
//                       width: '100%',
//                       padding: '10px 12px',
//                       border: '1px solid #E0E0E0',
//                       borderRadius: '3px',
//                       fontSize: '14px',
//                       outline: 'none',
//                       boxSizing: 'border-box'
//                     }}
//                     required
//                   />
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
//                     Select Role(s):
//                   </label>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                     <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
//                       <input
//                         type="checkbox"
//                         checked={roles.EndUser}
//                         onChange={() => handleRoleChange('EndUser')}
//                         style={{ marginRight: '8px' }}
//                       />
//                       End User
//                     </label>
//                     <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
//                       <input
//                         type="checkbox"
//                         checked={roles.ServiceProvider}
//                         onChange={() => handleRoleChange('ServiceProvider')}
//                         style={{ marginRight: '8px' }}
//                       />
//                       Service Provider
//                     </label>
//                   </div>
//                 </div>
//                 {roles.EndUser && (
//                   <>
//                     <div style={{ marginBottom: '15px' }}>
//                       <input
//                         type="tel"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         placeholder="Phone Number"
//                         style={{
//                           width: '100%',
//                           padding: '10px 12px',
//                           border: '1px solid #E0E0E0',
//                           borderRadius: '3px',
//                           fontSize: '14px',
//                           outline: 'none',
//                           boxSizing: 'border-box'
//                         }}
//                         required
//                       />
//                     </div>
//                     <div style={{ marginBottom: '15px' }}>
//                       <select
//                         value={block}
//                         onChange={(e) => setBlock(e.target.value)}
//                         style={{
//                           width: '100%',
//                           padding: '10px 12px',
//                           border: '1px solid #E0E0E0',
//                           borderRadius: '3px',
//                           fontSize: '14px',
//                           outline: 'none',
//                           boxSizing: 'border-box'
//                         }}
//                         required
//                       >
//                         <option value="">Select Block</option>
//                         {dropdowns.blocks.map((block) => (
//                           <option key={block._id} value={block._id}>
//                             {block.blockName} ({block.blockCode})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </>
//                 )}
//                 {roles.ServiceProvider && (
//                   <>
//                     <div style={{ marginBottom: '15px' }}>
//                       <select
//                         value={branch}
//                         onChange={(e) => setBranch(e.target.value)}
//                         style={{
//                           width: '100%',
//                           padding: '10px 12px',
//                           border: '1px solid #E0E0E0',
//                           borderRadius: '3px',
//                           fontSize: '14px',
//                           outline: 'none',
//                           boxSizing: 'border-box'
//                         }}
//                         required
//                       >
//                         <option value="">Select Branch</option>
//                         {dropdowns.branches.map((branch) => (
//                           <option key={branch._id} value={branch._id}>
//                             {branch.branchName} ({branch.branchCode})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div style={{ marginBottom: '15px' }}>
//                       <select
//                         value={department}
//                         onChange={(e) => setDepartment(e.target.value)}
//                         style={{
//                           width: '100%',
//                           padding: '10px 12px',
//                           border: '1px solid #E0E0E0',
//                           borderRadius: '3px',
//                           fontSize: '14px',
//                           outline: 'none',
//                           boxSizing: 'border-box'
//                         }}
//                         required
//                       >
//                         <option value="">Select Department</option>
//                         {dropdowns.departments.map((department) => (
//                           <option key={department._id} value={department._id}>
//                             {department.departmentName} ({department.departmentCode})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </>
//                 )}
//               </>
//             )}

//             {!isLogin && showOtpInput && (
//               <>
//                 <div style={{ marginBottom: '15px' }}>
//                   <input
//                     type="text"
//                     value={otp}
//                     onChange={(e) => {
//                       const value = e.target.value.replace(/\D/g, '');
//                       if (value.length <= 6) setOtp(value);
//                     }}
//                     placeholder="Enter 6-digit OTP"
//                     maxLength="6"
//                     style={{
//                       width: '100%',
//                       padding: '10px 12px',
//                       border: '1px solid #E0E0E0',
//                       borderRadius: '3px',
//                       fontSize: '14px',
//                       outline: 'none',
//                       boxSizing: 'border-box'
//                     }}
//                     required
//                   />
//                 </div>
//                 <div style={{ marginBottom: '15px', textAlign: 'center', fontSize: '14px', color: '#555' }}>
//                   {isTimerActive ? (
//                     `Resend OTP available in ${timer} seconds`
//                   ) : resendAttempts < 4 ? (
//                     <>
//                       Didn't receive OTP?{' '}
//                       <a 
//                         href="#"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           handleResendOTP();
//                         }}
//                         style={{
//                           color: '#34076b',
//                           textDecoration: 'none',
//                           fontWeight: '500',
//                           cursor: isLoading ? 'default' : 'pointer'
//                         }}
//                       >
//                         {isLoading ? 'Sending...' : 'Resend'}
//                       </a>
//                       <div style={{ fontSize: '13px', marginTop: '5px', color: '#777' }}>
//                         Attempts remaining: {4 - resendAttempts}
//                       </div>
//                     </>
//                   ) : (
//                     'Maximum resend attempts reached'
//                   )}
//                 </div>
//               </>
//             )}

//             {(isLogin || !showOtpInput) && (
//               <>
//                 <div style={{ marginBottom: '15px' }}>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter your email"
//                     style={{
//                       width: '100%',
//                       padding: '10px 12px',
//                       border: '1px solid #E0E0E0',
//                       borderRadius: '3px',
//                       fontSize: '14px',
//                       outline: 'none',
//                       boxSizing: 'border-box'
//                     }}
//                     required
//                   />
//                 </div>
//                 <div style={{ marginBottom: '15px', position: 'relative' }}>
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     style={{
//                       width: '100%',
//                       padding: '10px 30px 10px 12px',
//                       border: '1px solid #E0E0E0',
//                       borderRadius: '3px',
//                       fontSize: '14px',
//                       outline: 'none',
//                       boxSizing: 'border-box'
//                     }}
//                     required
//                   />
//                   <span
//                     onClick={() => setShowPassword(!showPassword)}
//                     style={{
//                       position: 'absolute',
//                       right: '10px',
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       cursor: 'pointer',
//                       fontSize: '16px',
//                       color: '#666'
//                     }}
//                   >
//                     {!showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </span>
//                 </div>
//               </>
//             )}

//             <button 
//               type="submit" 
//               style={{
//                 width: '100%',
//                 padding: '10px 12px',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '3px',
//                 fontSize: '14px',
//                 fontWeight: '400',
//                 cursor: 'pointer',
//                 marginBottom: '20px',
//                 backgroundColor: '#34076b'
//               }}
//               disabled={isLoading}
//             >
//               {isLoading 
//                 ? (isLogin ? 'Signing in...' : showOtpInput ? 'Verifying OTP...' : 'Creating account...')
//                 : (isLogin ? 'Login' : showOtpInput ? 'Verify OTP' : 'Sign Up')}
//             </button>

//             <div style={{
//               textAlign: 'center',
//               fontSize: '14px',
//               color: '#555',
//               marginBottom: '16px'
//             }}>
//               {isLogin ? "Don't have an account?" : showOtpInput ? '' : "Already have an account?"}{' '}
//               {!showOtpInput && (
//                 <a 
//                   href="#"
//                   style={{
//                     color: '#333',
//                     textDecoration: 'none'
//                   }}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setIsLogin(!isLogin);
//                     setError('');
//                     setName('');
//                     setEmail('');
//                     setPassword('');
//                     setRoles({ EndUser: false, ServiceProvider: false });
//                     setPhone('');
//                     setBlock('');
//                     setBranch('');
//                     setDepartment('');
//                     setOtp('');
//                     setShowOtpInput(false);
//                     setVerifiedEmail('');
//                     setResendAttempts(0);
//                     setTimer(40);
//                     setIsTimerActive(false);
//                   }}
//                 >
//                   {isLogin ? 'Register' : 'Login'}
//                 </a>
//               )}
//             </div>

//             <div style={{
//               textAlign: 'center',
//               fontSizePa: '12px',
//               color: '#888',
//               marginTop: '20px'
//             }}>
//               By {isLogin ? 'logging in' : 'signing up'}, you agree to our Terms of Service and Privacy Policy
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Auth;


//Login.jsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaEyeSlash, FaEye } from "react-icons/fa";

// const Auth = () => {
//   const navigate = useNavigate();
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [roles, setRoles] = useState({ EndUser: false, ServiceProvider: false });
//   const [phone, setPhone] = useState('');
//   const [block, setBlock] = useState('');
//   const [branch, setBranch] = useState('');
//   const [department, setDepartment] = useState('');
//   const [otp, setOtp] = useState('');
//   const [showOtpInput, setShowOtpInput] = useState(false);
//   const [verifiedEmail, setVerifiedEmail] = useState('');
//   const [resendAttempts, setResendAttempts] = useState(0);
//   const [timer, setTimer] = useState(40);
//   const [isTimerActive, setIsTimerActive] = useState(false);
//   const [dropdowns, setDropdowns] = useState({ branches: [], departments: [], blocks: [] });
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');

//   const fetchDropdowns = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/dropdowns', {
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch dropdown data');
//       }

//       const data = await response.json();
//       setDropdowns(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDropdowns();
//   }, []);

//   useEffect(() => {
//     let interval = null;
//     if (isTimerActive && timer > 0) {
//       interval = setInterval(() => {
//         setTimer((prev) => prev - 1);
//       }, 1000);
//     } else if (timer === 0) {
//       setIsTimerActive(false);
//       clearInterval(interval);
//     }
//     return () => clearInterval(interval);
//   }, [isTimerActive, timer]);

//   const handleRoleChange = (role) => {
//     setRoles((prev) => ({ ...prev, [role]: !prev[role] }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       if (isLogin) {
//         const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/login', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email, password }),
//         });

//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message || 'Something went wrong');

//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));
//         navigate('/dashboard', { replace: true });
//       } else if (!showOtpInput) {
//         const selectedRoles = Object.keys(roles).filter((role) => roles[role]);
//         if (selectedRoles.length === 0) {
//           throw new Error('At least one role must be selected');
//         }

//         const body = {
//           name,
//           email,
//           password,
//           roles: selectedRoles,
//           phone: roles.EndUser ? phone : undefined,
//           block: roles.EndUser ? block : undefined,
//           branch: roles.ServiceProvider ? branch : undefined,
//           department: roles.ServiceProvider ? department : undefined,
//         };

//         const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/signup', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(body),
//         });

//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message || 'Something went wrong');

//         setVerifiedEmail(data.email);
//         setResendAttempts(data.resendAttempts || 0);
//         setShowOtpInput(true);
//         setTimer(40);
//         setIsTimerActive(true);
//       } else {
//         const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/verify-otp', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email: verifiedEmail, otp }),
//         });

//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message || 'Something went wrong');

//         setIsLogin(true);
//         setName('');
//         setEmail('');
//         setPassword('');
//         setRoles({ EndUser: false, ServiceProvider: false });
//         setPhone('');
//         setBlock('');
//         setBranch('');
//         setDepartment('');
//         setOtp('');
//         setShowOtpInput(false);
//         setVerifiedEmail('');
//         setResendAttempts(0);
//         setTimer(40);
//         setIsTimerActive(false);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (resendAttempts >= 4) {
//       setError('Maximum OTP resend attempts reached. Please restart signup.');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       const selectedRoles = Object.keys(roles).filter((role) => roles[role]);
//       const body = {
//         name,
//         email: verifiedEmail,
//         password,
//         roles: selectedRoles,
//         phone: roles.EndUser ? phone : undefined,
//         block: roles.EndUser ? block : undefined,
//         branch: roles.ServiceProvider ? branch : undefined,
//         department: roles.ServiceProvider ? department : undefined,
//       };

//       const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || 'Something went wrong');

//       setResendAttempts(data.resendAttempts);
//       setTimer(40);
//       setIsTimerActive(true);
//       setOtp('');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       display: 'flex',
//       height: '100vh',
//       width: '100%',
//       fontFamily: 'Arial, sans-serif',
//       margin: 0,
//       padding: 0,
//       overflow: 'hidden'
//     }}>
//       <div style={{
//         width: '30%',
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         paddingTop: '10px',
//         backgroundColor: '#34076b',
//       }}>
//         <div style={{
//           color: 'white',
//           fontSize: '28px',
//           fontWeight: 'bold',
//           display: 'flex',
//           alignItems: 'center',
//           backgroundColor: '#34076b',
//         }}>
//           <img src="../../public/logo (2).png" 
//                alt="Logo" 
//                style={{ width: '100px', height: '40px', marginRight: '60px', marginTop: '10px' }} />
//         </div>
//       </div>

//       <div style={{
//         flex: 1,
//         backgroundColor: '#F2F7F7',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'flex-start',
//         position: 'relative',
//         backgroundRepeat: 'no-repeat',
//         backgroundSize: 'cover',
//         backgroundImage: `url(https://images.pexels.com/photos/840996/pexels-photo-840996.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)`,
//       }}>
//         <div style={{
//           backgroundColor: 'white',
//           borderRadius: '4px',
//           boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)',
//           padding: '30px',
//           width: '320px',
//           position: 'absolute',
//           left: '-180px',
//           top: '50%',
//           transform: 'translateY(-50%)'
//         }}>
//           <h2 style={{
//             fontSize: '17px',
//             fontWeight: '400',
//             color: '#333',
//             marginTop: '5px',
//             marginBottom: '25px'
//           }}>
//             {isLogin ? 'Login to your account' : showOtpInput ? 'Verify OTP' : 'Create your account'}
//           </h2>

//           {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

//           <form onSubmit={handleSubmit}>
//             {!isLogin && !showOtpInput && (
//               <>
//                 <div style={{ marginBottom: '15px' }}>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="Full Name"
//                     style={{
//                       width: '100%',
//                       padding: '10px 12px',
//                       border: '1px solid #E0E0E0',
//                       borderRadius: '3px',
//                       fontSize: '14px',
//                       outline: 'none',
//                       boxSizing: 'border-box'
//                     }}
//                     required
//                   />
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                   <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
//                     Select Role(s):
//                   </label>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                     <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
//                       <input
//                         type="checkbox"
//                         checked={roles.EndUser}
//                         onChange={() => handleRoleChange('EndUser')}
//                         style={{ marginRight: '8px' }}
//                       />
//                       End User
//                     </label>
//                     <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
//                       <input
//                         type="checkbox"
//                         checked={roles.ServiceProvider}
//                         onChange={() => handleRoleChange('ServiceProvider')}
//                         style={{ marginRight: '8px' }}
//                       />
//                       Service Provider
//                     </label>
//                   </div>
//                 </div>
//                 {roles.EndUser && (
//                   <>
//                     <div style={{ marginBottom: '15px' }}>
//                       <input
//                         type="tel"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         placeholder="Phone Number"
//                         style={{
//                           width: '100%',
//                           padding: '10px 12px',
//                           border: '1px solid #E0E0E0',
//                           borderRadius: '3px',
//                           fontSize: '14px',
//                           outline: 'none',
//                           boxSizing: 'border-box'
//                         }}
//                         required
//                       />
//                     </div>
//                     <div style={{ marginBottom: '15px' }}>
//                       <select
//                         value={block}
//                         onChange={(e) => setBlock(e.target.value)}
//                         style={{
//                           width: '100%',
//                           padding: '10px 12px',
//                           border: '1px solid #E0E0E0',
//                           borderRadius: '3px',
//                           fontSize: '14px',
//                           outline: 'none',
//                           boxSizing: 'border-box'
//                         }}
//                         required
//                       >
//                         <option value="">Select Block</option>
//                         {dropdowns.blocks.map((block) => (
//                           <option key={block._id} value={block._id}>
//                             {block.blockName} ({block.blockCode})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </>
//                 )}
//                 {roles.ServiceProvider && (
//                   <>
//                     <div style={{ marginBottom: '15px' }}>
//                       <select
//                         value={branch}
//                         onChange={(e) => setBranch(e.target.value)}
//                         style={{
//                           width: '100%',
//                           padding: '10px 12px',
//                           border: '1px solid #E0E0E0',
//                           borderRadius: '3px',
//                           fontSize: '14px',
//                           outline: 'none',
//                           boxSizing: 'border-box'
//                         }}
//                         required
//                       >
//                         <option value="">Select Branch</option>
//                         {dropdowns.branches.map((branch) => (
//                           <option key={branch._id} value={branch._id}>
//                             {branch.branchName} ({branch.branchCode})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div style={{ marginBottom: '15px' }}>
//                       <select
//                         value={department}
//                         onChange={(e) => setDepartment(e.target.value)}
//                         style={{
//                           width: '100%',
//                           padding: '10px 12px',
//                           border: '1px solid #E0E0E0',
//                           borderRadius: '3px',
//                           fontSize: '14px',
//                           outline: 'none',
//                           boxSizing: 'border-box'
//                         }}
//                         required
//                       >
//                         <option value="">Select Department</option>
//                         {dropdowns.departments.map((department) => (
//                           <option key={department._id} value={department._id}>
//                             {department.departmentName} ({department.departmentCode})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </>
//                 )}
//               </>
//             )}

//             {!isLogin && showOtpInput && (
//               <>
//                 <div style={{ marginBottom: '15px' }}>
//                   <input
//                     type="text"
//                     value={otp}
//                     onChange={(e) => {
//                       const value = e.target.value.replace(/\D/g, '');
//                       if (value.length <= 6) setOtp(value);
//                     }}
//                     placeholder="Enter 6-digit OTP"
//                     maxLength="6"
//                     style={{
//                       width: '100%',
//                       padding: '10px 12px',
//                       border: '1px solid #E0E0E0',
//                       borderRadius: '3px',
//                       fontSize: '14px',
//                       outline: 'none',
//                       boxSizing: 'border-box'
//                     }}
//                     required
//                   />
//                 </div>
//                 <div style={{ marginBottom: '15px', textAlign: 'center', fontSize: '14px', color: '#555' }}>
//                   {isTimerActive ? (
//                     `Resend OTP available in ${timer} seconds`
//                   ) : resendAttempts < 4 ? (
//                     <>
//                       Didn't receive OTP?{' '}
//                       <a 
//                         href="#"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           handleResendOTP();
//                         }}
//                         style={{
//                           color: '#34076b',
//                           textDecoration: 'none',
//                           fontWeight: '500',
//                           cursor: isLoading ? 'default' : 'pointer'
//                         }}
//                       >
//                         {isLoading ? 'Sending...' : 'Resend'}
//                       </a>
//                       <div style={{ fontSize: '13px', marginTop: '5px', color: '#777' }}>
//                         Attempts remaining: {4 - resendAttempts}
//                       </div>
//                     </>
//                   ) : (
//                     'Maximum resend attempts reached'
//                   )}
//                 </div>
//               </>
//             )}

//             {(isLogin || !showOtpInput) && (
//               <>
//                 <div style={{ marginBottom: '15px' }}>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter your email"
//                     style={{
//                       width: '100%',
//                       padding: '10px 12px',
//                       border: '1px solid #E0E0E0',
//                       borderRadius: '3px',
//                       fontSize: '14px',
//                       outline: 'none',
//                       boxSizing: 'border-box'
//                     }}
//                     required
//                   />
//                 </div>
//                 <div style={{ marginBottom: '15px', position: 'relative' }}>
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     style={{
//                       width: '100%',
//                       padding: '10px 30px 10px 12px',
//                       border: '1px solid #E0E0E0',
//                       borderRadius: '3px',
//                       fontSize: '14px',
//                       outline: 'none',
//                       boxSizing: 'border-box'
//                     }}
//                     required
//                   />
//                   <span
//                     onClick={() => setShowPassword(!showPassword)}
//                     style={{
//                       position: 'absolute',
//                       right: '10px',
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       cursor: 'pointer',
//                       fontSize: '16px',
//                       color: '#666'
//                     }}
//                   >
//                     {!showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </span>
//                 </div>
//               </>
//             )}

//             <button 
//               type="submit" 
//               style={{
//                 width: '100%',
//                 padding: '10px 12px',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '3px',
//                 fontSize: '14px',
//                 fontWeight: '400',
//                 cursor: 'pointer',
//                 marginBottom: '20px',
//                 backgroundColor: '#34076b'
//               }}
//               disabled={isLoading}
//             >
//               {isLoading 
//                 ? (isLogin ? 'Signing in...' : showOtpInput ? 'Verifying OTP...' : 'Creating account...')
//                 : (isLogin ? 'Login' : showOtpInput ? 'Verify OTP' : 'Sign Up')}
//             </button>

//             <div style={{
//               textAlign: 'center',
//               fontSize: '14px',
//               color: '#555',
//               marginBottom: '16px'
//             }}>
//               {isLogin ? "Don't have an account?" : showOtpInput ? '' : "Already have an account?"}{' '}
//               {!showOtpInput && (
//                 <a 
//                   href="#"
//                   style={{
//                     color: '#333',
//                     textDecoration: 'none'
//                   }}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setIsLogin(!isLogin);
//                     setError('');
//                     setName('');
//                     setEmail('');
//                     setPassword('');
//                     setRoles({ EndUser: false, ServiceProvider: false });
//                     setPhone('');
//                     setBlock('');
//                     setBranch('');
//                     setDepartment('');
//                     setOtp('');
//                     setShowOtpInput(false);
//                     setVerifiedEmail('');
//                     setResendAttempts(0);
//                     setTimer(40);
//                     setIsTimerActive(false);
//                   }}
//                 >
//                   {isLogin ? 'Register' : 'Login'}
//                 </a>
//               )}
//             </div>

//             <div style={{
//               textAlign: 'center',
//               fontSizePa: '12px',
//               color: '#888',
//               marginTop: '20px'
//             }}>
//               By {isLogin ? 'logging in' : 'signing up'}, you agree to our Terms of Service and Privacy Policy
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Auth;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEyeSlash, FaEye } from "react-icons/fa";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [roles, setRoles] = useState({ EndUser: false, ServiceProvider: false });
  const [phone, setPhone] = useState('');
  const [block, setBlock] = useState('');
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [resendAttempts, setResendAttempts] = useState(0);
  const [timer, setTimer] = useState(40);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [dropdowns, setDropdowns] = useState({ branches: [], departments: [], blocks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');

  const fetchDropdowns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/dropdowns', {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dropdown data');
      }

      const data = await response.json();
      setDropdowns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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

  const handleRoleChange = (role) => {
    setRoles((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard', { replace: true });
      } else if (isForgotPassword && !showOtpInput) {
        if (!email) {
          throw new Error('Email is required');
        }
        const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');

        setVerifiedEmail(email); // Store the email used for OTP
        setResendAttempts(data.resendAttempts || 0);
        setShowOtpInput(true);
        setIsResetPassword(true);
        setTimer(40);
        setIsTimerActive(true);
      } else if (isResetPassword && showOtpInput) {
        if (!newPassword) {
          throw new Error('New password is required');
        }
        const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: verifiedEmail, otp, newPassword }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');

        setIsLogin(true);
        setIsForgotPassword(false);
        setIsResetPassword(false);
        setEmail('');
        setPassword('');
        setNewPassword('');
        setOtp('');
        setShowOtpInput(false);
        setVerifiedEmail('');
        setResendAttempts(0);
        setTimer(40);
        setIsTimerActive(false);
      } else if (!showOtpInput) {
        const selectedRoles = Object.keys(roles).filter((role) => roles[role]);
        if (selectedRoles.length === 0) {
          throw new Error('At least one role must be selected');
        }

        const body = {
          name,
          email,
          password,
          roles: selectedRoles,
          phone: roles.EndUser ? phone : undefined,
          block: roles.EndUser ? block : undefined,
          branch: roles.ServiceProvider ? branch : undefined,
          department: roles.ServiceProvider ? department : undefined,
        };

        const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');

        setVerifiedEmail(email);
        setResendAttempts(data.resendAttempts || 0);
        setShowOtpInput(true);
        setTimer(40);
        setIsTimerActive(true);
      } else {
        const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: verifiedEmail, otp }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');

        setIsLogin(true);
        setName('');
        setEmail('');
        setPassword('');
        setRoles({ EndUser: false, ServiceProvider: false });
        setPhone('');
        setBlock('');
        setBranch('');
        setDepartment('');
        setOtp('');
        setShowOtpInput(false);
        setVerifiedEmail('');
        setResendAttempts(0);
        setTimer(40);
        setIsTimerActive(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendAttempts >= 4) {
      setError('Maximum OTP resend attempts reached. Please restart.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://bug-buster-backend.vercel.app/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifiedEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');

      setResendAttempts(data.resendAttempts);
      setTimer(40);
      setIsTimerActive(true);
      setOtp('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        width: '30%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '10px',
        backgroundColor: '#34076b',
      }}>
        <div style={{
          color: 'white',
          fontSize: '28px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#34076b',
        }}>
          <img src="logo (2).png" 
               alt="Logo" 
               style={{ width: '100px', height: '40px', marginRight: '60px', marginTop: '10px' }} />
        </div>
      </div>

      <div style={{
        flex: 1,
        backgroundColor: '#F2F7F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundImage: `url(https://images.pexels.com/photos/840996/pexels-photo-840996.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)`,
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)',
          padding: '30px',
          width: '320px',
          position: 'absolute',
          left: '-180px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}>
          <h2 style={{
            fontSize: '17px',
            fontWeight: '400',
            color: '#333',
            marginTop: '5px',
            marginBottom: '25px'
          }}>
            {isLogin ? 'Login to your account' : 
             isForgotPassword ? (showOtpInput ? 'Reset Password' : 'Forgot Password') : 
             showOtpInput ? 'Verify OTP' : 'Create your account'}
          </h2>

          {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {isForgotPassword && !showOtpInput && (
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '3px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
            )}

            {!isLogin && !isForgotPassword && !showOtpInput && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '3px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                    Select Role(s):
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={roles.EndUser}
                        onChange={() => handleRoleChange('EndUser')}
                        style={{ marginRight: '8px' }}
                      />
                      End User
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={roles.ServiceProvider}
                        onChange={() => handleRoleChange('ServiceProvider')}
                        style={{ marginRight: '8px' }}
                      />
                      Service Provider
                    </label>
                  </div>
                </div>
                {roles.EndUser && (
                  <>
                    <div style={{ marginBottom: '15px' }}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '3px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <select
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '3px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        required
                      >
                        <option value="">Select Block</option>
                        {dropdowns.blocks.map((block) => (
                          <option key={block._id} value={block._id}>
                            {block.blockName} ({block.blockCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {roles.ServiceProvider && (
                  <>
                    <div style={{ marginBottom: '15px' }}>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '3px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
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
                    <div style={{ marginBottom: '15px' }}>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '3px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        required
                      >
                        <option value="">Select Department</option>
                        {dropdowns.departments.map((department) => (
                          <option key={department._id} value={department._id}>
                            {department.departmentName} ({department.departmentCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </>
            )}

            {showOtpInput && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) setOtp(value);
                    }}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '3px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px', textAlign: 'center', fontSize: '14px', color: '#555' }}>
                  {isTimerActive ? (
                    `Resend OTP available in ${timer} seconds`
                  ) : resendAttempts < 4 ? (
                    <>
                      Didn't receive OTP?{' '}
                      <a 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleResendOTP();
                        }}
                        style={{
                          color: '#34076b',
                          textDecoration: 'none',
                          fontWeight: '500',
                          cursor: isLoading ? 'default' : 'pointer'
                        }}
                      >
                        {isLoading ? 'Sending...' : 'Resend'}
                      </a>
                      <div style={{ fontSize: '13px', marginTop: '5px', color: '#777' }}>
                        Attempts remaining: {4 - resendAttempts}
                      </div>
                    </>
                  ) : (
                    'Maximum resend attempts reached'
                  )}
                </div>
              </>
            )}

            {(isLogin || (!isLogin && !isForgotPassword && !showOtpInput)) && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '3px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px', position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '10px 30px 10px 12px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '3px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#666'
                    }}
                  >
                    {!showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </>
            )}

            {isForgotPassword && isResetPassword && showOtpInput && (
              <div style={{ marginBottom: '15px', position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '10px 30px 10px 12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '3px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <span
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#666'
                  }}
                >
                  {!showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            )}

            <button 
              type="submit" 
              style={{
                width: '100%',
                padding: '10px 12px',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '14px',
                fontWeight: '400',
                cursor: 'pointer',
                marginBottom: '20px',
                backgroundColor: '#34076b'
              }}
              disabled={isLoading}
            >
              {isLoading 
                ? (isLogin ? 'Signing in...' : 
                   isForgotPassword ? (showOtpInput ? 'Resetting Password...' : 'Sending OTP...') : 
                   showOtpInput ? 'Verifying OTP...' : 'Creating account...')
                : (isLogin ? 'Login' : 
                   isForgotPassword ? (showOtpInput ? 'Reset Password' : 'Send OTP') : 
                   showOtpInput ? 'Verify OTP' : 'Sign Up')}
            </button>

            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#555',
              marginBottom: '16px'
            }}>
              {isLogin ? (
                <>
                  <div>
                    <a 
                      href="#"
                      style={{
                        color: '#333',
                        textDecoration: 'none'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsForgotPassword(true);
                        setIsLogin(false);
                        setError('');
                        setEmail('');
                        setPassword('');
                        setNewPassword('');
                        setOtp('');
                        setShowOtpInput(false);
                        setVerifiedEmail('');
                        setResendAttempts(0);
                        setTimer(40);
                        setIsTimerActive(false);
                      }}
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    Don't have an account?{' '}
                    <a 
                      href="#"
                      style={{
                        color: '#333',
                        textDecoration: 'none'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsLogin(false);
                        setIsForgotPassword(false);
                        setError('');
                        setEmail('');
                        setPassword('');
                        setNewPassword('');
                        setName('');
                        setRoles({ EndUser: false, ServiceProvider: false });
                        setPhone('');
                        setBlock('');
                        setBranch('');
                        setDepartment('');
                        setOtp('');
                        setShowOtpInput(false);
                        setVerifiedEmail('');
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
                    color: '#333',
                    textDecoration: 'none'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                    setIsForgotPassword(false);
                    setIsResetPassword(false);
                    setError('');
                    setEmail('');
                    setPassword('');
                    setNewPassword('');
                    setOtp('');
                    setShowOtpInput(false);
                    setVerifiedEmail('');
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
                    color: '#333',
                    textDecoration: 'none'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                    setIsForgotPassword(false);
                    setError('');
                    setName('');
                    setEmail('');
                    setPassword('');
                    setNewPassword('');
                    setRoles({ EndUser: false, ServiceProvider: false });
                    setPhone('');
                    setBlock('');
                    setBranch('');
                    setDepartment('');
                    setOtp('');
                    setShowOtpInput(false);
                    setVerifiedEmail('');
                    setResendAttempts(0);
                    setTimer(40);
                    setIsTimerActive(false);
                  }}
                >
                  Login
                </a>
              ) : null}
            </div>

            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#888',
              marginTop: '20px'
            }}>
              By {isLogin ? 'logging in' : isForgotPassword ? 'resetting your password' : 'signing up'}, you agree to our Terms of Service and Privacy Policy
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;