import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, DollarSign, Home, Users, TrendingUp, Calendar } from "lucide-react";
import apiClient from "../../lib/api";

export default function SoldProperties() {
  const { user } = useAuth();

  // Fetch sold properties
  const { data: soldProperties = [], isLoading: soldLoading, error: soldError } = useQuery({
    queryKey: ['/api/offers/agent/sold-properties', user?.uid],
    queryFn: async () => {
      const response = await apiClient.get('/api/offers/agent/sold-properties');
      return response.data;
    },
    enabled: !!user?.uid,
  });

  // Fetch total sold amount
  const { data: totalAmountData = { totalSoldAmount: 0 }, isLoading: totalLoading } = useQuery({
    queryKey: ['/api/offers/agent/total-sold-amount', user?.uid],
    queryFn: async () => {
      const response = await apiClient.get('/api/offers/agent/total-sold-amount');
      return response.data;
    },
    enabled: !!user?.uid,
  });

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

  const calculateAveragePrice = () => {
    if (soldProperties.length === 0) return 0;
    const total = soldProperties.reduce((sum, property) => sum + property.offeredAmount, 0);
    return total / soldProperties.length;
  };

  const getMonthlyData = () => {
    const monthlyData = {};
    soldProperties.forEach(property => {
      const month = new Date(property.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, amount: 0 };
      }
      monthlyData[month].count += 1;
      monthlyData[month].amount += property.offeredAmount;
    });
    return monthlyData;
  };

  if (soldError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Failed to load sold properties</p>
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
            Sold Properties
          </h1>
          <p className="text-lg text-neutral-600">
            Track your successful property sales and revenue
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {soldLoading ? <Skeleton className="h-8 w-16" /> : soldProperties.length}
                  </div>
                  <div className="text-neutral-600">Properties Sold</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {totalLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalAmountData.totalSoldAmount)}
                  </div>
                  <div className="text-neutral-600">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {soldLoading ? <Skeleton className="h-8 w-20" /> : formatCurrency(calculateAveragePrice())}
                  </div>
                  <div className="text-neutral-600">Average Price</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {soldLoading ? <Skeleton className="h-8 w-16" /> : new Set(soldProperties.map(p => p.buyerEmail)).size}
                  </div>
                  <div className="text-neutral-600">Unique Buyers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Sales History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {soldLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : soldProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Sales Yet</h3>
                <p className="text-neutral-600">
                  You haven't sold any properties yet. Keep working on your listings!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Buyer Name</TableHead>
                      <TableHead>Buyer Email</TableHead>
                      <TableHead>Sold Price</TableHead>
                      <TableHead>Sale Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soldProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.propertyTitle}</TableCell>
                        <TableCell>{property.propertyLocation}</TableCell>
                        <TableCell>{property.buyerName}</TableCell>
                        <TableCell>{property.buyerEmail}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(property.offeredAmount)}
                        </TableCell>
                        <TableCell>{formatDate(property.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        {soldProperties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(getMonthlyData()).map(([month, data]) => (
                  <div key={month} className="p-4 bg-neutral-50 rounded-lg">
                    <div className="text-lg font-semibold text-neutral-900 mb-1">{month}</div>
                    <div className="text-sm text-neutral-600 mb-2">{data.count} properties sold</div>
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(data.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Insights */}
        {soldProperties.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Best Performing Month</h4>
                  <p className="text-sm text-blue-700">
                    {(() => {
                      const monthlyData = getMonthlyData();
                      const bestMonth = Object.entries(monthlyData).reduce((a, b) => 
                        monthlyData[a[0]].amount > monthlyData[b[0]].amount ? a : b
                      );
                      return `${bestMonth[0]} - ${formatCurrency(bestMonth[1].amount)}`;
                    })()}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Commission Earned</h4>
                  <p className="text-sm text-green-700">
                    Estimated: {formatCurrency(totalAmountData.totalAmount * 0.03)} (3% commission)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
