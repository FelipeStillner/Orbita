import { Page } from "./Page";
import { Text } from "./Text";

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <Page>
      <div className="text-center space-y-6 relative z-10 animate-scale-spring">
        <div className="flex justify-center">
          <div className="w-16 h-16 glass-medium rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        </div>
        <Text variant="body" className="animate-pulse-subtle">
          {message}
        </Text>
      </div>
    </Page>
  );
}
