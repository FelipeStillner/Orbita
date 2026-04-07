import { Button, Text, Input } from "@components";
import { PlusIcon } from "@assets/icons";
import GuideCard from "./GuideCard";
import type { GuideListItem } from "@api";
import type { GuidesViewModel } from "../useGuidesViewModel";

interface GuidesListViewProps {
  vm: GuidesViewModel;
}

export default function GuidesListView({ vm }: GuidesListViewProps) {
  const {
    newGuideTitle,
    setNewGuideTitle,
    guides,
    guidesLoading,
    createMutation,
    deleteMutation,
    handleCreateGuide,
    handleSelectGuide,
  } = vm;

  return (
    <div className="min-h-dvh bg-black text-white px-4 pt-6 pb-28 md:pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <Text variant="h2">Guides</Text>

        <div className="flex items-center gap-3 min-h-[3rem]">
          <Button
            size="md"
            className="flex items-center justify-center shrink-0"
            onClick={handleCreateGuide}
            disabled={!newGuideTitle.trim() || createMutation.isPending}
            aria-label="Create guide"
          >
            <PlusIcon />
          </Button>
          <Input
            type="text"
            value={newGuideTitle}
            onChange={(e) => setNewGuideTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateGuide()}
            placeholder="New guide title"
            className="flex-1 min-w-0"
          />
        </div>

        {guidesLoading ? (
          <div className="flex items-center gap-2 py-8">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <Text variant="body-sm" muted>
              Loading…
            </Text>
          </div>
        ) : guides.length === 0 ? (
          <Text variant="body" muted className="py-4">
            No guides yet. Create one above.
          </Text>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {guides.map((g: GuideListItem) => (
              <GuideCard
                key={g.id}
                guide={g}
                onSelect={() => handleSelectGuide(g.id)}
                onDelete={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(g.id);
                }}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
