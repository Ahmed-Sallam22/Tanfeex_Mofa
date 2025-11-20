export function TanfeezLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        {/* Animated Logo/Brand */}
        <div className="mb-8">
          <div className="relative">
            {/* Main logo circle with pulse animation */}
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#4E8476] to-[#2d5147] rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <span className="text-white font-bold text-2xl">T</span>
            </div>

            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 rounded-full border-2 border-transparent border-t-[#4E8476]"></div>
            </div>

            {/* Secondary ring */}
            <div
              className="absolute inset-0 animate-spin duration-3000"
              style={{ animationDirection: "reverse" }}
            >
              <div className="w-20 h-20 rounded-full border border-transparent border-r-[#4E8476] opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Brand name with fade-in effect */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#4E8476] mb-2 animate-fade-in">
            Tanfeez
          </h1>
          <p className="text-[#4E8476] animate-pulse">
            Your comprehensive dashboard solution
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-[#4E8476] rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-[#4E8476] rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-[#4E8476] rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-blue-200 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4E8476] to-[#4E8476] rounded-full animate-progress-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
