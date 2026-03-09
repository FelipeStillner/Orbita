import { Button, Text } from "@components";
import { TrashIcon } from "@assets/icons";
import type { CollectionPlace } from "@api";

interface PlaceItemRowProps {
  place: CollectionPlace;
  onRemove: () => void;
  isRemoving?: boolean;
}

export default function PlaceItemRow({
  place,
  onRemove,
  isRemoving = false,
}: PlaceItemRowProps) {
  return (
    <div className="group/place flex items-center justify-between gap-2 rounded-2xl px-4 py-3 glass-medium transition-all duration-300 hover:glass-strong">
      <Text variant="body" as="span" className="truncate min-w-0">
        {place.name}
      </Text>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover/place:opacity-100 transition-opacity flex-shrink-0 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label={`Remove ${place.name} from collection`}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}
