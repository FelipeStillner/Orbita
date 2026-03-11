import type { ReactNode } from "react";
import { Page } from "./Page";
import { Text } from "./Text";

interface ErrorPageProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function ErrorPage({
  title,
  description,
  icon,
  action,
}: ErrorPageProps) {
  return (
    <Page>
      <div className="max-w-md space-y-6 relative z-10 animate-scale-spring text-center">
        {icon && (
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto">
            {icon}
          </div>
        )}
        <div className="space-y-3">
          <Text variant="h2" className="gradient-text">
            {title}
          </Text>
          {description && (
            <Text variant="body" muted className="text-base leading-relaxed">
              {description}
            </Text>
          )}
        </div>
        {action && <div className="pt-4">{action}</div>}
      </div>
    </Page>
  );
}
