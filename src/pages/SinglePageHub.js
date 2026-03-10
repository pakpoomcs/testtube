import React from "react";
import { useLocation } from "react-router-dom";
import HomeNews from "./HomeNews";
import ExploreFeed from "./ExploreFeed";
import AdminPage from "./AdminPage";
import ProfileProgressPage from "./ProfileProgressPage";

function SinglePageHub() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/practice")) return <ExploreFeed />;
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    return <ProfileProgressPage />;
  }
  if (pathname.startsWith("/admin")) return <AdminPage />;
  return <HomeNews />;
}

export default SinglePageHub;
