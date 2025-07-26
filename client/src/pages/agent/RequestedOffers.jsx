import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { MapPin, DollarSign, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import api from '../../lib/api';

const RequestedOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOffer, setProcessingOffer] = useState(null);

  useEffect(() => {
    fetchAgentOffers();
  }, []);

  const fetchAgentOffers = async () => {
    try {
      const response = await api.get(`/offers/agent/${user.email}`);
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching agent offers:', error);
      toast({
        title: "Error",
        description: "Failed to load offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOfferAction = async (offerId, action) => {
    setProcessingOffer(offerId);
    try {
      await api.patch(`/offers/respond/${offerId}`, { status: action });
      
      // Update local state
      setOffers(offers.map(offer => 
        offer._id === offerId 
          ? { ...offer, status: action }
          : offer
      ));
      
      toast({
        title: "Success",
        description: `Offer ${action} successfully`,
      });
    } catch (error) {
      console.error(`Error ${action} offer:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} offer`,
        variant: "destructive",
      });
    } finally {
      setProcessingOffer(null);
    }
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
          <h1 className="text-3xl font-bold">Requested Offers</h1>
          <p className="text-gray-600 mt-2">Manage offers from potential buyers</p>
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
          <h1 className="text-3xl font-bold">Requested Offers</h1>
          <p className="text-gray-600 mt-2">
            {offers.length} {offers.length === 1 ? 'offer' : 'offers'} received
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-semibold">{offers.filter(o => o.status === 'pending').length}</span>
          <span className="text-sm text-gray-600">pending</span>
        </div>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No offers received yet</h2>
            <p className="text-gray-600 mb-6">
              Offers from potential buyers will appear here
            </p>
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
                <div className="text-sm text-gray-600">Sold</div>
              </CardContent>
            </Card>
          </div>

          {/* Offers List */}
          <div className="grid gap-6">
            {offers.map((offer) => (
              <Card key={offer._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    
                    {/* Offer Details */}
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
                            <span className="text-gray-700">Buyer: {offer.buyerName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-bold text-2xl text-green-600">
                              ${offer.offeredAmount.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              Buying Date: {new Date(offer.buyingDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(offer.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Buyer Email: {offer.buyerEmail}
                          </p>
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
                        </div>
                        
                        {offer.status === 'pending' && (
                          <div className="space-y-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className="w-full bg-green-600 hover:bg-green-700"
                                  disabled={processingOffer === offer._id}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Accept
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Accept Offer</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to accept this offer of ${offer.offeredAmount.toLocaleString()} for "{offer.propertyTitle}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleOfferAction(offer._id, 'accepted')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Accept Offer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={processingOffer === offer._id}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Offer</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to reject this offer? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleOfferAction(offer._id, 'rejected')}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Reject Offer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        
                        {offer.status === 'accepted' && (
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <div className="text-sm text-green-800 font-medium">
                              Waiting for payment
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              Buyer can now proceed with payment
                            </div>
                          </div>
                        )}
                        
                        {offer.status === 'bought' && offer.transactionId && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-xs text-blue-800 font-medium text-center">
                              Transaction Complete
                            </div>
                            <div className="text-xs text-blue-600 font-mono mt-1 text-center">
                              {offer.transactionId}
                            </div>
                          </div>
                        )}
                        
                        {offer.status === 'rejected' && (
                          <div className="p-3 bg-red-50 rounded-lg text-center">
                            <div className="text-sm text-red-800">
                              Offer rejected
                            </div>
                          </div>
                        )}
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

export default RequestedOffers;