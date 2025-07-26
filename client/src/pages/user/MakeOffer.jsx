import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { MapPin, DollarSign, User, CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

const MakeOffer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const property = location.state?.property;

  const [offerAmount, setOfferAmount] = useState('');
  const [buyingDate, setBuyingDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!property) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
            <p className="text-gray-600 mb-6">
              No property information available. Please go back to your wishlist.
            </p>
            <Button onClick={() => navigate('/dashboard/wishlist')}>
              Back to Wishlist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmitOffer = async () => {
    // Role validation - Only users can buy properties
    if (user.role !== 'user') {
      toast({
        title: "Access Denied",
        description: "Only regular users can purchase properties. Agents and admins cannot buy properties.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!offerAmount || isNaN(offerAmount)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid offer amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(offerAmount);
    const minPrice = property.minPrice || 0;
    const maxPrice = property.maxPrice || Infinity;

    if (amount < minPrice || amount > maxPrice) {
      toast({
        title: "Invalid Offer Amount",
        description: `Offer amount must be between $${minPrice.toLocaleString()} and $${maxPrice.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (!buyingDate) {
      toast({
        title: "Validation Error",
        description: "Please select a buying date",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/offers', {
        propertyId: property.propertyId || property._id,
        propertyTitle: property.propertyTitle || property.title,
        propertyLocation: property.propertyLocation || property.location,
        propertyImage: property.propertyImage || property.image,
        agentName: property.agentName,
        agentEmail: property.agentEmail,
        buyerEmail: user.email,
        buyerName: user.displayName || user.email,
        offeredAmount: amount,
        buyingDate: buyingDate.toISOString(),
        status: 'pending'
      });

      toast({
        title: "Success",
        description: "Your offer has been submitted successfully",
      });

      navigate('/dashboard/user/property-bought');
    } catch (error) {
      console.error('Error submitting offer:', error);
      
      // Handle duplicate offer error specifically
      if (error.response?.data?.code === 'DUPLICATE_OFFER') {
        toast({
          title: "Already Offered",
          description: "You already have an active offer for this property. If the agent accepts an offer for a specific property, other offers for that property will be rejected automatically.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.error || error.response?.data?.message || "Failed to submit offer",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard/wishlist')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Wishlist
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">Make an Offer</h1>
          <p className="text-gray-600 mt-2">Submit your offer for this property</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Review the property information before making your offer
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <img
                src={property.propertyImage || property.image}
                alt={property.propertyTitle || property.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-lg">
                  {property.propertyTitle || property.title}
                </h3>
                <Badge variant={property.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                  {property.verificationStatus}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{property.propertyLocation || property.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">{property.priceRange}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>Agent: <span className="font-medium">{property.agentName}</span></span>
              </div>
            </div>
            
            <Separator />
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Price Range Guidelines</h4>
              <p className="text-sm text-blue-800">
                Your offer must be within the specified price range: <strong>{property.priceRange}</strong>
              </p>
              {property.minPrice && property.maxPrice && (
                <p className="text-sm text-blue-800 mt-1">
                  Min: ${property.minPrice.toLocaleString()} - Max: ${property.maxPrice.toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offer Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Offer</CardTitle>
            <CardDescription>
              Fill out the details for your property offer
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyTitle">Property Title</Label>
                <Input
                  id="propertyTitle"
                  value={property.propertyTitle || property.title}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="propertyLocation">Property Location</Label>
                <Input
                  id="propertyLocation"
                  value={property.propertyLocation || property.location}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="agentName">Agent Name</Label>
              <Input
                id="agentName"
                value={property.agentName}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyerEmail">Buyer Email</Label>
                <Input
                  id="buyerEmail"
                  value={user.email}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="buyerName">Buyer Name</Label>
                <Input
                  id="buyerName"
                  value={user.displayName || user.email}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="offerAmount">Offer Amount ($)</Label>
              <Input
                id="offerAmount"
                type="number"
                placeholder="Enter your offer amount"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="mt-1"
                min={property.minPrice || 0}
                max={property.maxPrice || undefined}
              />
              {property.minPrice && property.maxPrice && (
                <p className="text-sm text-gray-500 mt-1">
                  Valid range: ${property.minPrice.toLocaleString()} - ${property.maxPrice.toLocaleString()}
                </p>
              )}
            </div>
            
            <div>
              <Label>Buying Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !buyingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {buyingDate ? format(buyingDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={buyingDate}
                    onSelect={setBuyingDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Separator />
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">Important Notes</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Your offer will be sent to the property agent for review</li>
                <li>• You will be notified when the agent responds to your offer</li>
                <li>• Only verified properties can be purchased</li>
                <li>• Offers must be within the specified price range</li>
              </ul>
            </div>
            
            <Button
              onClick={handleSubmitOffer}
              disabled={isSubmitting || !offerAmount || !buyingDate}
              className="w-full"
            >
              {isSubmitting ? 'Submitting Offer...' : 'Submit Offer'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MakeOffer;