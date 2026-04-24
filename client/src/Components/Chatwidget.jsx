// // ChatWidget.jsx — Peer-to-peer live chat with Socket.IO
// // Props: userId, userName, token, socketUrl, apiBase
// //
// // 3 views:
// //   "home"  → list of existing conversations + "New Chat" button
// //   "users" → pick any user to start / resume a conversation
// //   "chat"  → the message thread
// //
// // Endpoints used:
// //   GET  /api/chat/conversations          → list conversations
// //   POST /api/chat/conversations          → create conversation  { participantId }
// //   GET  /api/chat/messages/:convId       → messages in conversation
// //   POST /api/chat/send                   → send message  { conversationId, content }
// //   PUT  /api/chat/read/:convId           → mark as read
// //   DELETE /api/chat/message/:messageId   → delete message
// //   GET  /api/users                       → all users (for picker)

// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import { io } from "socket.io-client";
// import toast from "react-hot-toast";
// import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
// import { IoIosClose, IoIosSearch, IoIosSend } from "react-icons/io";
// import { GrFormPrevious } from "react-icons/gr";
// import { FaPlus, FaUser } from "react-icons/fa";
// import { FaRegTrashCan } from "react-icons/fa6";

// // ─── Inline Icons ─────────────────────────────────────────────────────────────
// const Ic = {
//   Chat: () => <IoChatbubbleEllipsesOutline />,
//   Close: () => <IoIosClose />,
//   Send: () => <IoIosSend />,
//   Back: () => <GrFormPrevious />,
//   Plus: () => <FaPlus />,
//   Search: () => <IoIosSearch />,
//   Trash: () => <FaRegTrashCan />,
//   Users: () => <FaUser />,
// };

// // ─── Helpers ─────────────────────────────────────────────────────────────────
// const fmtTime = (iso) => {
//   if (!iso) return "";
//   return new Date(iso).toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };
// const fmtDate = (iso) => {
//   if (!iso) return "";
//   const d = new Date(iso);
//   const today = new Date();
//   if (d.toDateString() === today.toDateString()) return "Today";
//   const yest = new Date(today);
//   yest.setDate(today.getDate() - 1);
//   if (d.toDateString() === yest.toDateString()) return "Yesterday";
//   return d.toLocaleDateString([], { month: "short", day: "numeric" });
// };
// const getInitials = (name = "") =>
//   name
//     .split(" ")
//     .slice(0, 2)
//     .map((w) => w[0])
//     .join("")
//     .toUpperCase() || "?";

// // ─── Avatar ───────────────────────────────────────────────────────────────────
// const GRADIENTS = [
//   ["#6366f1", "#8b5cf6"],
//   ["#0ea5e9", "#06b6d4"],
//   ["#10b981", "#14b8a6"],
//   ["#f59e0b", "#ef4444"],
//   ["#ec4899", "#f43f5e"],
//   ["#8b5cf6", "#6366f1"],
// ];

// const Avatar = ({ name = "", size = 36, showOnline = false }) => {
//   const [a, b] = GRADIENTS[(name.charCodeAt(0) || 0) % GRADIENTS.length];
//   return (
//     <div
//       className="relative flex-shrink-0"
//       style={{ width: size, height: size }}
//     >
//       <div
//         className="rounded-full flex items-center justify-center font-bold text-white select-none"
//         style={{
//           width: size,
//           height: size,
//           background: `linear-gradient(135deg, ${a}, ${b})`,
//           fontSize: Math.round(size * 0.36),
//         }}
//       >
//         {getInitials(name)}
//       </div>
//       {showOnline && (
//         <span
//           className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-emerald-400"
//           style={{ width: size * 0.28, height: size * 0.28 }}
//         />
//       )}
//     </div>
//   );
// };

// // ─── Skeleton ─────────────────────────────────────────────────────────────────
// const Skeleton = ({ rows = 4 }) => (
//   <div>
//     {Array.from({ length: rows }).map((_, i) => (
//       <div
//         key={i}
//         className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 animate-pulse"
//       >
//         <div
//           className="rounded-full bg-slate-200 flex-shrink-0"
//           style={{ width: 40, height: 40 }}
//         />
//         <div className="flex-1 space-y-2">
//           <div className="h-3 bg-slate-200 rounded w-3/5" />
//           <div className="h-2 bg-slate-200 rounded w-2/5" />
//         </div>
//       </div>
//     ))}
//   </div>
// );

// // ─── Typing indicator ─────────────────────────────────────────────────────────
// const TypingDots = ({ name }) => (
//   <div className="flex items-center gap-2 mb-3">
//     <div className="flex gap-[3px]">
//       {[0, 1, 2].map((i) => (
//         <span
//           key={i}
//           className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
//           style={{ animationDelay: `${i * 0.18}s` }}
//         />
//       ))}
//     </div>
//     <span className="text-[11px] text-slate-400">{name} is typing…</span>
//   </div>
// );

// // ─── Date separator ───────────────────────────────────────────────────────────
// const DateSep = ({ label }) => (
//   <div className="flex items-center gap-3 my-5">
//     <div className="flex-1 h-px bg-slate-100" />
//     <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
//       {label}
//     </span>
//     <div className="flex-1 h-px bg-slate-100" />
//   </div>
// );

// // ─── Message bubble ───────────────────────────────────────────────────────────
// const Bubble = ({ msg, isMine, onDelete }) => {
//   const [hovered, setHovered] = useState(false);
//   return (
//     <div
//       className={`flex gap-2 mb-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       {!isMine && <Avatar name={msg.sender?.name} size={28} />}
//       <div
//         className={`flex flex-col max-w-[72%] ${
//           isMine ? "items-end" : "items-start"
//         }`}
//       >
//         {!isMine && (
//           <span className="text-[10px] text-slate-400 mb-1 ml-1">
//             {msg.sender?.name}
//           </span>
//         )}
//         <div className="relative">
//           <div
//             className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
//               isMine
//                 ? "text-white rounded-tr-sm"
//                 : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-sm"
//             }`}
//             style={
//               isMine
//                 ? {
//                     background: "linear-gradient(135deg, #6366f1, #7c3aed)",
//                     boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
//                   }
//                 : {}
//             }
//           >
//             {msg.text}
//           </div>
//           {isMine && hovered && (
//             <button
//               onClick={() => onDelete(msg._id)}
//               className="absolute cursor-pointer -left-5 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 transition"
//               title="Delete"
//             >
//               <Ic.Trash />
//             </button>
//           )}
//         </div>
//         <span className="text-[10px] text-slate-400 mt-1 mx-1">
//           {fmtTime(msg.createdAt)}
//         </span>
//       </div>
//     </div>
//   );
// };

// // ─── Conversation row ─────────────────────────────────────────────────────────
// const ConvRow = ({ conv, userId, isActive, onClick }) => {
//   const partner = conv.participants?.find((p) => p._id !== userId) || {};
//   const last = conv.lastMessage;
//   const unread = conv.unreadCount || 0;
//   return (
//     <button
//       onClick={onClick}
//       className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-left border-b border-slate-100 ${
//         isActive ? "bg-indigo-50 border-l-[3px] border-l-indigo-500" : ""
//       }`}
//     >
//       <Avatar name={partner.name} size={42} showOnline />
//       <div className="flex-1 min-w-0">
//         <div className="flex justify-between items-baseline gap-1">
//           <span
//             className={`text-sm font-semibold truncate ${
//               isActive ? "text-indigo-700" : "text-slate-800"
//             }`}
//           >
//             {partner.name || "User"}
//           </span>
//           <span className="text-[10px] text-slate-400 flex-shrink-0">
//             {last?.createdAt ? fmtTime(last.createdAt) : ""}
//           </span>
//         </div>
//         <div className="flex justify-between items-center gap-1">
//           <p className="text-xs text-slate-500 truncate">
//             {last
//               ? last.sender?._id === userId
//                 ? `You: ${last.text}`
//                 : last.text
//               : "Tap to start chatting"}
//           </p>
//           {unread > 0 && (
//             <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
//               {unread > 99 ? "99+" : unread}
//             </span>
//           )}
//         </div>
//       </div>
//     </button>
//   );
// };

// // ─── User row ─────────────────────────────────────────────────────────────────
// const UserRow = ({ user, hasConv, onClick, loading }) => (
//   <button
//     onClick={onClick}
//     disabled={loading}
//     className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-left border-b border-slate-100 disabled:opacity-60"
//   >
//     <Avatar name={user.name} size={42} />
//     <div className="flex-1 min-w-0">
//       <p className="text-sm font-semibold text-slate-800 truncate">
//         {user.name}
//       </p>
//       <p className="text-xs text-slate-400 truncate">
//         {user.email || user.role || ""}
//       </p>
//     </div>
//     {loading ? (
//       <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
//     ) : (
//       <span
//         className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
//           hasConv
//             ? "bg-indigo-100 text-indigo-600 border border-indigo-200"
//             : "bg-slate-100 text-slate-500"
//         }`}
//       >
//         {hasConv ? "Resume" : "Message"}
//       </span>
//     )}
//   </button>
// );

// // ─── Panel header ─────────────────────────────────────────────────────────────
// const PanelHeader = ({ children }) => (
//   <div
//     className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
//     style={{ background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)" }}
//   >
//     {children}
//   </div>
// );

// // ─── Search bar ───────────────────────────────────────────────────────────────
// const SearchBar = ({ value, onChange, placeholder, autoFocus }) => (
//   <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex-shrink-0">
//     <div className="relative">
//       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
//         <Ic.Search />
//       </span>
//       <input
//         type="text"
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         autoFocus={autoFocus}
//         className="w-full pl-8 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
//       />
//     </div>
//   </div>
// );

// // ══════════════════════════════════════════════════════════════════════════════
// //  MAIN ChatWidget
// // ══════════════════════════════════════════════════════════════════════════════
// const ChatWidget = ({ userId, userName, token, socketUrl, apiBase }) => {
//   const [open, setOpen] = useState(false);
//   const [view, setView] = useState("home"); // "home" | "users" | "chat"
//   const [unreadTotal, setUnreadTotal] = useState(0);

//   const [conversations, setConversations] = useState([]);
//   const [activeConv, setActiveConv] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [typingUser, setTypingUser] = useState(null);

//   const [allUsers, setAllUsers] = useState([]);
//   const [userSearch, setUserSearch] = useState("");
//   const [convSearch, setConvSearch] = useState("");
//   const [creatingFor, setCreatingFor] = useState(null); // userId being created
//   const [receiver, setReceiver] = useState(null);

//   const [text, setText] = useState("");

//   const [loadingConvs, setLoadingConvs] = useState(false);
//   const [loadingMsgs, setLoadingMsgs] = useState(false);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [sending, setSending] = useState(false);

//   const socketRef = useRef(null);
//   const bottomRef = useRef(null);
//   const inputRef = useRef(null);
//   const typingTimerRef = useRef(null);

//   const headers = useMemo(
//     () => ({
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     }),
//     [token]
//   );

//   // ── Socket setup ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!userId || !token || !socketUrl) return;
//     const socket = io(socketUrl, {
//       auth: { token },
//       transports: ["websocket", "polling"],
//     });
//     socketRef.current = socket;

//     socket.on("newMessage", (msg) => {
//       setMessages((prev) =>
//         prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
//       );
//       setConversations((prev) =>
//         prev.map((c) =>
//           c._id === msg.conversationId
//             ? {
//                 ...c,
//                 lastMessage: msg,
//                 unreadCount:
//                   msg.sender?._id !== userId
//                     ? (c.unreadCount || 0) + 1
//                     : c.unreadCount,
//               }
//             : c
//         )
//       );
//       if (msg.sender?._id !== userId) setUnreadTotal((n) => n + 1);
//     });

//     socket.on("typing", ({ userId: tid, name }) => {
//       if (tid !== userId) {
//         setTypingUser(name);
//         clearTimeout(typingTimerRef.current);
//         typingTimerRef.current = setTimeout(() => setTypingUser(null), 2500);
//       }
//     });
//     socket.on("stopTyping", () => setTypingUser(null));
//     socket.on("messageDeleted", ({ messageId }) =>
//       setMessages((prev) => prev.filter((m) => m._id !== messageId))
//     );

//     return () => {
//       socket.disconnect();
//       clearTimeout(typingTimerRef.current);
//     };
//   }, [userId, token, socketUrl]);

//   useEffect(() => {
//     if (activeConv?._id && socketRef.current) {
//       socketRef.current.emit("joinConversation", {
//         conversationId: activeConv._id,
//       });
//     }
//   }, [activeConv]);

//   useEffect(() => {
//     if (messages.length)
//       setTimeout(
//         () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
//         60
//       );
//   }, [messages]);

//   // ── Fetch conversations ─────────────────────────────────────────────────
//   const fetchConvs = useCallback(async () => {
//     setLoadingConvs(true);
//     try {
//       const res = await fetch(`${apiBase}/api/chat/conversations`, { headers });
//       if (!res.ok) throw new Error("Failed");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.conversations || [];
//       setConversations(list);
//       setUnreadTotal(list.reduce((a, c) => a + (c.unreadCount || 0), 0));
//     } catch {
//       toast.error("Could not load conversations");
//     } finally {
//       setLoadingConvs(false);
//     }
//   }, [apiBase, headers]);

//   useEffect(() => {
//     if (open) fetchConvs();
//   }, [open, fetchConvs]);

//   // ── Fetch all users ──────────────────────────────────────────────────────
//   // ⚠️  Adjust endpoint to match your API (e.g. /api/users, /api/auth/users, etc.)
//   const fetchUsers = useCallback(async () => {
//     setLoadingUsers(true);
//     try {
//       const res = await fetch(`${apiBase}/api/auth/users`, { headers });
//       if (!res.ok) throw new Error("Failed");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.users || [];
//       setAllUsers(list.filter((u) => u._id !== userId));
//     } catch {
//       toast.error("Could not load users");
//     } finally {
//       setLoadingUsers(false);
//     }
//   }, [apiBase, headers, userId]);

//   // ── Fetch messages ──────────────────────────────────────────────────────
//   const fetchMsgs = useCallback(
//     async (convId) => {
//       setLoadingMsgs(true);
//       try {
//         const res = await fetch(`${apiBase}/api/chat/messages/${convId}`, {
//           headers,
//         });
//         if (!res.ok) throw new Error("Failed");
//         const data = await res.json();
//         setMessages(
//           Array.isArray(data) ? data : data.data || data.messages || []
//         );
//       } catch {
//         toast.error("Could not load messages");
//       } finally {
//         setLoadingMsgs(false);
//       }
//     },
//     [apiBase, headers]
//   );

//   // ── Mark as read ────────────────────────────────────────────────────────
//   const markRead = useCallback(
//     async (conv) => {
//       if (!conv?.unreadCount) return;
//       try {
//         await fetch(`${apiBase}/api/chat/read/${conv._id}`, {
//           method: "PUT",
//           headers,
//         });
//         setConversations((prev) =>
//           prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
//         );
//         setUnreadTotal((n) => Math.max(0, n - (conv.unreadCount || 0)));
//       } catch (error) {
//         console.error(error);
//       }
//     },
//     [apiBase, headers]
//   );

//   // ── Open conversation ───────────────────────────────────────────────────
//   const openConv = useCallback(
//     (conv) => {
//       setActiveConv(conv);
//       setMessages([]);
//       setTypingUser(null);
//       setView("chat");
//       fetchMsgs(conv._id);
//       markRead(conv);
//       setTimeout(() => inputRef.current?.focus(), 200);
//     },
//     [fetchMsgs, markRead]
//   );

//   // ── Start or resume conversation with a user ────────────────────────────
//   const startWith = useCallback(
//     async (targetUser) => {
//       // check existing
//       const existing = conversations.find((c) =>
//         c.participants?.some((p) => p._id === targetUser._id)
//       );
//       if (existing) {
//         openConv(existing);
//         return;
//       }
//       // create new
//       setCreatingFor(targetUser._id);
//       try {
//         const res = await fetch(`${apiBase}/api/chat/conversations`, {
//           method: "POST",
//           headers,
//           body: JSON.stringify({ receiverId: targetUser._id }),
//         });
//         if (!res.ok) throw new Error("Could not start conversation");
//         const response = await res.json();
//         const conv = response.data;
//         // ensure participants are populated locally
//         if (!conv.participants) {
//           conv.participants = [
//             { _id: userId, name: userName },
//             {
//               _id: targetUser._id,
//               name: targetUser.name,
//               email: targetUser.email,
//             },
//           ];
//         }
//         setReceiver(targetUser);
//         setConversations((prev) => [conv, ...prev]);
//         openConv(conv);
//       } catch (e) {
//         toast.error(e.message);
//       } finally {
//         setCreatingFor(null);
//       }
//     },
//     [conversations, openConv, apiBase, headers, userId, userName]
//   );

//   // ── Send message ────────────────────────────────────────────────────────
//   const handleSend = useCallback(async () => {
//     const content = text.trim();
//     if (!content || !activeConv || sending) return;
//     setSending(true);
//     setText("");
//     socketRef.current?.emit("stopTyping", { conversationId: activeConv._id });
//     try {
//       const res = await fetch(`${apiBase}/api/chat/send`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({
//           conversationId: activeConv._id,
//           text: content,
//           receiverId: receiver?._id,
//         }),
//       });
//       if (!res.ok) throw new Error("Failed to send");
//       const data = await res.json();
//       const msg = data.message || data;
//       setMessages((prev) =>
//         prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
//       );
//       setConversations((prev) =>
//         prev.map((c) =>
//           c._id === activeConv._id ? { ...c, lastMessage: msg } : c
//         )
//       );
//     } catch (e) {
//       toast.error(e.message);
//       setText(content);
//     } finally {
//       setSending(false);
//     }
//   }, [text, activeConv, sending, apiBase, headers, receiver]);

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const handleTyping = (e) => {
//     setText(e.target.value);
//     if (!activeConv || !socketRef.current) return;
//     socketRef.current.emit("typing", {
//       conversationId: activeConv._id,
//       userId,
//       name: userName,
//     });
//     clearTimeout(typingTimerRef.current);
//     typingTimerRef.current = setTimeout(
//       () =>
//         socketRef.current?.emit("stopTyping", {
//           conversationId: activeConv._id,
//         }),
//       1500
//     );
//   };

//   // ── Delete message ──────────────────────────────────────────────────────
//   const handleDelete = useCallback(
//     async (msgId) => {
//       try {
//         const res = await fetch(`${apiBase}/api/chat/message/${msgId}`, {
//           method: "DELETE",
//           headers,
//         });
//         if (!res.ok) throw new Error("Failed");
//         setMessages((prev) => prev.filter((m) => m._id !== msgId));
//         toast.success("Message deleted");
//       } catch (e) {
//         toast.error(e.message);
//       }
//     },
//     [apiBase, headers]
//   );

//   // ── Derived ─────────────────────────────────────────────────────────────
//   const grouped = useMemo(() => {
//     const out = [];
//     let curDate = null;
//     messages.forEach((msg) => {
//       const d = fmtDate(msg.createdAt);
//       if (d !== curDate) {
//         out.push({ type: "date", label: d });
//         curDate = d;
//       }
//       out.push({ type: "msg", msg });
//     });
//     return out;
//   }, [messages]);

//   const partner = useMemo(
//     () => activeConv?.participants?.find((p) => p._id !== userId) || {},
//     [activeConv, userId]
//   );

//   const filteredConvs = useMemo(
//     () =>
//       convSearch.trim()
//         ? conversations.filter((c) =>
//             c.participants
//               ?.find((p) => p._id !== userId)
//               ?.name?.toLowerCase()
//               .includes(convSearch.toLowerCase())
//           )
//         : conversations,
//     [conversations, convSearch, userId]
//   );

//   const filteredUsers = useMemo(
//     () =>
//       userSearch.trim()
//         ? allUsers.filter(
//             (u) =>
//               u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
//               u.email?.toLowerCase().includes(userSearch.toLowerCase())
//           )
//         : allUsers,
//     [allUsers, userSearch]
//   );

//   // users who already have a conversation
//   const convUserIds = useMemo(
//     () =>
//       new Set(
//         conversations.flatMap(
//           (c) =>
//             c.participants?.map((p) => p._id).filter((id) => id !== userId) ||
//             []
//         )
//       ),
//     [conversations, userId]
//   );

//   const recentUsers = filteredUsers.filter((u) => convUserIds.has(u._id));
//   const otherUsers = filteredUsers.filter((u) => !convUserIds.has(u._id));

//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <>
//       {/* ══ FAB ══ */}
//       <button
//         onClick={() => setOpen((v) => !v)}
//         aria-label="Toggle chat"
//         className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
//         style={{
//           background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
//           boxShadow: "0 8px 28px rgba(99,102,241,0.50)",
//         }}
//       >
//         {open ? <Ic.Close /> : <Ic.Chat />}
//         {!open && unreadTotal > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse shadow-md">
//             {unreadTotal > 99 ? "99+" : unreadTotal}
//           </span>
//         )}
//       </button>

//       {/* ══ Panel ══ */}
//       <div
//         className={`fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden bg-white border border-slate-200/60 rounded-2xl transition-all duration-300 origin-bottom-right ${
//           open
//             ? "opacity-100 scale-100 pointer-events-auto"
//             : "opacity-0 scale-90 pointer-events-none"
//         }`}
//         style={{
//           width: 360,
//           height: 560,
//           boxShadow:
//             "0 24px 60px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)",
//         }}
//       >
//         {/* ════════════ HOME VIEW ════════════ */}
//         {view === "home" && (
//           <>
//             <PanelHeader>
//               <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
//                 <Ic.Chat />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-white font-bold text-sm">Messages</p>
//                 <p className="text-indigo-200 text-xs">
//                   {conversations.length} conversation
//                   {conversations.length !== 1 ? "s" : ""}
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   setView("users");
//                   if (!allUsers.length) fetchUsers();
//                 }}
//                 className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
//               >
//                 <Ic.Plus />
//                 New Chat
//               </button>
//             </PanelHeader>

//             <SearchBar
//               value={convSearch}
//               onChange={(e) => setConvSearch(e.target.value)}
//               placeholder="Search conversations…"
//             />

//             <div className="flex-1 overflow-y-auto">
//               {loadingConvs ? (
//                 <Skeleton rows={5} />
//               ) : filteredConvs.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
//                   <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
//                     <Ic.Chat />
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold text-slate-700 mb-1">
//                       {convSearch ? "No results" : "No conversations yet"}
//                     </p>
//                     <p className="text-xs text-slate-400">
//                       {convSearch
//                         ? "Try a different name"
//                         : 'Click "New Chat" to message someone'}
//                     </p>
//                   </div>
//                   {!convSearch && (
//                     <button
//                       onClick={() => {
//                         setView("users");
//                         if (!allUsers.length) fetchUsers();
//                       }}
//                       className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-md"
//                       style={{
//                         background: "linear-gradient(135deg,#6366f1,#7c3aed)",
//                         boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
//                       }}
//                     >
//                       <Ic.Users />
//                       Browse Users
//                     </button>
//                   )}
//                 </div>
//               ) : (
//                 filteredConvs.map((conv) => (
//                   <ConvRow
//                     key={conv._id}
//                     conv={conv}
//                     userId={userId}
//                     isActive={activeConv?._id === conv._id}
//                     onClick={() => openConv(conv)}
//                   />
//                 ))
//               )}
//             </div>
//           </>
//         )}

//         {/* ════════════ USERS VIEW ════════════ */}
//         {view === "users" && (
//           <>
//             <PanelHeader>
//               <button
//                 onClick={() => {
//                   setView("home");
//                   setUserSearch("");
//                 }}
//                 className="text-white/80 hover:text-white transition p-0.5"
//               >
//                 <Ic.Back />
//               </button>
//               <div className="flex-1">
//                 <p className="text-white font-bold text-sm">New Conversation</p>
//                 <p className="text-indigo-200 text-xs">
//                   Choose someone to message
//                 </p>
//               </div>
//             </PanelHeader>

//             <SearchBar
//               value={userSearch}
//               onChange={(e) => setUserSearch(e.target.value)}
//               placeholder="Search by name or email…"
//               autoFocus
//             />

//             <div className="flex-1 overflow-y-auto">
//               {loadingUsers ? (
//                 <Skeleton rows={6} />
//               ) : filteredUsers.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
//                   <div className="text-3xl">🔍</div>
//                   <p className="text-sm font-semibold text-slate-600">
//                     {userSearch ? "No users found" : "No other users"}
//                   </p>
//                   <p className="text-xs text-slate-400">
//                     {userSearch
//                       ? "Try a different search term"
//                       : "You are the only user in the system"}
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   {recentUsers.length > 0 && (
//                     <>
//                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4 pt-3 pb-1">
//                         Recent Chats
//                       </p>
//                       {recentUsers.map((u) => (
//                         <UserRow
//                           key={u._id}
//                           user={u}
//                           hasConv
//                           loading={creatingFor === u._id}
//                           onClick={() => startWith(u)}
//                         />
//                       ))}
//                     </>
//                   )}
//                   {otherUsers.length > 0 && (
//                     <>
//                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4 pt-3 pb-1">
//                         {recentUsers.length > 0 ? "All Users" : "Users"}
//                       </p>
//                       {otherUsers.map((u) => (
//                         <UserRow
//                           key={u._id}
//                           user={u}
//                           hasConv={false}
//                           loading={creatingFor === u._id}
//                           onClick={() => startWith(u)}
//                         />
//                       ))}
//                     </>
//                   )}
//                 </>
//               )}
//             </div>
//           </>
//         )}

//         {/* ════════════ CHAT VIEW ════════════ */}
//         {view === "chat" && (
//           <>
//             <PanelHeader>
//               <button
//                 onClick={() => {
//                   setView("home");
//                   setActiveConv(null);
//                   setMessages([]);
//                   setTypingUser(null);
//                 }}
//                 className="text-white/80 hover:text-white transition p-0.5 flex-shrink-0"
//               >
//                 <Ic.Back />
//               </button>
//               <Avatar name={partner.name} size={36} showOnline />
//               <div className="flex-1 min-w-0">
//                 <p className="text-white font-bold text-sm truncate">
//                   {partner.name || "User"}
//                 </p>
//                 <p className="text-indigo-200 text-xs">
//                   {typingUser ? "typing…" : "Active now"}
//                 </p>
//               </div>
//             </PanelHeader>

//             {/* messages area */}
//             <div
//               className="flex-1 overflow-y-auto px-4 pt-4 pb-2"
//               style={{ background: "#f8f9fc" }}
//             >
//               {loadingMsgs ? (
//                 <div className="flex flex-col gap-3">
//                   {[1, 2, 3, 4, 5].map((i) => (
//                     <div
//                       key={i}
//                       className={`flex gap-2 animate-pulse ${
//                         i % 2 === 0 ? "flex-row-reverse" : ""
//                       }`}
//                     >
//                       <div
//                         className="rounded-full bg-slate-200 flex-shrink-0"
//                         style={{ width: 28, height: 28 }}
//                       />
//                       <div
//                         className={`h-9 rounded-2xl bg-slate-200 ${
//                           i % 2 === 0 ? "w-28" : "w-40"
//                         }`}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               ) : grouped.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-center gap-3">
//                   <Avatar name={partner.name} size={56} />
//                   <div>
//                     <p className="text-sm font-semibold text-slate-700">
//                       {partner.name}
//                     </p>
//                     <p className="text-xs text-slate-400 mt-1">
//                       Say hello! This is the beginning of your conversation.
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   {grouped.map((item, i) =>
//                     item.type === "date" ? (
//                       <DateSep key={`d-${i}`} label={item.label} />
//                     ) : (
//                       <Bubble
//                         key={item.msg._id || i}
//                         msg={item.msg}
//                         isMine={
//                           item.msg.sender?._id === userId ||
//                           item.msg.sender === userId
//                         }
//                         onDelete={handleDelete}
//                       />
//                     )
//                   )}
//                   {typingUser && <TypingDots name={typingUser} />}
//                   <div ref={bottomRef} />
//                 </>
//               )}
//             </div>

//             {/* input */}
//             <div className="px-3 py-3 bg-white border-t border-slate-100 flex items-end gap-2 flex-shrink-0">
//               <textarea
//                 ref={inputRef}
//                 value={text}
//                 onChange={handleTyping}
//                 onKeyDown={handleKeyDown}
//                 placeholder={`Message ${partner.name || ""}…`}
//                 rows={1}
//                 className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
//                 style={{ minHeight: 42, maxHeight: 112 }}
//               />
//               <button
//                 onClick={handleSend}
//                 disabled={!text.trim() || sending}
//                 className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
//                   text.trim() && !sending
//                     ? "text-white hover:scale-105 active:scale-95"
//                     : "bg-slate-100 text-slate-300 cursor-not-allowed"
//                 }`}
//                 style={
//                   text.trim() && !sending
//                     ? {
//                         background: "linear-gradient(135deg,#6366f1,#7c3aed)",
//                         boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
//                       }
//                     : {}
//                 }
//               >
//                 {sending ? (
//                   <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//                 ) : (
//                   <Ic.Send />
//                 )}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   );
// };

// export default ChatWidget;

//Current

// ChatWidget.jsx — Peer-to-peer live chat with Socket.IO
// Props: userId, userName, token, socketUrl, apiBase
//
// 3 views:
//   "home"  → list of existing conversations + "New Chat" button
//   "users" → pick any user to start / resume a conversation
//   "chat"  → the message thread
//
// Endpoints used:
//   GET  /api/chat/conversations          → list conversations
//   POST /api/chat/conversations          → create conversation  { participantId }
//   GET  /api/chat/messages/:convId       → messages in conversation
//   POST /api/chat/send                   → send message  { conversationId, content }
//   PUT  /api/chat/read/:convId           → mark as read
//   DELETE /api/chat/message/:messageId   → delete message
//   GET  /api/users                       → all users (for picker)

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoIosClose, IoIosSearch, IoIosSend } from "react-icons/io";
import { GrFormPrevious } from "react-icons/gr";
import { FaPlus, FaUser } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";

// ─── Inline Icons ─────────────────────────────────────────────────────────────
const Ic = {
  Chat: () => <IoChatbubbleEllipsesOutline />,
  Close: () => <IoIosClose />,
  Send: () => <IoIosSend />,
  Back: () => <GrFormPrevious />,
  Plus: () => <FaPlus />,
  Search: () => <IoIosSearch />,
  Trash: () => <FaRegTrashCan />,
  Users: () => <FaUser />,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};
const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const canDeleteMessage = (createdAt) => {
  if (!createdAt) return false;

  const messageTime = new Date(createdAt).getTime();
  const now = Date.now();

  const diffMinutes = (now - messageTime) / (1000 * 60);

  return diffMinutes <= 15;
};
// ─── Avatar ───────────────────────────────────────────────────────────────────
const GRADIENTS = [
  ["#6366f1", "#8b5cf6"],
  ["#0ea5e9", "#06b6d4"],
  ["#10b981", "#14b8a6"],
  ["#f59e0b", "#ef4444"],
  ["#ec4899", "#f43f5e"],
  ["#8b5cf6", "#6366f1"],
];

const Avatar = ({ name = "", size = 36, showOnline = false }) => {
  const [a, b] = GRADIENTS[(name.charCodeAt(0) || 0) % GRADIENTS.length];
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="rounded-full flex items-center justify-center font-bold text-white select-none"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${a}, ${b})`,
          fontSize: Math.round(size * 0.36),
        }}
      >
        {getInitials(name)}
      </div>
      {showOnline && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-emerald-400"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ rows = 4 }) => (
  <div>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 animate-pulse"
      >
        <div
          className="rounded-full bg-slate-200 flex-shrink-0"
          style={{ width: 40, height: 40 }}
        />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-3/5" />
          <div className="h-2 bg-slate-200 rounded w-2/5" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingDots = ({ name }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="flex gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
    <span className="text-[11px] text-slate-400">{name} is typing…</span>
  </div>
);

// ─── Date separator ───────────────────────────────────────────────────────────
const DateSep = ({ label }) => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-slate-100" />
    <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
      {label}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

// ─── Message bubble ───────────────────────────────────────────────────────────
const Bubble = ({ msg, isMine, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`flex gap-2 mb-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isMine && <Avatar name={msg.sender?.name} size={28} />}
      <div
        className={`flex flex-col max-w-[72%] ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        {!isMine && (
          <span className="text-[10px] text-slate-400 mb-1 ml-1">
            {msg.sender?.name}
          </span>
        )}
        <div className="relative">
          <div
            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isMine
                ? "text-white rounded-tr-sm"
                : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-sm"
            }`}
            style={
              isMine
                ? {
                    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                  }
                : {}
            }
          >
            {msg.isDeleted ? (
              <span className="italic text-slate-400">
                This message is deleted
              </span>
            ) : (
              msg.text
            )}
          </div>
          {isMine && hovered && canDeleteMessage(msg.createdAt) && (
            <button
              onClick={() => onDelete(msg._id)}
              className="absolute cursor-pointer -left-5 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 transition"
              title="Delete"
            >
              <Ic.Trash />
            </button>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 mx-1">
          {fmtTime(msg.createdAt)}
        </span>
      </div>
    </div>
  );
};

// ─── Conversation row ─────────────────────────────────────────────────────────
const ConvRow = ({ conv, userId, isActive, onClick }) => {
  const partner = conv.participants?.find((p) => p._id !== userId) || {};
  const last = conv.lastMessage;
  const unread = conv.unreadCount || 0;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-left border-b border-slate-100 ${
        isActive ? "bg-indigo-50 border-l-[3px] border-l-indigo-500" : ""
      }`}
    >
      <Avatar name={partner.name} size={42} showOnline />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-1">
          <span
            className={`text-sm font-semibold truncate ${
              isActive ? "text-indigo-700" : "text-slate-800"
            }`}
          >
            {partner.name || "User"}
          </span>
          <span className="text-[10px] text-slate-400 flex-shrink-0">
            {last?.createdAt ? fmtTime(last.createdAt) : ""}
          </span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <p className="text-xs text-slate-500 truncate">
            {last
              ? last.sender?._id === userId
                ? `You: ${last.text}`
                : last.text
              : "Tap to start chatting"}
          </p>
          {unread > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── User row ─────────────────────────────────────────────────────────────────
const UserRow = ({ user, hasConv, onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-left border-b border-slate-100 disabled:opacity-60"
  >
    <Avatar name={user.name} size={42} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 truncate">
        {user.name}
      </p>
      <p className="text-xs text-slate-400 truncate">
        {user.email || user.role || ""}
      </p>
    </div>
    {loading ? (
      <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
    ) : (
      <span
        className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
          hasConv
            ? "bg-indigo-100 text-indigo-600 border border-indigo-200"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {hasConv ? "Resume" : "Message"}
      </span>
    )}
  </button>
);

// ─── Panel header ─────────────────────────────────────────────────────────────
const PanelHeader = ({ children }) => (
  <div
    className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
    style={{ background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)" }}
  >
    {children}
  </div>
);

// ─── Search bar ───────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder, autoFocus }) => (
  <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex-shrink-0">
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Ic.Search />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-8 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
      />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN ChatWidget
// ══════════════════════════════════════════════════════════════════════════════
const ChatWidget = ({ userId, userName, token, socketUrl, apiBase }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("home"); // "home" | "users" | "chat"
  const [unreadTotal, setUnreadTotal] = useState(0);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [convSearch, setConvSearch] = useState("");
  const [creatingFor, setCreatingFor] = useState(null); // userId being created
  const [receiver, setReceiver] = useState(null);

  const [text, setText] = useState("");

  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const pollingRef = useRef(null);
  const convPollingRef = useRef(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // ── Socket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId || !token || !socketUrl) return;
    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("newMessage", (msg) => {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg,
                unreadCount:
                  msg.sender?._id !== userId
                    ? (c.unreadCount || 0) + 1
                    : c.unreadCount,
              }
            : c
        )
      );
      if (msg.sender?._id !== userId) setUnreadTotal((n) => n + 1);
    });

    socket.on("typing", ({ userId: tid, name }) => {
      if (tid !== userId) {
        setTypingUser(name);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setTypingUser(null), 2500);
      }
    });
    socket.on("stopTyping", () => setTypingUser(null));
    socket.on("messageDeleted", ({ messageId }) =>
      setMessages((prev) => prev.filter((m) => m._id !== messageId))
    );

    return () => {
      socket.disconnect();
      clearTimeout(typingTimerRef.current);
    };
  }, [userId, token, socketUrl]);

  useEffect(() => {
    if (activeConv?._id && socketRef.current) {
      socketRef.current.emit("joinConversation", {
        conversationId: activeConv._id,
      });
    }
  }, [activeConv]);

  useEffect(() => {
    if (messages.length)
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        60
      );
  }, [messages]);

  // ── Fetch conversations ─────────────────────────────────────────────────
  const fetchConvs = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/chat/conversations`, {
        headers,
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.conversations || [];

      setConversations(list);
      localStorage.setItem("chat_conversations", JSON.stringify(list));

      setUnreadTotal(list.reduce((a, c) => a + (c.unreadCount || 0), 0));
    } catch (err) {
      console.error(err);
    }
  }, [apiBase, headers]);

  useEffect(() => {
    if (open && conversations.length === 0) {
      fetchConvs();
    }
  }, [open, conversations.length, fetchConvs]);

  useEffect(() => {
    const saved = localStorage.getItem("chat_conversations");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);

        setUnreadTotal(parsed.reduce((a, c) => a + (c.unreadCount || 0), 0));
      } catch {
        toast.error("Could not load conversations");
      }
    }
  }, []);

  // ── Fetch all users ──────────────────────────────────────────────────────
  // ⚠️  Adjust endpoint to match your API (e.g. /api/users, /api/chat/users, etc.)
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${apiBase}/api/chat/users`, { headers });
      if (!res.ok) throw new Error("Failed");
      const response = await res.json();
      const list = response.data || [];
      setAllUsers(list.filter((u) => u._id !== userId));
    } catch {
      toast.error("Could not load users");
    } finally {
      setLoadingUsers(false);
    }
  }, [apiBase, headers, userId]);

  // ── Fetch messages ──────────────────────────────────────────────────────
  const fetchMsgs = useCallback(
    async (convId) => {
      try {
        const res = await fetch(`${apiBase}/api/chat/messages/${convId}`, {
          headers,
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();

        const newMsgs = Array.isArray(data)
          ? data
          : data.data || data.messages || [];

        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));

          return [...prev, ...newMsgs.filter((m) => !existingIds.has(m._id))];
        });
      } catch (err) {
        console.error(err);
      }
    },
    [apiBase, headers]
  );
  // ── Mark as read ────────────────────────────────────────────────────────
  const markRead = useCallback(
    async (conv) => {
      if (!conv?.unreadCount) return;
      try {
        await fetch(`${apiBase}/api/chat/read/${conv._id}`, {
          method: "PUT",
          headers,
        });
        setConversations((prev) =>
          prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
        );
        setUnreadTotal((n) => Math.max(0, n - (conv.unreadCount || 0)));
      } catch (error) {
        console.error(error);
      }
    },
    [apiBase, headers]
  );

  // ── Open conversation ───────────────────────────────────────────────────
  const openConv = useCallback(
    (conv) => {
      setActiveConv(conv);
      setMessages([]);
      setTypingUser(null);
      setView("chat");

      // ✅ SAVE to localStorage
      localStorage.setItem("activeConvId", conv._id);

      fetchMsgs(conv._id);
      markRead(conv);
      setTimeout(() => inputRef.current?.focus(), 200);
    },
    [fetchMsgs, markRead]
  );

  useEffect(() => {
    if (!conversations.length) return;

    const savedConvId = localStorage.getItem("activeConvId");
    if (!savedConvId) return;

    const foundConv = conversations.find((c) => c._id === savedConvId);

    if (foundConv) {
      setActiveConv(foundConv);
      setView("chat");
      fetchMsgs(foundConv._id);
    }
  }, [conversations, fetchMsgs]);
  // ── Start or resume conversation with a user ────────────────────────────
  const startWith = useCallback(
    async (targetUser) => {
      // check existing
      const existing = conversations.find((c) =>
        c.participants?.some((p) => p._id === targetUser._id)
      );
      if (existing) {
        openConv(existing);
        return;
      }
      // create new
      setCreatingFor(targetUser._id);
      try {
        const res = await fetch(`${apiBase}/api/chat/conversations`, {
          method: "POST",
          headers,
          body: JSON.stringify({ receiverId: targetUser._id }),
        });
        if (!res.ok) throw new Error("Could not start conversation");
        const response = await res.json();
        const conv = response.data;
        // ensure participants are populated locally
        if (!conv.participants) {
          conv.participants = [
            { _id: userId, name: userName },
            {
              _id: targetUser._id,
              name: targetUser.name,
              email: targetUser.email,
            },
          ];
        }
        setReceiver(targetUser);
        setConversations((prev) => [conv, ...prev]);
        openConv(conv);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setCreatingFor(null);
      }
    },
    [conversations, openConv, apiBase, headers, userId, userName]
  );

  // ── Send message ────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || !activeConv || sending) return;
    setSending(true);
    setText("");
    socketRef.current?.emit("stopTyping", { conversationId: activeConv._id });
    try {
      const res = await fetch(`${apiBase}/api/chat/send`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversationId: activeConv._id,
          text: content,
          receiverId: receiver?._id,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();
      const msg = data.message || data;
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConv._id ? { ...c, lastMessage: msg } : c
        )
      );
    } catch (e) {
      toast.error(e.message);
      setText(content);
    } finally {
      setSending(false);
    }
  }, [text, activeConv, sending, apiBase, headers, receiver]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!activeConv || !socketRef.current) return;
    socketRef.current.emit("typing", {
      conversationId: activeConv._id,
      userId,
      name: userName,
    });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(
      () =>
        socketRef.current?.emit("stopTyping", {
          conversationId: activeConv._id,
        }),
      1500
    );
  };

  // ── Delete message ──────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (msgId) => {
      try {
        const res = await fetch(`${apiBase}/api/chat/message/${msgId}`, {
          method: "DELETE",
          headers,
        });

        if (!res.ok) throw new Error("Failed");

        // ✅ mark as deleted instead of removing
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId
              ? { ...m, isDeleted: true, text: "This message is deleted" }
              : m
          )
        );

        toast.success("Message deleted");
      } catch (e) {
        toast.error(e.message);
      }
    },
    [apiBase, headers]
  );

  // ── Derived ─────────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const out = [];
    let curDate = null;
    messages.forEach((msg) => {
      const d = fmtDate(msg.createdAt);
      if (d !== curDate) {
        out.push({ type: "date", label: d });
        curDate = d;
      }
      out.push({ type: "msg", msg });
    });
    return out;
  }, [messages]);

  const partner = useMemo(
    () => activeConv?.participants?.find((p) => p._id !== userId) || {},
    [activeConv, userId]
  );

  const filteredConvs = useMemo(
    () =>
      convSearch.trim()
        ? conversations.filter((c) =>
            c.participants
              ?.find((p) => p._id !== userId)
              ?.name?.toLowerCase()
              .includes(convSearch.toLowerCase())
          )
        : conversations,
    [conversations, convSearch, userId]
  );

  const filteredUsers = useMemo(
    () =>
      userSearch.trim()
        ? allUsers.filter(
            (u) =>
              u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
              u.email?.toLowerCase().includes(userSearch.toLowerCase())
          )
        : allUsers,
    [allUsers, userSearch]
  );

  // users who already have a conversation
  const convUserIds = useMemo(
    () =>
      new Set(
        conversations.flatMap(
          (c) =>
            c.participants?.map((p) => p._id).filter((id) => id !== userId) ||
            []
        )
      ),
    [conversations, userId]
  );

  const recentUsers = filteredUsers.filter((u) => convUserIds.has(u._id));
  const otherUsers = filteredUsers.filter((u) => !convUserIds.has(u._id));

  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeConv?._id) return;

    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchMsgs(activeConv._id);
      }
    }, 1000);

    return () => clearInterval(pollingRef.current);
  }, [activeConv, fetchMsgs]);

  useEffect(() => {
    if (!open || view !== "home") return;

    if (convPollingRef.current) clearInterval(convPollingRef.current);

    convPollingRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchConvs();
      }
    }, 1000);

    return () => clearInterval(convPollingRef.current);
  }, [open, view, fetchConvs]);
  return (
    <>
      {/* ══ FAB ══ */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
          boxShadow: "0 8px 28px rgba(99,102,241,0.50)",
        }}
      >
        {open ? <Ic.Close /> : <Ic.Chat />}
        {!open && unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse shadow-md">
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        )}
      </button>

      {/* ══ Panel ══ */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden bg-white border border-slate-200/60 rounded-2xl transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
        style={{
          width: 360,
          height: 560,
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* ════════════ HOME VIEW ════════════ */}
        {view === "home" && (
          <>
            <PanelHeader>
              <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center flex-shrink-0">
                <Ic.Chat />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Messages</p>
                <p className="text-indigo-200 text-xs">
                  {conversations.length} conversation
                  {conversations.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => {
                  setView("users");
                  if (!allUsers.length) fetchUsers();
                }}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              >
                <Ic.Plus />
                New Chat
              </button>
            </PanelHeader>

            <SearchBar
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Search conversations…"
            />

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <Skeleton rows={5} />
              ) : filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
                    <Ic.Chat />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      {convSearch ? "No results" : "No conversations yet"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {convSearch
                        ? "Try a different name"
                        : 'Click "New Chat" to message someone'}
                    </p>
                  </div>
                  {!convSearch && (
                    <button
                      onClick={() => {
                        setView("users");
                        if (!allUsers.length) fetchUsers();
                      }}
                      className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-md"
                      style={{
                        background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                        boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                      }}
                    >
                      <Ic.Users />
                      Browse Users
                    </button>
                  )}
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <ConvRow
                    key={conv._id}
                    conv={conv}
                    userId={userId}
                    isActive={activeConv?._id === conv._id}
                    onClick={() => openConv(conv)}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* ════════════ USERS VIEW ════════════ */}
        {view === "users" && (
          <>
            <PanelHeader>
              <button
                onClick={() => {
                  setView("home");
                  setActiveConv(null);
                  setMessages([]);
                  setTypingUser(null);

                  // ✅ CLEAR saved chat
                  localStorage.removeItem("activeConvId");
                }}
                className="text-white/80 hover:text-white transition p-0.5"
              >
                <Ic.Back />
              </button>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">New Conversation</p>
                <p className="text-indigo-200 text-xs">
                  Choose someone to message
                </p>
              </div>
            </PanelHeader>

            <SearchBar
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name or email…"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <Skeleton rows={6} />
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
                  <div className="text-3xl">🔍</div>
                  <p className="text-sm font-semibold text-slate-600">
                    {userSearch ? "No users found" : "No other users"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {userSearch
                      ? "Try a different search term"
                      : "You are the only user in the system"}
                  </p>
                </div>
              ) : (
                <>
                  {recentUsers.length > 0 && (
                    <>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4 pt-3 pb-1">
                        Recent Chats
                      </p>
                      {recentUsers.map((u) => (
                        <UserRow
                          key={u._id}
                          user={u}
                          hasConv
                          loading={creatingFor === u._id}
                          onClick={() => startWith(u)}
                        />
                      ))}
                    </>
                  )}
                  {otherUsers.length > 0 && (
                    <>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4 pt-3 pb-1">
                        {recentUsers.length > 0 ? "All Users" : "Users"}
                      </p>
                      {otherUsers.map((u) => (
                        <UserRow
                          key={u._id}
                          user={u}
                          hasConv={false}
                          loading={creatingFor === u._id}
                          onClick={() => startWith(u)}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ════════════ CHAT VIEW ════════════ */}
        {view === "chat" && (
          <>
            <PanelHeader>
              <button
                onClick={() => {
                  setView("home");
                  setActiveConv(null);
                  setMessages([]);
                  setTypingUser(null);
                }}
                className="text-white/80 hover:text-white transition p-0.5 flex-shrink-0"
              >
                <Ic.Back />
              </button>
              <Avatar name={partner.name} size={36} showOnline />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  {partner.name || "User"}
                </p>
                <p className="text-indigo-200 text-xs">
                  {typingUser ? "typing…" : "Active now"}
                </p>
              </div>
            </PanelHeader>

            {/* messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 pt-4 pb-2"
              style={{ background: "#f8f9fc" }}
            >
              {loadingMsgs ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`flex gap-2 animate-pulse ${
                        i % 2 === 0 ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className="rounded-full bg-slate-200 flex-shrink-0"
                        style={{ width: 28, height: 28 }}
                      />
                      <div
                        className={`h-9 rounded-2xl bg-slate-200 ${
                          i % 2 === 0 ? "w-28" : "w-40"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <Avatar name={partner.name} size={56} />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {partner.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Say hello! This is the beginning of your conversation.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {grouped.map((item, i) =>
                    item.type === "date" ? (
                      <DateSep key={`d-${i}`} label={item.label} />
                    ) : (
                      <Bubble
                        key={item.msg._id || i}
                        msg={item.msg}
                        isMine={
                          item.msg.sender?._id === userId ||
                          item.msg.sender === userId
                        }
                        onDelete={handleDelete}
                      />
                    )
                  )}
                  {typingUser && <TypingDots name={typingUser} />}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* input */}
            <div className="px-3 py-3 bg-white border-t border-slate-100 flex items-end gap-2 flex-shrink-0">
              <textarea
                ref={inputRef}
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${partner.name || ""}…`}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                style={{ minHeight: 42, maxHeight: 112 }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  text.trim() && !sending
                    ? "text-white hover:scale-105 active:scale-95"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
                style={
                  text.trim() && !sending
                    ? {
                        background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                        boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
                      }
                    : {}
                }
              >
                {sending ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Ic.Send />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChatWidget;
