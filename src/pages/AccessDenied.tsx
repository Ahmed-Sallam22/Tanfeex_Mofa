import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useTranslation } from "react-i18next";

export default function AccessDenied() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate("/app");
    } else {
      navigate("/auth/sign-in");
    }
  };

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate("/app");
    } else {
      navigate("/auth/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#4E8476]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4E8476]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Lock Icon with Shield */}
        <div className="relative mb-8 inline-block">
          <div className="w-32 h-32 mx-auto relative">
            {/* Outer ring animation */}
            <div className="absolute inset-0 border-4 border-[#4E8476]/30 rounded-full animate-ping" />
            <div className="absolute inset-2 border-2 border-[#4E8476]/40 rounded-full animate-pulse" />

            {/* Shield icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-[#4E8476]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          {/* X mark overlay */}
          <div className="absolute bottom-0 right-0 bg-[#4E8476] rounded-full p-2 shadow-lg shadow-[#4E8476]/50">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-4">
          <span className="text-8xl font-bold bg-gradient-to-r from-[#4E8476] via-teal-500 to-[#3d6b5f] bg-clip-text text-transparent">
            403
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t("accessDenied.title", "Access Denied")}
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          {t(
            "accessDenied.description",
            "Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is an error."
          )}
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-600" />
          <div className="w-2 h-2 bg-[#4E8476] rounded-full animate-pulse" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-600" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="group relative px-8 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t("accessDenied.goBack", "Go Back")}
          </button>

          <button
            onClick={handleGoHome}
            className="group relative px-8 py-3 bg-gradient-to-r from-[#4E8476] to-teal-600 hover:from-[#5a9587] hover:to-teal-500 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-[#4E8476]/25 hover:shadow-[#4E8476]/40 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {t("accessDenied.goHome", "Go Home")}
          </button>
        </div>

        {/* Support link */}
        <p className="mt-8 text-slate-500 text-sm">
          {t("accessDenied.needHelp", "Need help?")}{" "}
          <a
            href="mailto:support@tanfeez.com"
            className="text-[#4E8476] hover:text-[#5a9587] underline transition-colors"
          >
            {t("accessDenied.contactSupport", "Contact Support")}
          </a>
        </p>
      </div>
    </div>
  );
}
