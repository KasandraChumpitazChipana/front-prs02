import React from "react";
// eslint-disable-next-line no-unused-vars

import { BrowserRouter, Routes, Route } from "react-router-dom";

//For Settings...
// import Settings from "./components/settings/Settings";

import AppRoutes from "./components/approutes";
import Auth from "./pages/auth/auth";
import Admin from "./pages/admin/admin";
import Principal from "./pages/principal/principal";
import Teacher from "./pages/teacher/teacher";
import Directors from "./pages/directors/directors";

//Accounts
const Approuter = () => {
  // eslint-disable-next-line no-unused-vars
  // const config = "/react/template"
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/principal" element={<Principal />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/directors/*" element={<Directors />} />

          {AppRoutes.map((route) => route)}
        </Routes>
      </BrowserRouter>
      <div className="sidebar-overlay"></div>
    </>
  );
};

export default Approuter;
