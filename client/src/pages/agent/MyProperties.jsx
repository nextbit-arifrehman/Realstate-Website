import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Home, MapPin, DollarSign, Edit, Trash2, Plus, Check, Clock, XCircle, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const updatePropertySchema = z.object({
  title: z.string().min(1, "Property title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  priceRange: z.string().min(1, "Price range is required"),
  minPrice: z.string().min(1, "Minimum price is required"),
  maxPrice: z.string().min(1, "Maximum price is required"),
});

export default function MyProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProperty, setEditingProperty] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch agent's properties
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['agent-properties', user?.uid],
    queryFn: async () => {
      const response = await apiClient.get('/api/properties/agent/my-properties');
      return response.data.properties || response.data || [];
    },
    enabled: !!user?.uid,
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId) => {
      const response = await apiClient.delete(`/api/properties/${propertyId}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Property Deleted",
        description: "Property has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['agent-properties', user?.uid] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property.",
        variant: "destructive",
      });
    }
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ propertyId, formData }) => {
      const response = await apiClient.patch(`/api/properties/${propertyId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Property Updated",
        description: "Property has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['agent-properties', user?.uid] });
      // Also invalidate public properties to refresh All Properties page
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      setIsDialogOpen(false);
      setEditingProperty(null);
      setNewImages([]);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property.",
        variant: "destructive",
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(updatePropertySchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      priceRange: "",
      minPrice: "",
      maxPrice: "",
    },
  });

  const handleEdit = (property) => {
    setEditingProperty(property);
    form.reset({
      title: property.title,
      description: property.description,
      location: property.location,
      priceRange: property.priceRange,
      minPrice: property.minPrice.toString(),
      maxPrice: property.maxPrice.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 5) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      });
      return;
    }
    setNewImages(files);
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    const minPrice = parseFloat(data.minPrice);
    const maxPrice = parseFloat(data.maxPrice);

    if (minPrice >= maxPrice) {
      toast({
        title: "Invalid Price Range",
        description: "Maximum price must be greater than minimum price.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("priceRange", data.priceRange);
    formData.append("minPrice", data.minPrice);
    formData.append("maxPrice", data.maxPrice);

    // Add new images if any
    newImages.forEach((image) => {
      formData.append("images", image);
    });

    updatePropertyMutation.mutate({
      propertyId: editingProperty.id,
      formData
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-secondary text-white">
            <Check className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-accent text-white border-accent">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Failed to load properties</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-2">
              My Properties
            </h1>
            <p className="text-lg text-neutral-600">
              Manage your property listings
            </p>
          </div>
          
          <Link to="/dashboard/agent/add-property">
            <Button className="bg-primary hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Home className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Properties Listed</h3>
              <p className="text-neutral-600 mb-6">
                You haven't added any properties yet. Start by adding your first property listing.
              </p>
              <Link to="/dashboard/agent/add-property">
                <Button className="bg-primary hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img 
                    src={property.images?.[0] || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(property.verificationStatus)}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-primary">
                      {property.priceRange || `${formatCurrency(property.minPrice)} - ${formatCurrency(property.maxPrice)}`}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <p className="text-neutral-600 mb-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                    <span className="truncate">{property.location}</span>
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={property.agentImage} alt={property.agentName} />
                        <AvatarFallback>
                          {property.agentName?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-neutral-600 truncate">
                        {property.agentName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {property.verificationStatus !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(property)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(property.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                      disabled={deletePropertyMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics */}
        {properties.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Property Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{properties.length}</div>
                  <div className="text-sm text-blue-700">Total Properties</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {properties.filter(p => p.verificationStatus === "verified").length}
                  </div>
                  <div className="text-sm text-green-700">Verified</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {properties.filter(p => p.verificationStatus === "pending").length}
                  </div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {properties.filter(p => p.verificationStatus === "rejected").length}
                  </div>
                  <div className="text-sm text-red-700">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Property Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Property</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter property title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the property..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Range Display</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., $500K - $600K" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* New Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Update Property Images (Optional)
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                      <p className="text-neutral-600 text-sm">Click to upload new images</p>
                    </label>
                  </div>

                  {newImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {newImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`New ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-1 -right-1 w-5 h-5"
                            onClick={() => removeNewImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-blue-700"
                    disabled={updatePropertyMutation.isPending}
                  >
                    {updatePropertyMutation.isPending ? "Updating..." : "Update Property"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
