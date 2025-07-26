import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { User, Mail, Calendar, Shield, Edit, Settings, BarChart, Users } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const AdminProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL: photoURL.trim()
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-gray-600 mt-2">Manage your administrator account and system overview</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(user?.displayName || user?.email)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <CardTitle className="text-xl">
              {user?.displayName || 'Administrator'}
            </CardTitle>
            
            <CardDescription className="flex justify-center">
              <Badge variant="default" className="bg-red-600">
                Platform Administrator
              </Badge>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Display Name</p>
                <p className="font-medium">{user?.displayName || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">System Administrator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Admin Since</p>
                <p className="font-medium">
                  {user?.metadata?.creationTime 
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Access Level</p>
                <p className="font-medium">
                  <Badge variant="default" className="bg-red-600">Full Access</Badge>
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Admin Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information. Note: Email cannot be changed.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="photoURL">Profile Picture URL</Label>
                      <Input
                        id="photoURL"
                        type="url"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        placeholder="Enter image URL"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* System Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Platform statistics and quick access
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">Total Properties</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600">Verified Properties</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">0</p>
                <p className="text-sm text-gray-600">Pending Verification</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Quick Actions
              </h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Properties
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Privileges Card */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator Privileges</CardTitle>
          <CardDescription>
            Your administrative capabilities and access levels
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Account Management</h4>
              <div className="space-y-2">
                {user?.providerData?.map((provider, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline">
                      {provider.providerId === 'password' ? 'Email/Password' : 
                       provider.providerId === 'google.com' ? 'Google' : 
                       provider.providerId}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verification</span>
                  <Badge variant={user?.emailVerified ? 'default' : 'destructive'}>
                    {user?.emailVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin Status</span>
                  <Badge variant="default" className="bg-red-600">Active</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">System Permissions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Property Management</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Management</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Configuration</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics & Reports</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Advertisement Control</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;