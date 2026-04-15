// import React, { useState, useEffect, useRef } from "react";
// import {
//   FaSearch,
//   FaFilePdf,
//   FaFileExcel,
//   FaTimes,
//   FaEye,
// } from "react-icons/fa";
// import { IoChevronDown } from "react-icons/io5";
// import Loading from "../../Components/Loading";
// import toast from "react-hot-toast";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const ViewDailyTasks = () => {
//   const [reports, setReports] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // Modal
//   const [modalReport, setModalReport] = useState(null);

//   // Filters
//   const [search, setSearch] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [filterMode, setFilterMode] = useState("all");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   const hasFetched = useRef(false);

//   useEffect(() => {
//     if (hasFetched.current) return;
//     hasFetched.current = true;
//     fetchReports();
//   }, []);

//   const fetchReports = async () => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return toast.error("No authentication token found");

//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         toast.error(err.message || "Failed to fetch reports");
//         return;
//       }

//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setReports(list);
//       setFiltered(list);
//     } catch (err) {
//       console.error(err);
//       toast.error(err.message || "Failed to fetch reports");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ─── Filtering ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     let result = [...reports];

//     if (search.trim()) {
//       result = result.filter((r) =>
//         r.userName?.toLowerCase().includes(search.trim().toLowerCase())
//       );
//     }

//     if (filterMode === "daily" && fromDate) {
//       result = result.filter(
//         (r) => new Date(r.date).toISOString().split("T")[0] === fromDate
//       );
//     } else if (filterMode === "range" && fromDate && toDate) {
//       result = result.filter((r) => {
//         const d = new Date(r.date).toISOString().split("T")[0];
//         return d >= fromDate && d <= toDate;
//       });
//     } else if (filterMode === "monthly" && selectedMonth) {
//       result = result.filter((r) => {
//         const d = new Date(r.date);
//         const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
//           2,
//           "0"
//         )}`;
//         return ym === selectedMonth;
//       });
//     }

//     result.sort((a, b) => new Date(b.date) - new Date(a.date));
//     setFiltered(result);
//   }, [search, fromDate, toDate, filterMode, selectedMonth, reports]);

//   const resetFilters = () => {
//     setSearch("");
//     setFromDate("");
//     setToDate("");
//     setFilterMode("all");
//     setSelectedMonth("");
//   };

//   const fmtDate = (iso) =>
//     new Date(iso).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });

//   const totalHours = (tasks) =>
//     tasks?.reduce((s, t) => s + (t.hours || 0), 0).toFixed(1);

//   // ─── Flatten for export ───────────────────────────────────────────────────
//   const flattenForExport = (data) => {
//     const rows = [];
//     data.forEach((r) => {
//       r.tasks?.forEach((t) => {
//         rows.push({
//           "User Name": r.userName,
//           Date: fmtDate(r.date),
//           Project: t.project,
//           Activity: t.activity,
//           Hours: t.hours,
//           Description: t.description,
//         });
//       });
//     });
//     return rows;
//   };

//   // ─── Excel Export ─────────────────────────────────────────────────────────
//   const exportExcel = () => {
//     const rows = flattenForExport(filtered);
//     if (!rows.length) return toast.error("No data to export");
//     const ws = XLSX.utils.json_to_sheet(rows);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Daily Tasks");
//     ws["!cols"] = [
//       { wch: 20 },
//       { wch: 14 },
//       { wch: 26 },
//       { wch: 28 },
//       { wch: 8 },
//       { wch: 50 },
//     ];
//     XLSX.writeFile(
//       wb,
//       `daily_tasks_${new Date().toISOString().split("T")[0]}.xlsx`
//     );
//     toast.success("Excel exported!");
//   };

//   // ─── PDF Export ───────────────────────────────────────────────────────────
//   const exportPDF = () => {
//     const rows = flattenForExport(filtered);
//     if (!rows.length) return toast.error("No data to export");

//     const doc = new jsPDF({ orientation: "landscape" });
//     doc.setFontSize(14);
//     doc.text("Daily Task Report", 14, 15);
//     doc.setFontSize(10);
//     doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

//     autoTable(doc, {
//       startY: 28,
//       head: [
//         ["User Name", "Date", "Project", "Activity", "Hours", "Description"],
//       ],
//       body: rows.map((r) => Object.values(r)),
//       styles: { fontSize: 8, cellPadding: 3 },
//       headStyles: { fillColor: [211, 89, 47] },
//       columnStyles: { 5: { cellWidth: 80 } },
//     });

//     doc.save(`daily_tasks_${new Date().toISOString().split("T")[0]}.pdf`);
//     toast.success("PDF exported!");
//   };

//   // ─── Render ───────────────────────────────────────────────────────────────
//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <div
//         className={`bg-white shadow-md rounded-lg ${
//           isLoading ? "blur-sm" : ""
//         }`}
//       >
//         {/* Header */}
//         <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
//           <h1 className="text-2xl font-bold">Daily Task Reports</h1>
//           <div className="flex gap-2">
//             <button
//               onClick={exportExcel}
//               className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm"
//             >
//               <FaFileExcel size={14} /> Export Excel
//             </button>
//             <button
//               onClick={exportPDF}
//               className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
//             >
//               <FaFilePdf size={14} /> Export PDF
//             </button>
//           </div>
//         </div>

//         <div className="p-6">
//           {/* Filters */}
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
//             <div className="grid grid-cols-4 gap-4 items-end">
//               {/* Search */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 mb-1">
//                   Search by Name
//                 </label>
//                 <div className="relative">
//                   <FaSearch
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                     size={13}
//                   />
//                   <input
//                     type="text"
//                     className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
//                     placeholder="Enter user name..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* Filter Mode */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 mb-1">
//                   Filter By
//                 </label>
//                 <div className="relative">
//                   <select
//                     className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
//                     value={filterMode}
//                     onChange={(e) => {
//                       setFilterMode(e.target.value);
//                       setFromDate("");
//                       setToDate("");
//                       setSelectedMonth("");
//                     }}
//                   >
//                     <option value="all">All</option>
//                     <option value="daily">Single Day</option>
//                     <option value="range">Date Range</option>
//                     <option value="monthly">Monthly</option>
//                   </select>
//                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                     <IoChevronDown className="text-gray-400" size={14} />
//                   </div>
//                 </div>
//               </div>

//               {filterMode === "daily" && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">
//                     Date
//                   </label>
//                   <input
//                     type="date"
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
//                     value={fromDate}
//                     onChange={(e) => setFromDate(e.target.value)}
//                   />
//                 </div>
//               )}

//               {filterMode === "range" && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">
//                       From
//                     </label>
//                     <input
//                       type="date"
//                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
//                       value={fromDate}
//                       onChange={(e) => setFromDate(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">
//                       To
//                     </label>
//                     <input
//                       type="date"
//                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
//                       value={toDate}
//                       onChange={(e) => setToDate(e.target.value)}
//                     />
//                   </div>
//                 </>
//               )}

//               {filterMode === "monthly" && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">
//                     Month
//                   </label>
//                   <input
//                     type="month"
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
//                     value={selectedMonth}
//                     onChange={(e) => setSelectedMonth(e.target.value)}
//                   />
//                 </div>
//               )}

//               <div className="flex items-end">
//                 <button
//                   onClick={resetFilters}
//                   className="px-4 py-2 bg-primary text-white rounded-md text-sm cursor-pointer"
//                 >
//                   Reset
//                 </button>
//               </div>
//             </div>

//             <p className="text-xs text-gray-400 mt-3">
//               Showing{" "}
//               <span className="font-semibold text-gray-600">
//                 {filtered.length}
//               </span>{" "}
//               report(s)
//             </p>
//           </div>

//           {/* Table */}
//           {filtered.length === 0 ? (
//             <div className="text-center py-16 text-gray-400">
//               <p className="text-lg">No reports found</p>
//               <p className="text-sm mt-1">Try adjusting your filters</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100 text-gray-600 text-left">
//                     <th className="px-4 py-3 font-medium border-b border-gray-300">
//                       #
//                     </th>
//                     <th className="px-4 py-3 font-medium border-b border-gray-300">
//                       User Name
//                     </th>
//                     <th className="px-4 py-3 font-medium border-b border-gray-300">
//                       Branch
//                     </th>
//                     <th className="px-4 py-3 font-medium border-b border-gray-300">
//                       Department
//                     </th>
//                     <th className="px-4 py-3 font-medium border-b border-gray-300">
//                       Date
//                     </th>
//                     <th className="px-4 py-3 font-medium border-b border-gray-300">
//                       Tasks
//                     </th>
//                     <th className="px-4 py-3 font-medium border-b border-gray-300">
//                       Total Hours
//                     </th>
//                     <th className="px-4 py-3 font-medium border-b border-gray-300">
//                       Details
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.map((report, idx) => (
//                     <tr
//                       key={report._id}
//                       className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
//                       <td className="px-4 py-3 font-medium text-gray-800">
//                         {report.userName}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600">
//                         {report.branch?.branchName || "—"}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600">
//                         {report.department?.departmentName || "—"}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600">
//                         {fmtDate(report.date)}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
//                           {report.tasks?.length || 0} task(s)
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
//                           {totalHours(report.tasks)} hrs
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <button
//                           onClick={() => setModalReport(report)}
//                           className="text-orange-600 cursor-pointer hover:text-orange-800"
//                         >
//                           <FaEye />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ─── Modal ─────────────────────────────────────────────────────────── */}
//       {modalReport && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 bg-opacity-50"
//           onClick={() => setModalReport(null)}
//         >
//           <div
//             className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header */}
//             <div className="bg-primary text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold">{modalReport.userName}</h2>
//                 <p className="text-sm text-white/80">
//                   {fmtDate(modalReport.date)} &nbsp;·&nbsp;
//                   {modalReport.branch?.branchName} &nbsp;·&nbsp;
//                   {modalReport.department?.departmentName}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setModalReport(null)}
//                 className="text-white hover:text-white/70 p-1"
//               >
//                 <FaTimes size={18} />
//               </button>
//             </div>

//             {/* Summary pills */}
//             <div className="flex gap-3 px-6 py-3 border-b border-gray-300 bg-gray-50">
//               <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
//                 {modalReport.tasks?.length || 0} Tasks
//               </span>
//               <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
//                 {totalHours(modalReport.tasks)} Total Hours
//               </span>
//             </div>

//             {/* Modal Body — scrollable */}
//             <div className="overflow-y-auto flex-1 px-6 py-4">
//               <table className="w-full text-sm border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100 text-gray-600 text-left">
//                     <th className="px-3 py-2 font-medium border-b border-gray-300">
//                       #
//                     </th>
//                     <th className="px-3 py-2 font-medium border-b border-gray-300">
//                       Project
//                     </th>
//                     <th className="px-3 py-2 font-medium border-b border-gray-300">
//                       Activity
//                     </th>
//                     <th className="px-3 py-2 font-medium border-b border-gray-300">
//                       Hours
//                     </th>
//                     <th className="px-3 py-2 font-medium border-b border-gray-300">
//                       Description
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {modalReport.tasks?.map((task, ti) => (
//                     <tr
//                       key={task._id || ti}
//                       className={`border-b border-gray-300 ${
//                         ti % 2 === 0 ? "bg-white" : "bg-gray-50"
//                       }`}
//                     >
//                       <td className="px-3 py-3 text-gray-400 text-xs">
//                         {ti + 1}
//                       </td>
//                       <td className="px-3 py-3 font-medium text-gray-800">
//                         {task.project}
//                       </td>
//                       <td className="px-3 py-3 text-gray-600">
//                         {task.activity}
//                       </td>
//                       <td className="px-3 py-3">
//                         <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
//                           {task.hours}h
//                         </span>
//                       </td>
//                       <td className="px-3 py-3 text-gray-600 text-sm leading-relaxed">
//                         {task.description}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Modal Footer */}
//             <div className="px-6 py-3  flex justify-end">
//               <button
//                 onClick={() => setModalReport(null)}
//                 className="px-5 py-2 bg-black cursor-pointer text-white rounded-md text-sm hover:bg-gray-800"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isLoading && (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//           <Loading />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewDailyTasks;

import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaTimes,
  FaEye,
} from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const todayStr = () => new Date().toISOString().split("T")[0];

const ViewDailyTasks = () => {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Modal
  const [modalReport, setModalReport] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No authentication token found");

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Failed to fetch reports");
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setReports(list);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Filtering ────────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...reports];

    // Default: show only today unless showAll is true
    if (!showAll) {
      const today = todayStr();
      result = result.filter(
        (r) => new Date(r.date).toISOString().split("T")[0] === today
      );
      setFiltered(result.sort((a, b) => new Date(b.date) - new Date(a.date)));
      return;
    }

    // Search by name
    if (search.trim()) {
      result = result.filter((r) =>
        r.userName?.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    // Date filters
    if (filterMode === "daily" && fromDate) {
      result = result.filter(
        (r) => new Date(r.date).toISOString().split("T")[0] === fromDate
      );
    } else if (filterMode === "range" && fromDate && toDate) {
      result = result.filter((r) => {
        const d = new Date(r.date).toISOString().split("T")[0];
        return d >= fromDate && d <= toDate;
      });
    } else if (filterMode === "monthly" && selectedMonth) {
      result = result.filter((r) => {
        const d = new Date(r.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        return ym === selectedMonth;
      });
    }

    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFiltered(result);
  }, [search, fromDate, toDate, filterMode, selectedMonth, reports, showAll]);

  const resetFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setFilterMode("all");
    setSelectedMonth("");
  };

  const handleShowAll = () => {
    setShowAll(true);
    resetFilters();
  };

  const handleShowToday = () => {
    setShowAll(false);
    resetFilters();
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const toHoursMin = (decimal) => {
    const totalMins = Math.round(decimal * 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const totalHours = (tasks) => {
    const total = tasks?.reduce((s, t) => s + (t.hours || 0), 0) ?? 0;
    return toHoursMin(total);
  };

  // ─── Flatten for export ───────────────────────────────────────────────────
  const flattenForExport = (data) => {
    const rows = [];
    data.forEach((r) => {
      r.tasks?.forEach((t) => {
        rows.push({
          "User Name": r.userName,
          Date: fmtDate(r.date),
          Project: t.project,
          Activity: t.activity,
          Hours: t.hours,
          Description: t.description,
        });
      });
    });
    return rows;
  };

  // ─── Excel Export ─────────────────────────────────────────────────────────
  const exportExcel = () => {
    const rows = flattenForExport(filtered);
    if (!rows.length) return toast.error("No data to export");
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Tasks");
    ws["!cols"] = [
      { wch: 20 },
      { wch: 14 },
      { wch: 26 },
      { wch: 28 },
      { wch: 8 },
      { wch: 50 },
    ];
    XLSX.writeFile(
      wb,
      `daily_tasks_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Excel exported!");
  };

  // ─── PDF Export ───────────────────────────────────────────────────────────
  const exportPDF = () => {
    const rows = flattenForExport(filtered);
    if (!rows.length) return toast.error("No data to export");

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Daily Task Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [
        ["User Name", "Date", "Project", "Activity", "Hours", "Description"],
      ],
      body: rows.map((r) => Object.values(r)),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [211, 89, 47] },
      columnStyles: { 5: { cellWidth: 80 } },
    });

    doc.save(`daily_tasks_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF exported!");
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        {/* Header */}
        <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Daily Task Reports</h1>
            {/* Today / All toggle */}
            <div className="flex bg-white/20 rounded-lg p-0.5 ml-2">
              <button
                onClick={handleShowToday}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  !showAll
                    ? "bg-white text-primary"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Today
              </button>
              <button
                onClick={handleShowAll}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  showAll
                    ? "bg-white text-primary"
                    : "text-white hover:bg-white/10"
                }`}
              >
                All Tasks
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm"
            >
              <FaFileExcel size={14} /> Export Excel
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
            >
              <FaFilePdf size={14} /> Export PDF
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Filters — only shown when showAll is true */}
          {showAll && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Search by Name
                  </label>
                  <div className="relative">
                    <FaSearch
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={13}
                    />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Enter user name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filter Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Filter By
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      value={filterMode}
                      onChange={(e) => {
                        setFilterMode(e.target.value);
                        setFromDate("");
                        setToDate("");
                        setSelectedMonth("");
                      }}
                    >
                      <option value="all">All</option>
                      <option value="daily">Single Day</option>
                      <option value="range">Date Range</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <IoChevronDown className="text-gray-400" size={14} />
                    </div>
                  </div>
                </div>

                {filterMode === "daily" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                )}

                {filterMode === "range" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {filterMode === "monthly" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Month
                    </label>
                    <input
                      type="month"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Showing{" "}
                <span className="font-semibold text-gray-600">
                  {filtered.length}
                </span>{" "}
                report(s)
              </p>
            </div>
          )}

          {/* Today banner when in today mode */}
          {!showAll && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                <p className="text-sm text-gray-500">
                  Showing reports for{" "}
                  <span className="font-semibold text-gray-700">
                    {new Date().toLocaleDateString("en-GB", {
                      weekday: "long", // 👈 adds day name
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
              <p className="text-xs text-gray-400">
                {filtered.length} report(s)
              </p>
            </div>
          )}

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">
                {!showAll ? "No reports submitted today" : "No reports found"}
              </p>
              <p className="text-sm mt-1">
                {!showAll
                  ? "Switch to All Tasks to view previous reports"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-left">
                    <th className="px-4 py-3 font-medium border-b border-gray-300">
                      #
                    </th>
                    <th className="px-4 py-3 font-medium border-b border-gray-300">
                      User Name
                    </th>
                    <th className="px-4 py-3 font-medium border-b border-gray-300">
                      Branch
                    </th>
                    <th className="px-4 py-3 font-medium border-b border-gray-300">
                      Department
                    </th>
                    <th className="px-4 py-3 font-medium border-b border-gray-300">
                      Date
                    </th>
                    <th className="px-4 py-3 font-medium border-b border-gray-300">
                      Tasks
                    </th>
                    <th className="px-4 py-3 font-medium border-b border-gray-300">
                      Total Hours
                    </th>
                    <th className="px-4 py-3 font-medium border-b border-gray-300">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((report, idx) => (
                    <tr
                      key={report._id}
                      className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {report.userName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {report.branch?.branchName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {report.department?.departmentName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {fmtDate(report.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                          {report.tasks?.length || 0} task(s)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                          {totalHours(report.tasks)}{" "}
                          {/* remove " hrs" suffix since it's now in the string */}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setModalReport(report)}
                          className="text-orange-600 cursor-pointer hover:text-orange-800"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal ─────────────────────────────────────────────────────────── */}
      {modalReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setModalReport(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-primary text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{modalReport.userName}</h2>
                <p className="text-sm text-white/80">
                  {fmtDate(modalReport.date)} &nbsp;·&nbsp;
                  {modalReport.branch?.branchName} &nbsp;·&nbsp;
                  {modalReport.department?.departmentName}
                </p>
              </div>
              <button
                onClick={() => setModalReport(null)}
                className="text-white hover:text-white/70 p-1"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Summary pills */}
            <div className="flex gap-3 px-6 py-3 border-b border-gray-300 bg-gray-50">
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                {modalReport.tasks?.length || 0} Tasks
              </span>
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                {totalHours(modalReport.tasks)} Total Hours
              </span>
            </div>

            {/* Modal Body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-left">
                    <th className="px-3 py-2 font-medium border-b border-gray-300">
                      #
                    </th>
                    <th className="px-3 py-2 font-medium border-b border-gray-300">
                      Project
                    </th>
                    <th className="px-3 py-2 font-medium border-b border-gray-300">
                      Activity
                    </th>
                    <th className="px-3 py-2 font-medium border-b border-gray-300">
                      Hours
                    </th>
                    <th className="px-3 py-2 font-medium border-b border-gray-300">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {modalReport.tasks?.map((task, ti) => (
                    <tr
                      key={task._id || ti}
                      className={`border-b border-gray-300 ${
                        ti % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-3 py-3 text-gray-400 text-xs">
                        {ti + 1}
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-800">
                        {task.project}
                      </td>
                      <td className="px-3 py-3 text-gray-600">
                        {task.activity}
                      </td>
                      <td className="px-3 py-3">
                        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                          {toHoursMin(task.hours)} {/* was: {task.hours}h */}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 text-sm leading-relaxed">
                        {task.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 flex justify-end">
              <button
                onClick={() => setModalReport(null)}
                className="px-5 py-2 bg-black cursor-pointer text-white rounded-md text-sm hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default ViewDailyTasks;
