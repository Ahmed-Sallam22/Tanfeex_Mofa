import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../features/auth/hooks";
import { clearAuth } from "../features/auth/authSlice";
import { useInactivityDetector } from "../hooks/useInactivityDetector";
import { useTokenRefresh } from "../hooks/useTokenRefresh";
import { cn } from "@/utils/cn";



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




  if (!isWarningVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300" />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-xl mx-4 w-full max-w-md transform transition-all duration-300",
          isRTL ? "font-arabic" : ""
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <WarningIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#282828]">
              {t("inactivity.title", "جلستك على وشك الانتهاء")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("inactivity.subtitle", "تم اكتشاف عدم نشاط")}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
        
          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-[#282828] mb-2">
              {t("inactivity.message", "لقد لاحظنا عدم وجود نشاط على حسابك")}
            </p>
            <p className="text-gray-500 text-sm">
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
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                "bg-[#4E8476] hover:bg-[#3d6b60]",
                "text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isRefreshing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RefreshIcon className="w-5 h-5" />
              )}
              <span>
                {t("inactivity.stayLoggedIn", "البقاء متصلاً")} ({remainingTime}
                s)
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                "bg-gray-100 hover:bg-gray-200",
                "text-[#282828]"
              )}
            >
              <LogoutIcon className="w-5 h-5" />
              <span>{t("inactivity.logout", "تسجيل الخروج")}</span>
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-4">
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
