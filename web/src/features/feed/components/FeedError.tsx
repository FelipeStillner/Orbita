import { Link } from "react-router-dom";
import { Page, Text, Button } from "@components";

export default function FeedError() {
  return (
    <Page>
      <div className="max-w-md space-y-6 relative z-10 animate-scale-spring">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto">
          📍
        </div>

        {/* Content */}
        <div className="space-y-3">
          <Text variant="h2" className="gradient-text">
            Location Required
          </Text>
          <Text variant="body" muted className="text-base leading-relaxed">
            We need your location to show you the best places nearby. Please enable
            location access in your browser settings.
          </Text>
        </div>

        {/* Action button */}
        <div className="pt-4">
          <Link to="/">
            <Button size="md" className="w-full">
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    </Page>
  );
}
