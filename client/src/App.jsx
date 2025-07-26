import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

// Pages
import Home from "./pages/Home";
import AllProperties from "./pages/AllProperties";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";
import NotFound from "./pages/not-found";

// User pages
import UserProfile from "./pages/user/UserProfile";
import Wishlist from "./pages/user/Wishlist";
import PropertyBought from "./pages/user/PropertyBought";
import MyReviews from "./pages/user/MyReviews";
import MakeOffer from "./pages/user/MakeOffer";

// Agent pages
import AgentProfile from "./pages/agent/AgentProfile";
import AddProperty from "./pages/agent/AddProperty";
import MyProperties from "./pages/agent/MyProperties";
import SoldProperties from "./pages/agent/SoldProperties";
import RequestedProperties from "./pages/agent/RequestedProperties";

// Admin pages
import AdminProfile from "./pages/admin/AdminProfile";
import ManageProperties from "./pages/admin/ManageProperties";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageReviews from "./pages/admin/ManageReviews";
import AdvertiseProperty from "./pages/admin/AdvertiseProperty";

function AppRouter() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/properties" element={<PrivateRoute><AllProperties /></PrivateRoute>} />
          <Route path="/all-properties" element={<PrivateRoute><AllProperties /></PrivateRoute>} />
          <Route path="/property/:id" element={<PrivateRoute><PropertyDetails /></PrivateRoute>} />
          <Route path="/payment/:offerId" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* User Routes */}
          <Route path="/dashboard/user/profile" element={<RoleBasedRoute allowedRoles={["user"]}><UserProfile /></RoleBasedRoute>} />
          <Route path="/dashboard/user/wishlist" element={<RoleBasedRoute allowedRoles={["user"]}><Wishlist /></RoleBasedRoute>} />
          <Route path="/dashboard/user/property-bought" element={<RoleBasedRoute allowedRoles={["user"]}><PropertyBought /></RoleBasedRoute>} />
          <Route path="/dashboard/user/reviews" element={<RoleBasedRoute allowedRoles={["user"]}><MyReviews /></RoleBasedRoute>} />
          <Route path="/make-offer/:propertyId" element={<RoleBasedRoute allowedRoles={["user"]}><MakeOffer /></RoleBasedRoute>} />
          
          {/* Agent Routes */}
          <Route path="/dashboard/agent/profile" element={<RoleBasedRoute allowedRoles={["agent"]}><AgentProfile /></RoleBasedRoute>} />
          <Route path="/dashboard/agent/add-property" element={<RoleBasedRoute allowedRoles={["agent"]}><AddProperty /></RoleBasedRoute>} />
          <Route path="/dashboard/agent/my-properties" element={<RoleBasedRoute allowedRoles={["agent"]}><MyProperties /></RoleBasedRoute>} />
          <Route path="/dashboard/agent/sold-properties" element={<RoleBasedRoute allowedRoles={["agent"]}><SoldProperties /></RoleBasedRoute>} />
          <Route path="/dashboard/agent/requested-properties" element={<RoleBasedRoute allowedRoles={["agent"]}><RequestedProperties /></RoleBasedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/dashboard/admin/profile" element={<RoleBasedRoute allowedRoles={["admin"]}><AdminProfile /></RoleBasedRoute>} />
          <Route path="/dashboard/admin/manage-properties" element={<RoleBasedRoute allowedRoles={["admin"]}><ManageProperties /></RoleBasedRoute>} />
          <Route path="/dashboard/admin/manage-users" element={<RoleBasedRoute allowedRoles={["admin"]}><ManageUsers /></RoleBasedRoute>} />
          <Route path="/dashboard/admin/manage-reviews" element={<RoleBasedRoute allowedRoles={["admin"]}><ManageReviews /></RoleBasedRoute>} />
          <Route path="/dashboard/admin/advertise-property" element={<RoleBasedRoute allowedRoles={["admin"]}><AdvertiseProperty /></RoleBasedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
