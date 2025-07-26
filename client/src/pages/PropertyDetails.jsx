import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Star, MapPin, DollarSign, User, Calendar, Heart } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import api from '../lib/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  useEffect(() => {
    console.log('PropertyDetails useParams:', { id });
    if (id) {
      fetchPropertyDetails();
      fetchPropertyReviews();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    if (!id) {
      console.error('Property ID is undefined');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching property details for ID:', id);
      const response = await api.get(`/api/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyReviews = async () => {
    try {
      const response = await api.get(`/api/reviews/property/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to add properties to wishlist",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'user') {
      toast({
        title: "Access Denied",
        description: "Only users can add properties to wishlist",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToWishlist(true);
    try {
      await api.post('/api/wishlist', {
        propertyId: property._id || property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        propertyImage: property.image || property.images?.[0],
        agentName: property.agentName,
        agentEmail: property.agentEmail,
        userEmail: user.email
      });
      
      toast({
        title: "Success",
        description: "Property added to wishlist successfully",
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add to wishlist",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleAddReview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to add reviews",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'user') {
      toast({
        title: "Access Denied",
        description: "Only users can add reviews",
        variant: "destructive",
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a review",
        variant: "destructive",
      });
      return;
    }

    setIsAddingReview(true);
    try {
      const response = await api.post('/api/reviews', {
        propertyId: property._id,
        propertyTitle: property.title,
        agentName: property.agentName,
        reviewerName: user.displayName || user.email,
        reviewerEmail: user.email,
        reviewerImage: user.photoURL || '/default-avatar.png',
        reviewText: reviewText,
        rating: rating
      });

      setReviews([response.data, ...reviews]);
      setReviewText('');
      setRating(5);
      
      toast({
        title: "Success",
        description: "Review added successfully",
      });
    } catch (error) {
      console.error('Error adding review:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add review",
        variant: "destructive",
      });
    } finally {
      setIsAddingReview(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
            <p className="text-gray-600">The requested property could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Property Header */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div>
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={property.verificationStatus === 'verified' ? 'default' : 'secondary'}>
              {property.verificationStatus}
            </Badge>
            {property.isAdvertised && (
              <Badge variant="outline">Featured</Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-lg">{property.location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-semibold">{property.priceRange}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <span>Agent: <span className="font-medium">{property.agentName}</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>Listed: {new Date(property.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist || user.role !== 'user'}
              className="w-full"
              variant="outline"
            >
              <Heart className="w-4 h-4 mr-2" />
              {isAddingToWishlist ? 'Adding...' : 'Add to Wishlist'}
            </Button>
            
            {user.role !== 'user' && (
              <p className="text-sm text-gray-500 text-center">
                Only users can add properties to wishlist
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Property Description */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Property Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {property.description || 'This is a beautiful property in a prime location. Perfect for those looking for a modern living space with excellent amenities and connectivity. The property offers great value and is ideal for both investment and personal use.'}
          </p>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Property Reviews</CardTitle>
            <CardDescription>
              See what others are saying about this property
            </CardDescription>
          </div>
          
          {user.role === 'user' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Your Review</DialogTitle>
                  <DialogDescription>
                    Share your thoughts about this property
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setRating(i + 1)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="review">Your Review</Label>
                    <Textarea
                      id="review"
                      placeholder="Write your review here..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    onClick={handleAddReview}
                    disabled={isAddingReview}
                    className="w-full"
                  >
                    {isAddingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. Be the first to review this property!
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.reviewerImage || '/default-avatar.png'}
                      alt={review.reviewerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{review.reviewerName}</h4>
                        <div className="flex gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.reviewTime).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-700">{review.reviewText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetails;