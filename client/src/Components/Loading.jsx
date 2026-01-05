// src/Components/Loading.jsx
const Loading = ({ message = "Loading...", fullscreen = false }) => {
  const spinnerClass =
    "w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin";

  if (fullscreen) {
    return (
      <div className="fixed inset-0  h-screen w-screen top-0 left-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className={spinnerClass}></div>
          {message && <p className="mt-4 text-white text-lg">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center ">
      <div className={spinnerClass}></div>
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );
};

export default Loading;
