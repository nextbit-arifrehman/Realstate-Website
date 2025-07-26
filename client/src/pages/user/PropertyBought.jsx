import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { MapPin, DollarSign, User, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import api from '../../lib/api';

const PropertyBought = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    fetchUserOffers();
  }, []);

  const fetchUserOffers = async () => {
    try {
      const response = await api.get('/api/offers/my-offers');
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching user offers:', error);
      toast({
        title: "Error",
        description: "Failed to load your property offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (offer) => {
    navigate(`/payment/${offer._id}`);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'bought': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'accepted': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'bought': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Property Bought</h1>
          <p className="text-gray-600 mt-2">Track your property offers and purchases</p>
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
          <h1 className="text-3xl font-bold">Property Bought</h1>
          <p className="text-gray-600 mt-2">
            {offers.length} {offers.length === 1 ? 'offer' : 'offers'} submitted
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-semibold">{offers.length}</span>
        </div>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No offers submitted yet</h2>
            <p className="text-gray-600 mb-6">
              Start by adding properties to your wishlist and making offers
            </p>
            <Button onClick={() => navigate('/all-properties')}>
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {offers.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {offers.filter(o => o.status === 'accepted').length}
                </div>
                <div className="text-sm text-gray-600">Accepted</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {offers.filter(o => o.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {offers.filter(o => o.status === 'bought').length}
                </div>
                <div className="text-sm text-gray-600">Bought</div>
              </CardContent>
            </Card>
          </div>

          {/* Offers List */}
          <div className="grid gap-6">
            {offers.map((offer) => (
              <Card key={offer._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-4 gap-0">
                    {/* Property Image */}
                    <div className="lg:col-span-1">
                      <img
                        src={offer.propertyImage}
                        alt={offer.propertyTitle}
                        className="w-full h-48 lg:h-full object-cover"
                      />
                    </div>
                    
                    {/* Property Details */}
                    <div className="lg:col-span-2 p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-xl">{offer.propertyTitle}</h3>
                          <Badge variant={getStatusBadgeVariant(offer.status)}>
                            {offer.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{offer.propertyLocation}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">Agent: {offer.agentName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-green-600">
                              ${(offer.offeredAmount || 0).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              Buying Date: {new Date(offer.buyingDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pt-2 text-sm text-gray-500">
                          Submitted: {new Date(offer.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="lg:col-span-1 p-6 bg-gray-50 flex flex-col justify-center">
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getStatusColor(offer.status)}`}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </div>
                          
                          {offer.status === 'accepted' && (
                            <Button
                              onClick={() => handlePayment(offer)}
                              disabled={processingPayment === offer._id}
                              className="w-full mt-3"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              {processingPayment === offer._id ? 'Processing...' : 'Pay Now'}
                            </Button>
                          )}
                          
                          {offer.status === 'bought' && offer.transactionId && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <div className="text-xs text-green-800 font-medium">
                                Transaction ID
                              </div>
                              <div className="text-xs text-green-600 font-mono">
                                {offer.transactionId}
                              </div>
                            </div>
                          )}
                          
                          {offer.status === 'pending' && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                              <div className="text-xs text-yellow-800">
                                Waiting for agent response
                              </div>
                            </div>
                          )}
                          
                          {offer.status === 'rejected' && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg">
                              <div className="text-xs text-red-800">
                                Offer was declined
                              </div>
                            </div>
                          )}
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

export default PropertyBought;