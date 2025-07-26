import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, User, Calendar, Shield } from "lucide-react";

export default function UserProfile() {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "agent":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-2">
            My Profile
          </h1>
          <p className="text-lg text-neutral-600">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                    <AvatarFallback className="text-2xl">
                      {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                    {user?.displayName || "User"}
                  </h2>
                  
                  <Badge className={`mb-4 ${getRoleColor(user?.role)}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role === "user" ? "Property Buyer" : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Badge>
                  
                  <div className="w-full space-y-3">
                    <div className="flex items-center text-sm text-neutral-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    
                    {user?.createdAt && (
                      <div className="flex items-center text-sm text-neutral-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Joined {formatDate(user.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      {user?.displayName || "Not specified"}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      {user?.email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Account Type
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      <Badge className={getRoleColor(user?.role)}>
                        {user?.role === "user" ? "Property Buyer" : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Account Status
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                {user?.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Member Since
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Profile Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Wishlist</h4>
                      <p className="text-sm text-blue-700">Save your favorite properties for quick access</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Property Offers</h4>
                      <p className="text-sm text-green-700">Make offers on properties and track their status</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Reviews</h4>
                      <p className="text-sm text-purple-700">Share your experience with properties you've viewed</p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Secure Payments</h4>
                      <p className="text-sm text-orange-700">Safe and secure payment processing for property purchases</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
