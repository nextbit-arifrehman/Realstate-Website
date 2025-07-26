import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Search, Shield, UserCheck, AlertTriangle, Trash2, Crown, UserPlus } from "lucide-react";
import apiClient from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ManageUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Fetch all users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/api/users');
      return response.data;
    }
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      let endpoint;
      if (role === 'admin') {
        endpoint = `/api/users/make-admin/${userId}`;
      } else if (role === 'agent') {
        endpoint = `/api/users/make-agent/${userId}`;
      } else {
        throw new Error('Invalid role');
      }
      const response = await apiClient.patch(endpoint);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${variables.role}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update user role.",
        variant: "destructive",
      });
    }
  });

  // Mark user as fraud mutation
  const markFraudMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.patch(`/api/users/mark-fraud/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "User Marked as Fraud",
        description: "User has been marked as fraudulent. Their properties have been removed from listings.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to mark user as fraud.",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.delete(`/api/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted from the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Delete user error:', error);
      let errorMessage = "Failed to delete user.";
      
      if (error.response?.status === 404) {
        errorMessage = "User not found. The user may have already been deleted.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleUpdateRole = (userId, role) => {
    if (window.confirm(`Are you sure you want to make this user a ${role}?`)) {
      updateRoleMutation.mutate({ userId, role });
    }
  };

  const handleMarkFraud = (userId) => {
    if (window.confirm("Are you sure you want to mark this agent as fraudulent? This action will remove all their properties from listings.")) {
      markFraudMutation.mutate(userId);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleBadge = (role, isFraud = false) => {
    if (isFraud) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Fraud
        </Badge>
      );
    }

    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-800">
            <Crown className="w-3 h-3 mr-1" />
            Administrator
          </Badge>
        );
      case "agent":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Agent
          </Badge>
        );
      case "user":
        return (
          <Badge className="bg-green-100 text-green-800">
            <Users className="w-3 h-3 mr-1" />
            User
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const agentCount = users.filter(u => u.role === "agent").length;
  const userCount = users.filter(u => u.role === "user").length;
  const fraudCount = users.filter(u => u.isFraud).length;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Failed to load users</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-2">
            Manage Users
          </h1>
          <p className="text-lg text-neutral-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : totalUsers}
                  </div>
                  <div className="text-neutral-600">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mr-4">
                  <Crown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : adminCount}
                  </div>
                  <div className="text-neutral-600">Admins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : agentCount}
                  </div>
                  <div className="text-neutral-600">Agents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : userCount}
                  </div>
                  <div className="text-neutral-600">Buyers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : fraudCount}
                  </div>
                  <div className="text-neutral-600">Flagged</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={roleFilter === "all" ? "default" : "outline"}
                  onClick={() => setRoleFilter("all")}
                  size="sm"
                >
                  All ({totalUsers})
                </Button>
                <Button
                  variant={roleFilter === "admin" ? "default" : "outline"}
                  onClick={() => setRoleFilter("admin")}
                  size="sm"
                  className={roleFilter === "admin" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Admins ({adminCount})
                </Button>
                <Button
                  variant={roleFilter === "agent" ? "default" : "outline"}
                  onClick={() => setRoleFilter("agent")}
                  size="sm"
                  className={roleFilter === "agent" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Agents ({agentCount})
                </Button>
                <Button
                  variant={roleFilter === "user" ? "default" : "outline"}
                  onClick={() => setRoleFilter("user")}
                  size="sm"
                  className={roleFilter === "user" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Users ({userCount})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              User Accounts ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {searchTerm || roleFilter !== "all" ? "No Users Found" : "No Users Yet"}
                </h3>
                <p className="text-neutral-600">
                  {searchTerm || roleFilter !== "all" 
                    ? "Try adjusting your search criteria or filters."
                    : "No users have registered on the platform yet."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow key={`${user.id || user.uid || user._id || user.email}-${index}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="w-10 h-10 mr-3">
                              <AvatarImage src={user.photoURL} alt={user.displayName} />
                              <AvatarFallback>
                                {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.displayName || "Unknown"}</div>
                              <div className="text-sm text-neutral-500">
                                ID: {user.id?.substring(0, 8) || user.uid?.substring(0, 8) || "N/A"}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role, user.isFraud)}</TableCell>
                        <TableCell>{user.createdAt ? formatDate(user.createdAt) : "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!user.isFraud && user.role !== "admin" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateRole(user.id || user.uid || user._id, "admin")}
                                  disabled={updateRoleMutation.isPending}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Crown className="w-3 h-3 mr-1" />
                                  Admin
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateRole(user.id || user.uid || user._id, "agent")}
                                  disabled={updateRoleMutation.isPending}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Agent
                                </Button>
                              </>
                            )}
                            
                            {user.role === "agent" && !user.isFraud && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkFraud(user.id || user.uid || user._id)}
                                disabled={markFraudMutation.isPending}
                                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Mark Fraud
                              </Button>
                            )}
                            
                            {user.role !== "admin" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(user.id || user.uid || user._id)}
                                disabled={deleteUserMutation.isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert for Fraud Users */}
        {fraudCount > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-yellow-700">⚠️ Security Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800">
                  There {fraudCount === 1 ? 'is' : 'are'} currently <strong>{fraudCount}</strong> user{fraudCount !== 1 ? 's' : ''} flagged as fraudulent. 
                  These users have restricted access and their properties are hidden from public listings.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
