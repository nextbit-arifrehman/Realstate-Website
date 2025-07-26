import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { MapPin, DollarSign, User, Star, Eye, TrendingUp } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import api from '../../lib/api';

const AdvertiseProperty = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchVerifiedProperties();
  }, []);

  const fetchVerifiedProperties = async () => {
    try {
      const response = await api.get('/api/properties/public');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching verified properties:', error);
      toast({
        title: "Error",
        description: "Failed to load verified properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvertiseToggle = async (propertyId, currentStatus) => {
    setProcessingId(propertyId);
    try {
      const newStatus = !currentStatus;
      await api.patch(`/api/properties/admin/advertise/${propertyId}`, { 
        isAdvertised: newStatus 
      });
      
      // Update local state
      setProperties(properties.map(property => 
        property._id === propertyId 
          ? { ...property, isAdvertised: newStatus }
          : property
      ));
      
      toast({
        title: "Success",
        description: `Property ${newStatus ? 'added to' : 'removed from'} advertisements`,
      });
    } catch (error) {
      console.error('Error toggling advertisement:', error);
      toast({
        title: "Error",
        description: "Failed to update advertisement status",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Advertise Property</h1>
          <p className="text-gray-600 mt-2">Manage featured property advertisements</p>
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

  const advertisedProperties = properties.filter(p => p.isAdvertised);
  const availableProperties = properties.filter(p => !p.isAdvertised);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advertise Property</h1>
        <p className="text-gray-600 mt-2">
          {properties.length} verified properties • {advertisedProperties.length} currently advertised
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {properties.length}
            </div>
            <div className="text-sm text-gray-600">Verified Properties</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {advertisedProperties.length}
            </div>
            <div className="text-sm text-gray-600">Advertised</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {availableProperties.length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {advertisedProperties.length > 0 ? Math.round((advertisedProperties.length / properties.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Advertisement Rate</div>
          </CardContent>
        </Card>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No verified properties found</h2>
            <p className="text-gray-600">Only verified properties can be advertised. Please verify some properties first.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Currently Advertised Properties */}
          {advertisedProperties.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className="text-2xl font-bold">Currently Advertised ({advertisedProperties.length})</h2>
              </div>
              
              <div className="grid gap-6">
                {advertisedProperties.map((property) => (
                  <Card key={property._id} className="overflow-hidden border-yellow-200 bg-yellow-50/50">
                    <CardContent className="p-0">
                      <div className="grid lg:grid-cols-4 gap-0">
                        {/* Property Image */}
                        <div className="lg:col-span-1 relative">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-48 lg:h-full object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-yellow-500 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Property Details */}
                        <div className="lg:col-span-2 p-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-xl">{property.title}</h3>
                              <Badge variant="default" className="bg-green-600">
                                Verified
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
                                <span className="font-semibold text-green-600 text-lg">
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
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="lg:col-span-1 p-6 bg-yellow-50 flex flex-col justify-center">
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-yellow-700 mb-2">
                                Featured
                              </div>
                              
                              <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-sm">Advertisement</span>
                                <Switch
                                  checked={true}
                                  onCheckedChange={() => handleAdvertiseToggle(property._id, true)}
                                  disabled={processingId === property._id}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Button
                                onClick={() => window.open(`/property/${property._id}`, '_blank')}
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={processingId === property._id}
                                  >
                                    Remove from Ads
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Advertisement</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove "{property.title}" from advertisements? It will no longer be featured on the homepage.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleAdvertiseToggle(property._id, true)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove from Ads
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

          {/* Available Properties for Advertisement */}
          {availableProperties.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h2 className="text-2xl font-bold">Available for Advertisement ({availableProperties.length})</h2>
              </div>
              
              <div className="grid gap-6">
                {availableProperties.map((property) => (
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
                              <Badge variant="default" className="bg-green-600">
                                Verified
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
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-600 mb-2">
                                Not Advertised
                              </div>
                              
                              <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-sm">Advertisement</span>
                                <Switch
                                  checked={false}
                                  onCheckedChange={() => handleAdvertiseToggle(property._id, false)}
                                  disabled={processingId === property._id}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Button
                                onClick={() => window.open(`/property/${property._id}`, '_blank')}
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              
                              <Button
                                onClick={() => handleAdvertiseToggle(property._id, false)}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="sm"
                                disabled={processingId === property._id}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Add to Ads
                              </Button>
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

          {advertisedProperties.length === 0 && availableProperties.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No properties available</h2>
                <p className="text-gray-600">All verified properties are currently being advertised.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvertiseProperty;