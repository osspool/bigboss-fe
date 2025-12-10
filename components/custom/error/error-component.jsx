import React from "react";

const ErrorComponent = ({onReset}) => {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="mt-2 ">
        We are working on it. Please try again later.
      </p>
      <button
        onClick={onReset}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Reload Page
      </button>
    </div>
  );
};

export default ErrorComponent;
