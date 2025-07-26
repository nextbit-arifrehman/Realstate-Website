import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { User, Heart, ShoppingBag, Star, Home, Plus, BarChart3, Settings, Users, MessageSquare, Target, RefreshCw, UserPlus } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { useState } from "react";
import api from "../lib/api";

export default function Dashboard() {
  const { user, refreshUserData } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleRefreshRole = async () => {
    setIsRefreshing(true);
    try {
      const updatedUser = await refreshUserData();
      if (updatedUser && updatedUser.role !== user.role) {
        toast({
          title: "Role Updated",
          description: `Your role has been updated to: ${updatedUser.role}`,
        });
        // Force page reload to update dashboard
        window.location.reload();
      } else {
        toast({
          title: "Role Checked",
          description: "Your role is up to date",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh role from database",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBecomeAgent = async () => {
    setIsUpgrading(true);
    try {
      await api.post('/api/users/become-agent');
      toast({
        title: "Success",
        description: "You are now an agent! Refreshing dashboard...",
      });
      // Refresh the page to show agent dashboard
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to upgrade to agent role",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const getDashboardCards = () => {
    switch (user?.role) {
      case "user":
        return [
          {
            title: "My Profile",
            description: "Manage your personal information and account settings",
            icon: User,
            href: "/dashboard/user/profile",
            color: "bg-blue-50 text-blue-600"
          },
          {
            title: "Wishlist",
            description: "View and manage your saved properties",
            icon: Heart,
            href: "/dashboard/user/wishlist",
            color: "bg-red-50 text-red-600"
          },
          {
            title: "Property Bought",
            description: "Track your property purchases and offers",
            icon: ShoppingBag,
            href: "/dashboard/user/property-bought",
            color: "bg-green-50 text-green-600"
          },
          {
            title: "My Reviews",
            description: "Manage your property reviews and ratings",
            icon: Star,
            href: "/dashboard/user/reviews",
            color: "bg-yellow-50 text-yellow-600"
          }
        ];
      
      case "agent":
        return [
          {
            title: "Agent Profile",
            description: "Manage your agent profile and information",
            icon: User,
            href: "/dashboard/agent/profile",
            color: "bg-blue-50 text-blue-600"
          },
          {
            title: "Add Property",
            description: "List a new property for sale",
            icon: Plus,
            href: "/dashboard/agent/add-property",
            color: "bg-green-50 text-green-600"
          },
          {
            title: "My Properties",
            description: "Manage your listed properties",
            icon: Home,
            href: "/dashboard/agent/my-properties",
            color: "bg-purple-50 text-purple-600"
          },
          {
            title: "Sold Properties",
            description: "View your successful property sales",
            icon: BarChart3,
            href: "/dashboard/agent/sold-properties",
            color: "bg-emerald-50 text-emerald-600"
          },
          {
            title: "Requested Properties",
            description: "Manage incoming property offers",
            icon: Target,
            href: "/dashboard/agent/requested-properties",
            color: "bg-orange-50 text-orange-600"
          }
        ];
      
      case "admin":
        return [
          {
            title: "Admin Profile",
            description: "Manage your admin profile settings",
            icon: User,
            href: "/dashboard/admin/profile",
            color: "bg-blue-50 text-blue-600"
          },
          {
            title: "Manage Properties",
            description: "Verify and manage all properties",
            icon: Home,
            href: "/dashboard/admin/manage-properties",
            color: "bg-purple-50 text-purple-600"
          },
          {
            title: "Manage Users",
            description: "Manage user accounts and roles",
            icon: Users,
            href: "/dashboard/admin/manage-users",
            color: "bg-indigo-50 text-indigo-600"
          },
          {
            title: "Manage Reviews",
            description: "Monitor and moderate user reviews",
            icon: MessageSquare,
            href: "/dashboard/admin/manage-reviews",
            color: "bg-pink-50 text-pink-600"
          },
          {
            title: "Advertise Property",
            description: "Promote featured properties",
            icon: Target,
            href: "/dashboard/admin/advertise-property",
            color: "bg-orange-50 text-orange-600"
          }
        ];
      
      default:
        return [];
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "user": return "Property Buyer";
      case "agent": return "Real Estate Agent";
      case "admin": return "Administrator";
      default: return "User";
    }
  };

  const dashboardCards = getDashboardCards();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-2">
                Welcome back, {user?.displayName || "User"}!
              </h1>
              <p className="text-lg text-neutral-600">
                {getRoleDisplayName(user?.role)} Dashboard
              </p>
            </div>
            <div className="flex gap-2">
              {user?.role === 'user' && (
                <Badge variant="outline" className="text-blue-600 border-blue-300 px-3 py-1">
                  Contact Admin to Become Agent
                </Badge>
              )}
              <Button 
                variant="outline" 
                onClick={handleRefreshRole}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Checking...' : 'Refresh Role'}
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Link key={index} to={card.href}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link to="/all-properties">
                <Button className="bg-primary hover:bg-blue-700">
                  <Home className="w-4 h-4 mr-2" />
                  Browse Properties
                </Button>
              </Link>
              
              {user?.role === "user" && (
                <Link to="/dashboard/user/wishlist">
                  <Button variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    View Wishlist
                  </Button>
                </Link>
              )}
              
              {user?.role === "agent" && (
                <Link to="/dashboard/agent/add-property">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Property
                  </Button>
                </Link>
              )}
              
              {user?.role === "admin" && (
                <Link to="/dashboard/admin/manage-properties">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Properties
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
