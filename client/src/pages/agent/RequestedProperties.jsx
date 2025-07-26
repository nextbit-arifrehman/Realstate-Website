import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, DollarSign, MapPin, User, Mail, Calendar } from "lucide-react";
import apiClient from "../../lib/api";
import { useToast } from "@/hooks/use-toast";

export default function RequestedProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch offers for agent's properties
  const { data: offers = [], isLoading, error } = useQuery({
    queryKey: ['/api/offers/agent/requested-properties', user?.uid],
    queryFn: async () => {
      const response = await apiClient.get('/api/offers/agent/requested-properties');
      return response.data;
    },
    enabled: !!user?.uid,
  });

  // Accept offer mutation
  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId) => {
      const response = await apiClient.patch(`/api/offers/agent/accept/${offerId}`, { action: 'accept' });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Offer Accepted",
        description: "The offer has been accepted successfully. Other offers for this property have been automatically rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/offers/agent/requested-properties', user?.uid] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept offer.",
        variant: "destructive",
      });
    }
  });

  // Reject offer mutation
  const rejectOfferMutation = useMutation({
    mutationFn: async (offerId) => {
      const response = await apiClient.patch(`/api/offers/agent/reject/${offerId}`, { action: 'reject' });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Offer Rejected",
        description: "The offer has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/offers/agent/requested-properties', user?.uid] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject offer.",
        variant: "destructive",
      });
    }
  });

  const handleAcceptOffer = (offerId) => {
    if (window.confirm("Are you sure you want to accept this offer? This will automatically reject all other offers for this property.")) {
      acceptOfferMutation.mutate(offerId);
    }
  };

  const handleRejectOffer = (offerId) => {
    if (window.confirm("Are you sure you want to reject this offer?")) {
      rejectOfferMutation.mutate(offerId);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "bought":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sold
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group offers by property
  const offersByProperty = offers.reduce((acc, offer) => {
    const propertyId = offer.propertyId;
    if (!acc[propertyId]) {
      acc[propertyId] = {
        propertyTitle: offer.propertyTitle,
        propertyLocation: offer.propertyLocation,
        offers: []
      };
    }
    acc[propertyId].offers.push(offer);
    return acc;
  }, {});

  // Calculate statistics
  const pendingOffers = offers.filter(offer => offer.status === "pending");
  const acceptedOffers = offers.filter(offer => offer.status === "accepted");
  const totalOffersValue = offers.reduce((sum, offer) => sum + offer.offeredAmount, 0);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Failed to load property offers</p>
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
            Requested Properties
          </h1>
          <p className="text-lg text-neutral-600">
            Manage incoming offers for your properties
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : offers.length}
                  </div>
                  <div className="text-neutral-600">Total Offers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : pendingOffers.length}
                  </div>
                  <div className="text-neutral-600">Pending Review</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : acceptedOffers.length}
                  </div>
                  <div className="text-neutral-600">Accepted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalOffersValue)}
                  </div>
                  <div className="text-neutral-600">Total Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Offers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Property Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Offers Yet</h3>
                <p className="text-neutral-600">
                  You haven't received any offers for your properties yet. Keep your listings active and competitive!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(offersByProperty).map(([propertyId, propertyData]) => (
                  <div key={propertyId} className="border border-neutral-200 rounded-lg p-4">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg text-neutral-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                        {propertyData.propertyTitle}
                      </h3>
                      <p className="text-neutral-600">{propertyData.propertyLocation}</p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {propertyData.offers.length} offer{propertyData.offers.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Buyer Name</TableHead>
                            <TableHead>Buyer Email</TableHead>
                            <TableHead>Offered Price</TableHead>
                            <TableHead>Offer Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {propertyData.offers.map((offer) => (
                            <TableRow key={offer._id}>
                              <TableCell className="font-medium">{offer.buyerName}</TableCell>
                              <TableCell>{offer.buyerEmail}</TableCell>
                              <TableCell className="font-semibold text-green-600">
                                {formatCurrency(offer.offeredAmount)}
                              </TableCell>
                              <TableCell>{formatDate(offer.createdAt)}</TableCell>
                              <TableCell>{getStatusBadge(offer.status)}</TableCell>
                              <TableCell>
                                {offer.status === "pending" ? (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAcceptOffer(offer._id)}
                                      disabled={acceptOfferMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectOffer(offer._id)}
                                      disabled={rejectOfferMutation.isPending}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-neutral-500">No actions available</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {pendingOffers.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg flex-1 min-w-48">
                  <h4 className="font-medium text-yellow-900 mb-2">Pending Offers</h4>
                  <p className="text-2xl font-bold text-yellow-600 mb-1">{pendingOffers.length}</p>
                  <p className="text-sm text-yellow-700">Need your attention</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg flex-1 min-w-48">
                  <h4 className="font-medium text-green-900 mb-2">Highest Offer</h4>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(Math.max(...offers.map(o => o.offeredAmount), 0))}
                  </p>
                  <p className="text-sm text-green-700">Among all offers</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg flex-1 min-w-48">
                  <h4 className="font-medium text-blue-900 mb-2">Response Rate</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {offers.length > 0 ? Math.round(((offers.length - pendingOffers.length) / offers.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-blue-700">Offers responded to</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
