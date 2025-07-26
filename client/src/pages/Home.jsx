import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropertyCard from "../components/PropertyCard";
import ReviewCard from "../components/ReviewCard";
import { Search, Home as HomeIcon, Users, UserCheck, Handshake, Shield, UserCheck2, Lock, Search as SearchIcon, Headphones, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType] = useState("any");
  const [priceRange, setPriceRange] = useState("any");

  // Fetch advertised properties
  const { data: advertisedProperties = [] } = useQuery({
    queryKey: ['/api/properties/advertisements'],
  });

  // Fetch latest reviews
  const { data: latestReviews = [] } = useQuery({
    queryKey: ['/api/reviews/latest'],
  });

  const handleSearch = () => {
    if (searchLocation.trim()) {
      navigate(`/properties?location=${encodeURIComponent(searchLocation)}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="h-[600px] bg-gradient-to-r from-neutral-900/70 to-neutral-800/50 relative">
          <div 
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 to-neutral-800/60" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl">
              <h1 className="font-inter font-bold text-4xl md:text-6xl text-white mb-6 leading-tight">
                Find Your Perfect 
                <span className="text-accent"> Dream Home</span>
              </h1>
              <p className="text-xl text-neutral-200 mb-8 leading-relaxed">
                Discover thousands of verified properties from trusted agents. Your next home is just a search away.
              </p>

              {/* Search Form */}
              <Card className="p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      <Input 
                        type="text" 
                        placeholder="Enter city, neighborhood, or ZIP"
                        className="pl-10"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Property Type</label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Type</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Price Range</label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Price</SelectItem>
                        <SelectItem value="0-500000">$0 - $500K</SelectItem>
                        <SelectItem value="500000-1000000">$500K - $1M</SelectItem>
                        <SelectItem value="1000000-2000000">$1M - $2M</SelectItem>
                        <SelectItem value="2000000+">$2M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-primary text-white py-3 px-6 hover:bg-blue-700 text-lg"
                  onClick={handleSearch}
                >
                  <SearchIcon className="w-5 h-5 mr-2" />
                  Search Properties
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="text-primary text-2xl w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-neutral-900">50,000+</div>
              <div className="text-neutral-600">Properties Listed</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-secondary text-2xl w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-neutral-900">25,000+</div>
              <div className="text-neutral-600">Happy Clients</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="text-accent text-2xl w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-neutral-900">2,500+</div>
              <div className="text-neutral-600">Verified Agents</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="text-red-500 text-2xl w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-neutral-900">15,000+</div>
              <div className="text-neutral-600">Successful Sales</div>
            </div>
          </div>
        </div>
      </section>

      {/* Advertisement Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-4">
              Advertised Properties
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Check out these exclusive properties, specially featured for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advertisedProperties.slice(0, 4).map((property) => (
              <PropertyCard key={property._id || property.id} property={property} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/properties">
              <Button className="bg-primary text-white px-8 py-3 hover:bg-blue-700">
                View All Properties
                <SearchIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Reviews */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Real experiences from satisfied homeowners and investors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestReviews.map((review) => (
              <ReviewCard key={review._id || review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-primary to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="font-inter font-bold text-3xl md:text-4xl mb-4">
              Why Choose RealEstate Pro?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              We're not just another real estate platform. We're your trusted partner in finding the perfect property.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-3xl w-10 h-10" />
              </div>
              <h3 className="font-semibold text-xl mb-4">Verified Properties</h3>
              <p className="text-blue-100 leading-relaxed">Every property is thoroughly verified by our team to ensure authenticity and accurate information.</p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck2 className="text-3xl w-10 h-10" />
              </div>
              <h3 className="font-semibold text-xl mb-4">Trusted Agents</h3>
              <p className="text-blue-100 leading-relaxed">Work with certified real estate professionals who have proven track records and stellar reviews.</p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="text-3xl w-10 h-10" />
              </div>
              <h3 className="font-semibold text-xl mb-4">Secure Transactions</h3>
              <p className="text-blue-100 leading-relaxed">Advanced encryption and secure payment processing ensure your financial information is always protected.</p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="text-3xl w-10 h-10" />
              </div>
              <h3 className="font-semibold text-xl mb-4">Smart Search</h3>
              <p className="text-blue-100 leading-relaxed">AI-powered search algorithms help you find properties that match your exact preferences and budget.</p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Headphones className="text-3xl w-10 h-10" />
              </div>
              <h3 className="font-semibold text-xl mb-4">24/7 Support</h3>
              <p className="text-blue-100 leading-relaxed">Our dedicated support team is available around the clock to assist with any questions or concerns.</p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="text-3xl w-10 h-10" />
              </div>
              <h3 className="font-semibold text-xl mb-4">Market Insights</h3>
              <p className="text-blue-100 leading-relaxed">Access real-time market data, trends, and analytics to make informed investment decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-secondary to-green-600 p-8 md:p-12 text-center text-white">
            <h2 className="font-inter font-bold text-3xl md:text-4xl mb-4">
              Ready to Start Your Real Estate Journey?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Whether you're buying your first home or expanding your property portfolio, we're here to help you every step of the way.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/properties">
                <Button className="bg-white text-secondary px-8 py-3 hover:bg-green-50">
                  <SearchIcon className="w-5 h-5 mr-2" />
                  Find Properties
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="border-2 border-white text-white px-8 py-3 hover:bg-white hover:text-secondary">
                  <Users className="w-5 h-5 mr-2" />
                  Become an Agent
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-green-400">
              <p className="text-green-100 mb-4">Join thousands of satisfied clients who found their dream properties with us</p>
              <div className="flex justify-center items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <span>⭐ 4.9/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>25,000+ Happy Clients</span>
                </div>
                <div className="flex items-center">
                  <Handshake className="w-4 h-4 mr-1" />
                  <span>15,000+ Successful Sales</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
