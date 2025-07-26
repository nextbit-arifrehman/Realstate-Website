import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "../components/PropertyCard";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import apiClient from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function AllProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Track backend connectivity
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Fetch all verified properties
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: searchLocation ? ['/api/properties/search', { location: searchLocation }] : ['/api/properties/public'],
    queryFn: async () => {
      try {
        const url = searchLocation 
          ? `/api/properties/search?location=${encodeURIComponent(searchLocation)}`
          : '/api/properties/public';
        console.log('Fetching properties from:', url);
        console.log('Full URL being requested:', window.location.origin + url);
        
        // Add explicit headers for browser request
        const response = await apiClient.get(url, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        setBackendAvailable(true);
        console.log('Properties loaded successfully:', response.data?.length || 0, 'properties');
        console.log('Response data:', response.data);
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        console.error('Error details:', error.response?.status, error.response?.data);
        setBackendAvailable(false);
        // Return empty array to show "Data Not Available" message
        return [];
      }
    },
    retry: 3,
    retryDelay: 2000,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.warn("Backend not available:", error.message);
      setBackendAvailable(false);
    }
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (property) => {
      const response = await apiClient.post("/api/wishlist", {
        userId: user.id,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        propertyImage: property.images?.[0] || "",
        agentName: property.agentName,
        agentImage: property.agentImage,
        priceRange: property.priceRange || `${property.minPrice?.toLocaleString()} - ${property.maxPrice?.toLocaleString()}`,
        verificationStatus: property.verificationStatus
      });
      
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Added to Wishlist",
        description: "Property has been added to your wishlist successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add property to wishlist.",
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
    if (searchLocation.trim()) {
      navigate(`/properties?location=${encodeURIComponent(searchLocation)}`);
    } else {
      navigate('/properties');
    }
  };

  const handleAddToWishlist = async (property) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add properties to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== "user") {
      toast({
        title: "Access Denied",
        description: "Only users can add properties to wishlist.",
        variant: "destructive",
      });
      return;
    }

    addToWishlistMutation.mutate(property);
  };

  // Sort properties
  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.minPrice || 0) - (b.minPrice || 0);
      case "price-high":
        return (b.maxPrice || 0) - (a.maxPrice || 0);
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "default":
      default:
        return 0;
    }
  });

  if (error || !backendAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <Filter className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Backend Connection Issue
              </h3>
              <p className="text-neutral-600 mb-4">
                The properties database is temporarily unavailable. This is likely due to network connectivity issues with the backend API.
              </p>
              <div className="bg-neutral-50 p-4 rounded-lg mb-4 text-sm text-left">
                <p className="font-medium mb-2">Technical details:</p>
                <p className="text-neutral-600">
                  • Backend API: http://localhost:3001<br/>
                  • Issue: {error?.message || "Network connectivity"}<br/>
                  • Status: Authentication working, property data unavailable
                </p>
              </div>
              <p className="text-neutral-600 mb-4">
                Your login data is safely stored in MongoDB. The properties will be available once the backend connection is restored.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
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
          <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-4">
            All Properties
          </h1>
          <p className="text-lg text-neutral-600">
            Discover verified properties from trusted real estate agents
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by location..."
                    className="pl-10"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="bg-primary hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-neutral-300"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Sort By Price
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-neutral-600">
            {isLoading ? "Loading..." : `${sortedProperties.length} properties found`}
          </p>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedProperties.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Filter className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {backendAvailable ? "No Properties Available" : "Data Not Available"}
              </h3>
              <p className="text-neutral-600 mb-4">
                {backendAvailable ? (
                  searchLocation 
                    ? `No properties found matching "${searchLocation}". Try a different location.`
                    : "No verified properties are currently available in the database. Properties will appear here once agents add them and they're verified by admin."
                ) : (
                  "Property data is temporarily unavailable. The backend database connection is not working properly."
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {searchLocation && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchLocation("");
                      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
                    }}
                  >
                    Clear Search
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
                    window.location.reload();
                  }}
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onAddToWishlist={handleAddToWishlist}
                showWishlistButton={user?.role === "user"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
