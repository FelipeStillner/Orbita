import { Button, Card, Text } from "@components";
import { TrashIcon } from "@assets/icons";
import type { Collection } from "@api";

interface CollectionCardProps {
  collection: Collection;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting?: boolean;
}

export default function CollectionCard({
  collection,
  onSelect,
  onDelete,
  isDeleting = false,
}: CollectionCardProps) {
  const count = collection.place_count ?? 0;
  return (
    <Card
      className="cursor-pointer group/card"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center justify-between min-w-0 flex-1">
          <Text variant="body" as="span" className="font-medium truncate">
            {collection.name}
          </Text>
          <Text variant="body-sm" muted as="span" className="flex-shrink-0 ml-2">
            {count} {count === 1 ? "place" : "places"}
          </Text>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-100 rounded-xl hover:bg-white/10"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={`Delete collection ${collection.name}`}
        >
          <TrashIcon />
        </Button>
      </div>
    </Card>
  );
}
