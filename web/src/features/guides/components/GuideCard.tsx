import { Button, Card, Text } from "@components";
import { TrashIcon } from "@assets/icons";
import type { GuideListItem } from "@api";

interface GuideCardProps {
  guide: GuideListItem;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting?: boolean;
}

export default function GuideCard({
  guide,
  onSelect,
  onDelete,
  isDeleting = false,
}: GuideCardProps) {
  const places = guide.place_count ?? 0;
  const steps = guide.step_count ?? 0;
  return (
    <Card className="cursor-pointer group/card" onClick={onSelect}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
          <Text variant="body" as="span" className="font-medium truncate">
            {guide.title}
          </Text>
          <Text variant="body-sm" muted as="span">
            {places} {places === 1 ? "place" : "places"} · {steps}{" "}
            {steps === 1 ? "step" : "steps"}
          </Text>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-100 rounded-xl hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          disabled={isDeleting}
          aria-label={`Delete guide ${guide.title}`}
        >
          <TrashIcon />
        </Button>
      </div>
    </Card>
  );
}
