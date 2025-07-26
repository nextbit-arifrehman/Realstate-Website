import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* 404 Icon/Number */}
          <div className="mb-6">
            <div className="text-8xl font-bold text-gray-300 mb-2">404</div>
            <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Page Not Found
            </h1>
            <p className="text-gray-600">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            <Button
              onClick={() => navigate('/all-properties')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Properties
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please{' '}
              <a 
                href="mailto:support@realestate.com" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;