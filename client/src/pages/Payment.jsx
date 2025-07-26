import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, CreditCard, MapPin, User, CheckCircle, AlertCircle, DollarSign, Calendar } from "lucide-react";
import api from "../lib/api";
import { useToast } from "../hooks/use-toast";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ offer, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard/user/property-bought",
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded, update the offer status
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center mb-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-900">Secure Payment</h4>
        </div>
        <p className="text-sm text-blue-700">
          Your payment information is encrypted and secure. This transaction will complete your property purchase.
        </p>
      </div>
      
      <PaymentElement />
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {isProcessing ? 'Processing Payment...' : `Pay $${(offer.offeredAmount || 0).toLocaleString()}`}
      </Button>
    </form>
  );
};

export default function Payment() {
  const { offerId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Check if Stripe is properly configured
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Payment System Not Configured</h3>
            <p className="text-neutral-600 mb-4">
              Payment processing is not available at this time. Please contact support.
            </p>
            <Button onClick={() => navigate("/dashboard/user/property-bought")}>
              Back to My Offers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch offer details
  const { data: offers = [], isLoading: offerLoading, error: offerError } = useQuery({
    queryKey: ['/api/offers/my-offers'],
    queryFn: async () => {
      const response = await api.get('/api/offers/my-offers');
      return response.data;
    },
    enabled: !!user?.id,
  });

  const offer = offers.find(o => o._id === offerId);

  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/payment/create-payment-intent', data);
      return response.data;
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast({
        title: "Payment Setup Failed",
        description: error.response?.data?.error || "Failed to initialize payment",
        variant: "destructive",
      });
    }
  });

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/payment/confirm-payment', data);
      return response.data;
    },
    onSuccess: () => {
      setPaymentSuccess(true);
      toast({
        title: "Payment Successful",
        description: "Your property purchase has been completed!",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Confirmation Failed",
        description: error.response?.data?.error || "Failed to confirm payment",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (offer && offer.status === 'accepted' && !clientSecret) {
      createPaymentIntentMutation.mutate({
        amount: offer.offeredAmount,
        offerId: offer._id
      });
    }
  }, [offer, clientSecret]);

  const handlePaymentSuccess = (paymentIntentId) => {
    confirmPaymentMutation.mutate({
      paymentIntentId,
      offerId: offer._id
    });
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (offerError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Payment Error</h3>
            <p className="text-neutral-600 mb-4">Failed to load offer details.</p>
            <Button onClick={() => navigate("/dashboard/user/property-bought")}>
              Back to My Offers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (offerLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Offer Not Found</h3>
            <p className="text-neutral-600 mb-4">The offer you're trying to pay for doesn't exist.</p>
            <Button onClick={() => navigate("/dashboard/user/property-bought")}>
              Back to My Offers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (offer.status !== 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Payment Not Available</h3>
            <p className="text-neutral-600 mb-4">
              This offer is currently {offer.status}. Only accepted offers can be paid for.
            </p>
            <Button onClick={() => navigate("/dashboard/user/property-bought")}>
              Back to My Offers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">Payment Successful!</h3>
            <p className="text-neutral-600 mb-4">
              Your property purchase has been completed. You will receive a confirmation email shortly.
            </p>
            <Button onClick={() => navigate("/dashboard/user/property-bought")}>
              View My Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/user/property-bought")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Offers
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">Complete Payment</h1>
            <p className="text-neutral-600 mt-2">Finalize your property purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property & Offer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Property Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <img
                  src={offer.propertyImage}
                  alt={offer.propertyTitle}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-xl mb-2">{offer.propertyTitle}</h3>
                  <Badge variant="default" className="mb-2">
                    Accepted Offer
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span className="text-neutral-700">{offer.propertyLocation}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-500" />
                    <span className="text-neutral-700">Agent: {offer.agentName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <span className="text-neutral-700">
                      Purchase Date: {formatDate(offer.buyingDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-neutral-500" />
                    <span className="font-semibold text-green-600">
                      {formatCurrency(offer.offeredAmount)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Purchase Details</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Property Price:</span>
                    <span className="font-medium">{formatCurrency(offer.offeredAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span className="font-medium">$0</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(offer.offeredAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm offer={offer} onSuccess={handlePaymentSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}