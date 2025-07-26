import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { MapPin, DollarSign, User, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import api from '../../lib/api';

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [existingOffers, setExistingOffers] = useState({});

  useEffect(() => {
    fetchWishlist();
    fetchExistingOffers();
  }, []);

  const fetchWishlist = async () => {
    try {
      // Debug: Check if user has token
      const token = localStorage.getItem('token');
      const backendToken = localStorage.getItem('backendToken');
      console.log('Fetching wishlist with tokens:', { token: !!token, backendToken: !!backendToken });
      
      const response = await api.get('/api/wishlist');
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to access your wishlist",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load wishlist",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    setRemovingId(itemId);
    try {
      await api.delete(`/api/wishlist/${itemId}`);
      setWishlistItems(wishlistItems.filter(item => item._id !== itemId));
      
      toast({
        title: "Success",
        description: "Property removed from wishlist",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove property from wishlist",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const fetchExistingOffers = async () => {
    try {
      const response = await api.get('/api/offers/my-offers');
      const offersMap = {};
      response.data.forEach(offer => {
        if (offer.status === 'pending' || offer.status === 'accepted') {
          offersMap[offer.propertyId] = offer;
        }
      });
      setExistingOffers(offersMap);
    } catch (error) {
      console.error('Error fetching existing offers:', error);
    }
  };

  const handleMakeOffer = (property) => {
    const propertyId = property.propertyId || property._id;
    const existingOffer = existingOffers[propertyId];
    
    if (existingOffer) {
      toast({
        title: "Already Offered",
        description: `You already have a ${existingOffer.status} offer for this property. If the agent accepts an offer for a specific property, other offers for that property will be rejected automatically.`,
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/make-offer/${propertyId}`, { state: { property } });
  };

  const getUserInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-gray-600 mt-2">Properties you've saved for later</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-300 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
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
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span className="text-lg font-semibold">{wishlistItems.length}</span>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Start browsing properties and add your favorites to your wishlist
            </p>
            <Button onClick={() => navigate('/all-properties')}>
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={item.propertyImage}
                  alt={item.propertyTitle}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant={item.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                    {item.verificationStatus}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1">{item.propertyTitle}</h3>
                    
                    <div className="flex items-center gap-1 text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm line-clamp-1">{item.propertyLocation}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">{item.priceRange}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={item.agentImage} alt={item.agentName} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(item.agentName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{item.agentName}</p>
                      <p className="text-xs text-gray-500">Agent</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 space-y-2">
                    {existingOffers[item.propertyId || item._id] ? (
                      <Button 
                        disabled
                        variant="secondary"
                        className="w-full"
                      >
                        Already Offered ({existingOffers[item.propertyId || item._id].status})
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleMakeOffer(item)}
                        className="w-full"
                        disabled={item.verificationStatus !== 'verified'}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Make an Offer
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveFromWishlist(item._id)}
                      disabled={removingId === item._id}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {removingId === item._id ? 'Removing...' : 'Remove'}
                    </Button>
                  </div>
                  
                  {item.verificationStatus !== 'verified' && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      This property is pending verification and cannot be purchased yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;