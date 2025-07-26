import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Trash2, Star, User, Calendar } from "lucide-react";
import apiClient from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ManageReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all reviews
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const response = await apiClient.get('/api/reviews');
      return response.data;
    }
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId) => {
      const response = await apiClient.delete(`/api/reviews/${reviewId}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Review Deleted",
        description: "The review has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteReview = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-accent fill-accent' : 'text-neutral-300'}`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter reviews based on search
  const filteredReviews = reviews.filter(review => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      review.userName?.toLowerCase().includes(searchLower) ||
      review.propertyTitle?.toLowerCase().includes(searchLower) ||
      review.description?.toLowerCase().includes(searchLower) ||
      review.agentName?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const fiveStarReviews = reviews.filter(r => r.rating === 5).length;
  const recentReviews = reviews.filter(r => {
    const reviewDate = new Date(r.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reviewDate > weekAgo;
  }).length;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Failed to load reviews</p>
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
            Manage Reviews
          </h1>
          <p className="text-lg text-neutral-600">
            Monitor and moderate user reviews across the platform
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : totalReviews}
                  </div>
                  <div className="text-neutral-600">Total Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : averageRating}
                  </div>
                  <div className="text-neutral-600">Average Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : fiveStarReviews}
                  </div>
                  <div className="text-neutral-600">5-Star Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : recentReviews}
                  </div>
                  <div className="text-neutral-600">This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search reviews by user, property, content, or agent..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reviews Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">
              All Reviews ({filteredReviews.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <MessageSquare className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {searchTerm ? "No Reviews Found" : "No Reviews Yet"}
                </h3>
                <p className="text-neutral-600">
                  {searchTerm 
                    ? "Try adjusting your search criteria."
                    : "No reviews have been submitted on the platform yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-neutral-600">{review.rating}.0</span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deleteReviewMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <blockquote className="text-neutral-700 mb-4 leading-relaxed line-clamp-3">
                      "{review.description}"
                    </blockquote>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Avatar className="w-8 h-8 mr-3">
                          <AvatarImage src={review.userImage} alt={review.userName} />
                          <AvatarFallback>
                            {review.userName?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{review.userName}</div>
                          <div className="text-xs text-neutral-500">Reviewer</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-neutral-600">
                        <div className="font-medium">Property: {review.propertyTitle}</div>
                        <div>Agent: {review.agentName}</div>
                      </div>
                      
                      <div className="text-xs text-neutral-500 border-t pt-2">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(review => review.rating === rating).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="flex items-center w-16">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-500 ml-1" />
                      </div>
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-neutral-600 w-16 text-right">
                        {count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
