import { useNavigate } from "react-router-dom";
import { CgDanger } from "react-icons/cg";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
        {/* Top accent bar */}
        <div className="h-2 bg-primary w-full" />

        <div className="p-10 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-6">
            <CgDanger className="h-10 w-10 text-primary" />
          </div>

          {/* 403 badge */}
          <span className="text-xs font-semibold tracking-widest uppercase bg-red-100 text-red-600 px-3 py-1 rounded-full mb-4">
            403 — Forbidden
          </span>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            You don't have permission to view this page. Please contact your
            administrator if you believe this is a mistake.
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 px-4 py-2 border cursor-pointer border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-4 py-2 bg-primary cursor-pointer text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
