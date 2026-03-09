import { Page, Text } from "@components";

export default function FeedLoading() {
  return (
    <Page>
      <div className="text-center space-y-6 relative z-10 animate-scale-spring">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="w-16 h-16 glass-medium rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        </div>

        <Text variant="body" className="animate-pulse-subtle">
          Finding the best spots...
        </Text>
      </div>
    </Page>
  );
}
