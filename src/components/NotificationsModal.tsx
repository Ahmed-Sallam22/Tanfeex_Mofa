import React from "react";
import { X, Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useTranslation } from "react-i18next";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    status,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications();

  if (!isOpen) return null;

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("notifications.justNow");
    if (diffMins < 60) return `${diffMins} ${t("notifications.minutesAgo")}`;
    if (diffHours < 24) return `${diffHours} ${t("notifications.hoursAgo")}`;
    return `${diffDays} ${t("notifications.daysAgo")}`;
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "oracle_upload_completed":
        return { bg: "bg-green-50", border: "border-green-200", icon: "✅" };
      case "oracle_upload_failed":
        return { bg: "bg-red-50", border: "border-red-200", icon: "❌" };
      case "oracle_upload_started":
      case "oracle_upload_progress":
        return { bg: "bg-blue-50", border: "border-blue-200", icon: "⏳" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", icon: "🔔" };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-16 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-white rounded-xl shadow-2xl z-50 max-h-[70vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">
              {t("navbar.notifications")}
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <span
              className={`h-2 w-2 rounded-full ${
                status === "connected"
                  ? "bg-green-500"
                  : status === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              }`}
              title={status}
            />

            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t("notifications.markAllRead")}
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("notifications.clearAll")}
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm text-center">
                {t("notifications.noNotifications")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 transition-colors ${
                      !notification.read ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${style.bg} border ${style.border}`}
                      >
                        {style.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            !notification.read
                              ? "font-medium text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </p>

                        {notification.data?.code && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            {notification.data.code}
                          </p>
                        )}

                        <p className="text-xs text-gray-400 mt-1">
                          {getTimeAgo(notification.timestamp)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title={t("notifications.markRead")}
                          >
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title={t("notifications.delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
