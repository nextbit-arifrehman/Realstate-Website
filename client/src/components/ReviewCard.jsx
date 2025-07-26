import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";

export default function ReviewCard({ review, onDelete, showDeleteButton = false }) {
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
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex mr-2">
              {renderStars(review.rating)}
            </div>
            <span className="text-sm text-neutral-600">{review.rating}.0</span>
          </div>
          
          {showDeleteButton && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(review.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <blockquote className="text-neutral-700 mb-4 leading-relaxed">
          "{review.description}"
        </blockquote>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="w-10 h-10 mr-3">
              <AvatarImage src={review.userImage} alt={review.userName} />
              <AvatarFallback>
                {review.userName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-neutral-900">{review.userName}</div>
              <div className="text-sm text-neutral-600">{review.propertyTitle}</div>
            </div>
          </div>
          
          {review.createdAt && (
            <div className="text-xs text-neutral-500">
              {formatDate(review.createdAt)}
            </div>
          )}
        </div>
        
        {review.agentName && (
          <div className="mt-2 text-sm text-neutral-600">
            Agent: {review.agentName}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
