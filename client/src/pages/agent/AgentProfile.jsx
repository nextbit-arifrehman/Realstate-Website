import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { User, Mail, Calendar, Shield, Edit, Building, TrendingUp } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const AgentProfile = () => {
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
        <h1 className="text-3xl font-bold">Agent Profile</h1>
        <p className="text-gray-600 mt-2">Manage your agent account information and performance</p>
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
              {user?.displayName || 'Agent'}
            </CardTitle>
            
            <CardDescription className="flex justify-center">
              <Badge variant="default" className="bg-blue-600">
                Real Estate Agent
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
              <Building className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">Real Estate Agent</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
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
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-medium">
                  <Badge variant="default">Active Agent</Badge>
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
                    <DialogTitle>Edit Agent Profile</DialogTitle>
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

        {/* Agent Performance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>
              Your real estate activity summary
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">Properties Listed</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600">Properties Sold</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-600">Pending Offers</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">$0</p>
                <p className="text-sm text-gray-600">Total Sales</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recent Activity
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Agent Tools</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Building className="w-4 h-4 mr-2" />
                  Add New Property
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Agent Information */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>
            Professional details and account status
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Authentication Methods</h4>
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
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Account Security</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verification</span>
                  <Badge variant={user?.emailVerified ? 'default' : 'destructive'}>
                    {user?.emailVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Agent Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profile Completeness</span>
                  <Badge variant="outline">
                    {user?.displayName && user?.photoURL ? '100%' : 
                     user?.displayName || user?.photoURL ? '75%' : '50%'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentProfile;