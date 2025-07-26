import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MapPin, DollarSign, User, CheckCircle, XCircle, Eye, Building, Clock } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import api from '../../lib/api';

const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAllProperties();
  }, []);

  const fetchAllProperties = async () => {
    try {
      const response = await api.get('/api/properties/admin/all');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (propertyId, action) => {
    setProcessingId(propertyId);
    try {
      await api.patch(`/api/properties/verify/${propertyId}`, { 
        status: action 
      });
      
      // Update local state
      setProperties(properties.map(property => 
        property._id === propertyId 
          ? { ...property, verificationStatus: action }
          : property
      ));
      
      toast({
        title: "Success",
        description: `Property ${action} successfully`,
      });
    } catch (error) {
      console.error(`Error ${action} property:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} property`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    setProcessingId(propertyId);
    try {
      await api.delete(`/properties/delete/${propertyId}`);
      setProperties(properties.filter(prop => prop._id !== propertyId));
      
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'verified': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'verified': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filterPropertiesByStatus = (status) => {
    return properties.filter(property => property.verificationStatus === status);
  };

  const PropertyCard = ({ property }) => (
    <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-4 gap-0">
          {/* Property Image */}
          <div className="lg:col-span-1">
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-48 lg:h-full object-cover"
            />
          </div>
          
          {/* Property Details */}
          <div className="lg:col-span-2 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl">{property.title}</h3>
                <Badge variant={getStatusBadgeVariant(property.verificationStatus)}>
                  {property.verificationStatus}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{property.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Agent: {property.agentName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-green-600">
                    {property.priceRange}
                  </span>
                </div>
                
                {property.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {property.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {property.bedrooms && (
                    <span>{property.bedrooms} beds</span>
                  )}
                  {property.bathrooms && (
                    <span>{property.bathrooms} baths</span>
                  )}
                  {property.area && (
                    <span>{property.area} sq ft</span>
                  )}
                </div>
              </div>
              
              <div className="pt-2 text-xs text-gray-500">
                Added: {new Date(property.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="lg:col-span-1 p-6 bg-gray-50 flex flex-col justify-center">
            <div className="space-y-3">
              <div className="text-center">
                <div className={`text-lg font-semibold ${getStatusColor(property.verificationStatus)}`}>
                  {property.verificationStatus.charAt(0).toUpperCase() + property.verificationStatus.slice(1)}
                </div>
                
                {property.isAdvertised && (
                  <Badge variant="default" className="mt-2">
                    Advertised
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => window.open(`/property/${property._id}`, '_blank')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                
                {property.verificationStatus === 'pending' && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                          disabled={processingId === property._id}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Verify Property</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to verify "{property.title}"? This will make it visible to all users.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleVerificationAction(property._id, 'verified')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Verify Property
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={processingId === property._id}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Property</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject this property? This action can be reversed later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleVerificationAction(property._id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Reject Property
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                
                {property.verificationStatus === 'rejected' && (
                  <Button
                    onClick={() => handleVerificationAction(property._id, 'verified')}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                    disabled={processingId === property._id}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Properties</h1>
          <p className="text-gray-600 mt-2">Review and manage all property listings</p>
        </div>
        
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingProperties = filterPropertiesByStatus('pending');
  const verifiedProperties = filterPropertiesByStatus('verified');
  const rejectedProperties = filterPropertiesByStatus('rejected');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Properties</h1>
        <p className="text-gray-600 mt-2">
          {properties.length} total properties • {pendingProperties.length} pending review
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {properties.length}
            </div>
            <div className="text-sm text-gray-600">Total Properties</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pendingProperties.length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {verifiedProperties.length}
            </div>
            <div className="text-sm text-gray-600">Verified</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {rejectedProperties.length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No properties found</h2>
            <p className="text-gray-600">Properties added by agents will appear here for review</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              All ({properties.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingProperties.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verified ({verifiedProperties.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedProperties.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {pendingProperties.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No pending properties</h2>
                  <p className="text-gray-600">All properties have been reviewed</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pendingProperties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="verified" className="space-y-6">
            {verifiedProperties.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No verified properties</h2>
                  <p className="text-gray-600">Verified properties will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {verifiedProperties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            {rejectedProperties.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No rejected properties</h2>
                  <p className="text-gray-600">Rejected properties will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {rejectedProperties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ManageProperties;