import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Upload, DollarSign, MapPin, Home, Image } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import api from '../../lib/api';

const AddProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    image: '',
    minPrice: '',
    maxPrice: '',
    priceRange: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    area: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generate price range when min/max prices change
    if (name === 'minPrice' || name === 'maxPrice') {
      const min = name === 'minPrice' ? value : formData.minPrice;
      const max = name === 'maxPrice' ? value : formData.maxPrice;
      
      if (min && max) {
        setFormData(prev => ({
          ...prev,
          priceRange: `$${parseInt(min).toLocaleString()} - $${parseInt(max).toLocaleString()}`
        }));
      }
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll use a placeholder URL since we don't have image upload service
      // In a real app, you'd upload to a service like Cloudinary or AWS S3
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      
      toast({
        title: "Image Preview Ready",
        description: "Image has been loaded for preview. In production, this would be uploaded to cloud storage.",
      });
    }
  };

  const validateForm = () => {
    const required = ['title', 'location', 'minPrice', 'maxPrice'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    const minPrice = parseFloat(formData.minPrice);
    const maxPrice = parseFloat(formData.maxPrice);
    
    if (minPrice >= maxPrice) {
      toast({
        title: "Validation Error",
        description: "Maximum price must be greater than minimum price",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const propertyData = {
        title: formData.title,
        location: formData.location,
        description: formData.description,
        image: formData.image || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
        minPrice: parseFloat(formData.minPrice),
        maxPrice: parseFloat(formData.maxPrice),
        priceRange: formData.priceRange,
        agentName: user.displayName || user.email,
        agentEmail: user.email,
        agentUid: user.uid,
        verificationStatus: 'pending',
        isAdvertised: false,
        propertyType: formData.propertyType,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        area: formData.area ? parseInt(formData.area) : undefined
      };

      await api.post('/api/properties', propertyData);
      
      toast({
        title: "Success",
        description: "Property added successfully and is pending admin verification",
      });

      // Invalidate queries to refresh data
      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
        window.queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      }

      navigate('/dashboard/agent/my-properties');
    } catch (error) {
      console.error('Error adding property:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Property</h1>
        <p className="text-gray-600 mt-2">List a new property for sale</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the basic details about the property
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Modern Downtown Apartment"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, NY"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property features, amenities, and highlights..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select onValueChange={(value) => handleSelectChange('propertyType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing & Details
              </CardTitle>
              <CardDescription>
                Set the price range and property specifications
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPrice">Minimum Price ($) *</Label>
                  <Input
                    id="minPrice"
                    name="minPrice"
                    type="number"
                    value={formData.minPrice}
                    onChange={handleInputChange}
                    placeholder="e.g., 250000"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxPrice">Maximum Price ($) *</Label>
                  <Input
                    id="maxPrice"
                    name="maxPrice"
                    type="number"
                    value={formData.maxPrice}
                    onChange={handleInputChange}
                    placeholder="e.g., 350000"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              
              {formData.priceRange && (
                <div>
                  <Label>Generated Price Range</Label>
                  <Input
                    value={formData.priceRange}
                    readOnly
                    className="mt-1 bg-gray-50"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select onValueChange={(value) => handleSelectChange('bedrooms', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Beds" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select onValueChange={(value) => handleSelectChange('bathrooms', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Baths" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="1.5">1.5</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="2.5">2.5</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="area">Area (sq ft)</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g., 1200"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Property Image
            </CardTitle>
            <CardDescription>
              Upload a high-quality image of the property
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">Image URL (Alternative)</Label>
              <Input
                id="imageUrl"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/property-image.jpg"
                className="mt-1"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">OR</p>
              <Label htmlFor="imageFile" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </Label>
            </div>
            
            {formData.image && (
              <div className="mt-4">
                <Label>Image Preview</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Property preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent Information */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Information</CardTitle>
            <CardDescription>
              This information is automatically filled from your profile
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Agent Name</Label>
                <Input
                  value={user?.displayName || user?.email}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>
              
              <div>
                <Label>Agent Email</Label>
                <Input
                  value={user?.email}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/my-added-properties')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? 'Adding Property...' : 'Add Property'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;