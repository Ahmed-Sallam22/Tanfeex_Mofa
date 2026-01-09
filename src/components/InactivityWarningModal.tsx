import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../features/auth/hooks";
import { clearAuth } from "../features/auth/authSlice";
import { useInactivityDetector } from "../hooks/useInactivityDetector";
import { useTokenRefresh } from "../hooks/useTokenRefresh";
import { cn } from "@/utils/cn";

// Clock icon component
const ClockIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 6V12L16 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Warning icon component
const WarningIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2 20.3 2.26 20.56 2.58 20.74C2.9 20.92 3.27 21.01 3.64 21H20.36C20.73 21.01 21.1 20.92 21.42 20.74C21.74 20.56 22 20.3 22.18 20C22.36 19.7 22.45 19.36 22.45 19C22.45 18.64 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.95 3.15C12.63 2.98 12.27 2.89 11.9 2.89C11.53 2.89 11.17 2.98 10.85 3.15C10.53 3.32 10.27 3.56 10.09 3.86H10.29Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Refresh icon component
const RefreshIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 4V10H7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 20V14H17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Logout icon component
const LogoutIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17L21 12L16 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface InactivityWarningModalProps {
  // Inactivity timeout in milliseconds (default: 1 minute)
  inactivityTimeout?: number;
  // Warning countdown in milliseconds (default: 1 minute)
  warningTimeout?: number;
}

export default function InactivityWarningModal({
  inactivityTimeout = 60000, // 1 minute
  warningTimeout = 60000, // 1 minute
}: InactivityWarningModalProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { refreshToken, isRefreshing } = useTokenRefresh();

  const { isWarningVisible, remainingTime, hideWarning } =
    useInactivityDetector({
      inactivityTimeout,
      warningTimeout,
    });

  // Handle session timeout
  useEffect(() => {
    const handleSessionTimeout = () => {
      dispatch(clearAuth());
      navigate("/auth/sign-in");
    };

    window.addEventListener("sessionTimeout", handleSessionTimeout);
    return () => {
      window.removeEventListener("sessionTimeout", handleSessionTimeout);
    };
  }, [dispatch, navigate]);

  // Handle stay logged in (refresh token)
  const handleStayLoggedIn = async () => {
    const success = await refreshToken();
    if (success) {
      hideWarning();
    } else {
      // If refresh fails, logout
      dispatch(clearAuth());
      navigate("/auth/sign-in");
    }
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(clearAuth());
    navigate("/auth/sign-in");
  };

  // Format remaining time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate progress percentage for circular timer
  const progressPercentage = (remainingTime / (warningTimeout / 1000)) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  if (!isWarningVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300" />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl mx-4 w-full max-w-md transform transition-all duration-300 animate-in fade-in zoom-in-95",
          isRTL ? "font-arabic" : ""
        )}
      >
        {/* Warning Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
            <WarningIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {t("inactivity.title", "جلستك على وشك الانتهاء")}
          </h2>
          <p className="text-white/90 text-sm">
            {t("inactivity.subtitle", "Session About to Expire")}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Timer Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="45"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                  className="dark:stroke-gray-700"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="45"
                  stroke={
                    remainingTime <= 10
                      ? "#EF4444"
                      : remainingTime <= 30
                      ? "#F59E0B"
                      : "#10B981"
                  }
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Timer text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ClockIcon
                  className={cn(
                    "w-6 h-6 mb-1",
                    remainingTime <= 10
                      ? "text-red-500"
                      : remainingTime <= 30
                      ? "text-amber-500"
                      : "text-emerald-500"
                  )}
                />
                <span
                  className={cn(
                    "text-2xl font-bold",
                    remainingTime <= 10
                      ? "text-red-500"
                      : remainingTime <= 30
                      ? "text-amber-500"
                      : "text-gray-900 dark:text-white"
                  )}
                >
                  {formatTime(remainingTime)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t("inactivity.remaining", "متبقي")}
                </span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {t("inactivity.message", "لقد لاحظنا عدم وجود نشاط على حسابك")}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t(
                "inactivity.messageDetail",
                "سيتم تسجيل خروجك تلقائياً عند انتهاء الوقت لحماية حسابك"
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {/* Stay Logged In Button */}
            <button
              onClick={handleStayLoggedIn}
              disabled={isRefreshing}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
                "text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isRefreshing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RefreshIcon className="w-5 h-5" />
              )}
              <span>{t("inactivity.stayLoggedIn", "البقاء متصلاً")}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600",
                "text-gray-700 dark:text-gray-200"
              )}
            >
              <LogoutIcon className="w-5 h-5" />
              <span>{t("inactivity.logout", "تسجيل الخروج")}</span>
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            {t(
              "inactivity.securityNote",
              "هذا الإجراء لحماية خصوصيتك وأمان حسابك"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
