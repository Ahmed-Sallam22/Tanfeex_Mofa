// src/pages/DashboardHeader.tsx

import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useTranslation } from "react-i18next";

export default function DashboardHeader() {
  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const { t, i18n } = useTranslation();

  // Fallback user data from localStorage if Redux state is not available
  const getUserFromStorage = () => {
    try {
      const authData = localStorage.getItem("auth");
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user;
      }
    } catch (error) {
      console.error("Error parsing auth data from localStorage:", error);
    }
    return null;
  };

  const currentUser = user || getUserFromStorage();

  // Capitalize the first letter of each word in the username
  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const userName = currentUser?.username
    ? capitalizeWords(currentUser.username)
    : "User";

  const today = new Date();
  const displayLocale = i18n.language === "ar" ? "ar-EG" : "en-GB";
  const formatted = today.toLocaleDateString(displayLocale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }); 

  const hours = new Date().getHours();
  const isMorning = hours < 12;
  const greeting = isMorning ? t("greeting.morning") : t("greeting.evening");

  return (
    <header className="flex items-start justify-between gap-4">
      {/* Left: greeting */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl sm:text-3xl font-semibold text-[#4E8476]">
          {greeting}, {userName}
        </h2>
        <p className="text-[#757575] text-sm">{formatted}</p>
      </div>

      {/* Right: navbar capsule */}
      <Navbar
        onSearchClick={() => console.log("search")}
        onBellClick={() => console.log("bell")}
      />
    </header>
  );
}
