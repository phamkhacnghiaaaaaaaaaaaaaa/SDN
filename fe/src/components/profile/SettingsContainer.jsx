import React, { useState } from "react";
import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";

const SettingsContainer = () => {
  const [activeSubTab, setActiveSubTab] = useState("profile");

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tabs navigation */}
      <div className="bg-bg-secondary p-4 rounded-md shadow-shadow-sm flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveSubTab("profile")}
          className={`px-4 py-2 font-medium rounded-md transition-colors ${
            activeSubTab === "profile"
              ? "bg-primary text-white"
              : "text-text-muted hover:bg-surface hover:text-primary"
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveSubTab("security")}
          className={`px-4 py-2 font-medium rounded-md transition-colors ${
            activeSubTab === "security"
              ? "bg-primary text-white"
              : "text-text-muted hover:bg-surface hover:text-primary"
          }`}
        >
          Security Settings
        </button>
      </div>

      {/* Content area */}
      <div className="w-full">
        {activeSubTab === "profile" && <ProfileSettings />}
        {activeSubTab === "security" && <SecuritySettings />}
      </div>
    </div>
  );
};

export default SettingsContainer;
