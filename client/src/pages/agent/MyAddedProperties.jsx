import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Building, MapPin, DollarSign, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import api from '../../lib/api';

const MyAddedProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAgentProperties();
  }, []);

  const fetchAgentProperties = async () => {
    try {
      const response = await api.get(`/properties/agent/${user.email}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching agent properties:', error);
      toast({
        title: "Error",
        description: "Failed to load your properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    setDeletingId(propertyId);
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
      setDeletingId(null);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Added Properties</h1>
          <p className="text-gray-600 mt-2">Manage your property listings</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Added Properties</h1>
          <p className="text-gray-600 mt-2">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} listed
          </p>
        </div>
        
        <Button onClick={() => navigate('/dashboard/add-property')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No properties added yet</h2>
            <p className="text-gray-600 mb-6">
              Start by adding your first property listing
            </p>
            <Button onClick={() => navigate('/dashboard/add-property')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
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
                  {properties.filter(p => p.verificationStatus === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {properties.filter(p => p.verificationStatus === 'verified').length}
                </div>
                <div className="text-sm text-gray-600">Verified</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {properties.filter(p => p.verificationStatus === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </CardContent>
            </Card>
          </div>

          {/* Properties List */}
          <div className="grid gap-6">
            {properties.map((property) => (
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
                            onClick={() => navigate(`/property-details/${property._id}`)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          
                          <Button
                            onClick={() => navigate(`/dashboard/edit-property/${property._id}`)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={property.verificationStatus === 'verified'}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deletingId === property._id}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{property.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProperty(property._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deletingId === property._id ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAddedProperties;