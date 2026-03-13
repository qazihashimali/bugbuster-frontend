import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaSitemap,
  FaTimes,
  FaUser,
  FaChevronDown,
  FaChevronRight,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand,
} from "react-icons/fa";

// ─── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const colors = {
    SuperAdmin: "bg-purple-100 text-purple-700 border-purple-200",
    Admin: "bg-blue-100 text-blue-700 border-blue-200",
    ServiceProvider: "bg-emerald-100 text-emerald-700 border-emerald-200",
    EndUser: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
        colors[role] || "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {role}
    </span>
  );
};

// ─── Node Card ─────────────────────────────────────────────────────────────────
const NodeCard = ({ node, isRoot, depth }) => {
  // Dynamic colors can't be done purely via Tailwind so keep border/bg as inline
  const avatarBg = isRoot
    ? "#6366f1"
    : depth === 1
    ? "#10b981"
    : depth === 2
    ? "#f59e0b"
    : "#9ca3af";
  const borderColor = isRoot
    ? "#818cf8"
    : depth === 1
    ? "#6ee7b7"
    : depth === 2
    ? "#fcd34d"
    : "#e5e7eb";
  const bgColor = isRoot
    ? "#eef2ff"
    : depth === 1
    ? "#ecfdf5"
    : depth === 2
    ? "#fffbeb"
    : "#ffffff";

  return (
    <div
      className="rounded-xl px-4 py-3 text-center"
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        minWidth: 160,
        maxWidth: 200,
        boxShadow: isRoot
          ? "0 4px 12px rgba(99,102,241,0.15)"
          : "0 1px 4px rgba(0,0,0,0.07)",
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-sm"
        style={{ background: avatarBg }}
      >
        {node.name?.charAt(0)?.toUpperCase() || "?"}
      </div>

      {/* Name */}
      <p className="font-semibold text-sm text-gray-800 mb-0.5 truncate">
        {node.name || "Unknown"}
      </p>

      {/* Email */}
      <p className="text-[10px] text-gray-400 truncate mb-1.5">{node.email}</p>

      {/* Roles */}
      <div className="flex flex-wrap gap-1 justify-center mb-1">
        {node.roles?.map((r) => (
          <RoleBadge key={r} role={r} />
        ))}
      </div>

      {/* Branch */}
      {node.branch?.branchName && (
        <p className="text-[10px] text-gray-500 mt-1 truncate">
          {node.branch.branchName}
        </p>
      )}

      {/* Departments */}
      {node.departments?.length > 0 && (
        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
          {node.departments.map((d) => d.departmentName).join(", ")}
        </p>
      )}
    </div>
  );
};

// ─── Tree Node ─────────────────────────────────────────────────────────────────
const TreeNode = ({ node, isRoot = false, depth = 0 }) => {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = Array.isArray(node.team) && node.team.length > 0;
  const GAP = 32;

  return (
    <div className="flex flex-col items-center relative">
      {/* Card + toggle button */}
      <div className="relative inline-block">
        <NodeCard node={node} isRoot={isRoot} depth={depth} />
        {hasChildren && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute left-1/2 -translate-x-1/2 -bottom-3 z-10 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer shadow text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {collapsed ? (
              <FaChevronRight size={8} />
            ) : (
              <FaChevronDown size={8} />
            )}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="flex flex-col items-center">
          {/* Stem */}
          <div className="w-px h-7 bg-gray-300" />

          <div className="flex items-start" style={{ gap: GAP }}>
            {node.team.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === node.team.length - 1;
              const isSingle = node.team.length === 1;

              return (
                <div key={child._id} className="flex flex-col items-center">
                  {isSingle ? (
                    <div className="w-px h-5 bg-gray-300" />
                  ) : (
                    <div className="relative w-full h-5">
                      {/* Left arm */}
                      {!isFirst && (
                        <div className="absolute top-0 left-0 right-1/2 h-px bg-gray-300" />
                      )}
                      {/* Right arm */}
                      {!isLast && (
                        <div className="absolute top-0 left-1/2 right-0 h-px bg-gray-300" />
                      )}
                      {/* Vertical drop */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gray-300" />
                    </div>
                  )}
                  <TreeNode node={child} depth={depth + 1} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
const UserHierarchyModal = ({ userId, onClose }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const MIN_SCALE = 0.3;
  const MAX_SCALE = 1.5;
  const STEP = 0.15;

  const zoom = (delta) =>
    setScale((s) =>
      Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(s + delta).toFixed(2)))
    );
  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
    e.currentTarget.style.cursor = "grabbing";
  };
  const onMouseMove = (e) => {
    if (!isPanning.current) return;
    setPan({
      x: panOrigin.current.x + (e.clientX - panStart.current.x),
      y: panOrigin.current.y + (e.clientY - panStart.current.y),
    });
  };
  const onMouseUp = (e) => {
    isPanning.current = false;
    e.currentTarget.style.cursor = "grab";
  };
  const onWheel = (e) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? STEP : -STEP);
  };

  const touchStart = useRef(null);
  const onTouchStart = (e) => {
    if (e.touches.length === 1)
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        pan: { ...pan },
      };
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 1 && touchStart.current)
      setPan({
        x:
          touchStart.current.pan.x +
          (e.touches[0].clientX - touchStart.current.x),
        y:
          touchStart.current.pan.y +
          (e.touches[0].clientY - touchStart.current.y),
      });
  };

  const fetchHierarchy = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/team/my-team?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json = await res.json();
      setData(json._id ? json : json.team?._id ? json.team : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  const LEGEND = [
    ["#6366f1", "Manager"],
    ["#10b981", "Direct Reports"],
    ["#f59e0b", "Level 2"],
    ["#9ca3af", "Deeper"],
  ];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-primary flex items-center justify-between px-5 py-3.5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <FaSitemap size={16} className="text-white" />
            <div>
              <h2 className="text-white font-bold text-base m-0 leading-tight">
                Team Hierarchy
              </h2>
              {data?.name && (
                <p className="text-white/65 text-[11px] m-0">
                  Reporting structure for {data.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-white transition-colors"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50 border-b border-gray-100 flex-shrink-0">
          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {LEGEND.map(([color, label]) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-[11px] text-gray-500"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                  style={{ background: color }}
                />
                {label}
              </span>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 mr-1">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => zoom(-STEP)}
              title="Zoom out"
              className="bg-white border border-gray-200 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaSearchMinus size={11} />
            </button>
            <button
              onClick={() => zoom(STEP)}
              title="Zoom in"
              className="bg-white border border-gray-200 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaSearchPlus size={11} />
            </button>
            <button
              onClick={resetView}
              title="Reset view"
              className="bg-white border border-gray-200 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaExpand size={11} />
            </button>
            <span className="text-[10px] text-gray-300 ml-1.5 italic hidden sm:block">
              Scroll to zoom · Drag to pan
            </span>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          className="flex-1 overflow-hidden cursor-grab relative"
          style={{
            background:
              "radial-gradient(circle, #e5e7eb 1px, transparent 1px) center / 24px 24px",
          }}
        >
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-primary rounded-full animate-spin" />
              <p className="text-sm">Loading hierarchy…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-red-500 font-semibold">
                Failed to load hierarchy
              </p>
              <p className="text-sm text-gray-400">{error}</p>
              <button
                onClick={fetchHierarchy}
                className="mt-2 text-sm text-indigo-600 underline cursor-pointer bg-transparent border-none"
              >
                Try again
              </button>
            </div>
          )}

          {/* Tree */}
          {!isLoading && !error && data?._id && (
            <div
              className="absolute top-1/2 left-1/2 select-none"
              style={{
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale})`,
                transformOrigin: "center center",
                transition: isPanning.current ? "none" : "transform 0.15s ease",
              }}
            >
              <TreeNode node={data} isRoot depth={0} />
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && !data?._id && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <FaUser size={32} className="text-gray-200" />
              <p className="text-sm">No hierarchy data available</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="bg-black text-white border-none rounded-lg px-5 py-2 text-sm cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserHierarchyModal;
