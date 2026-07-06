import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import FavouriteBooks from "../components/profile/FavouriteBooks";
import ReadingBooks from "../components/profile/ReadingBooks";
import RentalHistory from "../components/profile/RentalHistory";
import SettingsContainer from "../components/profile/SettingsContainer";

const Profile = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("reading");

  // Allow routing to specific tab via state
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  const renderContent = () => {
    switch (activeTab) {
      case "favorites":
        return <FavouriteBooks />;
      case "reading":
        return <ReadingBooks />;
      case "rentals":
        return <RentalHistory />;
      case "settings":
        return <SettingsContainer />;
      default:
        return <ReadingBooks />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-3">
          <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="col-span-12 md:col-span-9">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
