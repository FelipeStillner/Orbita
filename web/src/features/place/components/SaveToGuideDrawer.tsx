import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchGuides,
  fetchGuide,
  addPlaceToGuideStep,
  removePlaceFromGuideStep,
  type GuideDetail,
} from "@api";
import type { Place } from "@types";
import { Text, Drawer } from "@components";
import { ChevronDownIcon, CheckIcon, CloseIcon } from "@assets/icons";

export interface PlaceGuideItem {
  id: string;
  name: string;
}

/** Compare UUID strings from different sources (casing / dash formatting may differ). */
function idsEqual(a: string, b: string): boolean {
  const norm = (s: string) =>
    s.trim().toLowerCase().replace(/-/g, "");
  return norm(a) === norm(b);
}

interface SaveToGuideDrawerProps {
  place: Place | null;
  onClose: () => void;
  onSaved?: (guides: PlaceGuideItem[]) => void;
}

export default function SaveToGuideDrawer({
  place,
  onClose,
  onSaved,
}: SaveToGuideDrawerProps) {
  const queryClient = useQueryClient();
  const open = !!place;
  const placeId = place?.id ?? "";

  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [addingStepId, setAddingStepId] = useState<string | null>(null);

  useEffect(() => {
    if (!place) return;
    setExpandedGuideId(null);
    setAddingStepId(null);
  }, [place?.id, open]);

  const { data: guides = [], isLoading: guidesLoading } = useQuery({
    queryKey: ["guides"],
    queryFn: fetchGuides,
    enabled: open,
  });

  const { data: expandedGuide, isLoading: guideDetailLoading } = useQuery({
    queryKey: ["guide", expandedGuideId],
    queryFn: () => fetchGuide(expandedGuideId!),
    enabled: open && !!expandedGuideId,
  });

  const stepPlaceMutation = useMutation({
    mutationFn: (payload: {
      guideId: string;
      stepId: string;
      placeId: string;
      remove: boolean;
    }) =>
      payload.remove
        ? removePlaceFromGuideStep(
            payload.guideId,
            payload.stepId,
            payload.placeId
          )
        : addPlaceToGuideStep(
            payload.guideId,
            payload.stepId,
            payload.placeId
          ),
    onMutate: ({ stepId }) => {
      setAddingStepId(stepId);
    },
    onSettled: () => {
      setAddingStepId(null);
    },
    onSuccess: (_, { guideId, remove, placeId: pid, stepId }) => {
      if (remove) {
        for (const q of queryClient.getQueryCache().findAll({ queryKey: ["guide"] })) {
          const key = q.queryKey;
          if (key[0] !== "guide" || typeof key[1] !== "string") continue;
          if (!idsEqual(key[1], guideId)) continue;
          queryClient.setQueryData<GuideDetail>(key, (old) => {
            if (!old?.steps) return old;
            return {
              ...old,
              steps: old.steps.map((step) =>
                idsEqual(step.id, stepId)
                  ? {
                      ...step,
                      places: (step.places ?? []).filter(
                        (p) => !idsEqual(p.place_id, pid)
                      ),
                    }
                  : step
              ),
            };
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["place", pid] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      queryClient.invalidateQueries({ queryKey: ["guide"] });
      if (!remove) {
        const g = guides.find((x) => x.id === guideId);
        if (g) {
          const existing = place?.guides ?? [];
          const merged = existing.some((e) => idsEqual(e.id, g.id))
            ? existing
            : [...existing, { id: g.id, name: g.title }];
          onSaved?.(merged);
        }
        setExpandedGuideId(null);
      }
    },
  });

  const savedGuideIds = new Set(
    (place?.guides ?? []).map((x) => x.id.trim().toLowerCase())
  );

  const toggleGuide = (guideId: string) => {
    setExpandedGuideId((prev) => (prev === guideId ? null : guideId));
  };

  return (
    <Drawer open={open} onClose={onClose} title="Save to guide">
      <div className="px-6 pt-2 pb-4 space-y-5 max-h-[75dvh] overflow-y-auto no-scrollbar">
        <div className="space-y-3">
          <Text variant="body-sm" muted>
            Add to a guide
          </Text>

          {guidesLoading ? (
            <div className="flex items-center gap-2 py-4">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <Text variant="body-sm" muted>
                Loading guides…
              </Text>
            </div>
          ) : guides.length === 0 ? (
            <Text variant="body" muted>
              No guides yet. Create a guide from the Guides tab, add steps on the guide page,
              then you can save this place here.
            </Text>
          ) : (
            <ul className="space-y-2 max-h-[min(28rem,55dvh)] overflow-y-auto no-scrollbar">
              {guides.map((g) => {
                const expanded = expandedGuideId === g.id;
                return (
                  <li key={g.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-start justify-between gap-3 text-left px-4 py-3 hover:bg-white/[0.06] transition-colors min-w-0"
                      onClick={() => toggleGuide(g.id)}
                    >
                      <div className="min-w-0 flex-1 flex items-start gap-2">
                        {savedGuideIds.has(g.id.trim().toLowerCase()) ? (
                          <span
                            className="shrink-0 mt-0.5 inline-flex text-emerald-400/95 [&_svg]:w-[18px] [&_svg]:h-[18px]"
                            aria-label="Saved in this guide"
                          >
                            <CheckIcon />
                          </span>
                        ) : null}
                        <span className="text-base text-white truncate">{g.title}</span>
                      </div>
                      <ChevronDownIcon
                        className={`shrink-0 mt-0.5 text-white/55 transition-transform duration-200 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded ? (
                      <div className="border-t border-white/10 px-4 pb-4 pt-2 space-y-3">
                        {guideDetailLoading ||
                        !expandedGuide ||
                        expandedGuide.id !== g.id ? (
                          <div className="flex items-center gap-2 py-4">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <Text variant="body-sm" muted>
                              Loading steps…
                            </Text>
                          </div>
                        ) : (expandedGuide.steps ?? []).length === 0 ? (
                          <div className="space-y-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-3">
                            <Text variant="body-sm" className="text-white/90">
                              This guide has no steps yet. Steps can only be created on the
                              guide screen.
                            </Text>
                            <Link
                              to={`/guides/${g.id}`}
                              className="inline-block text-sm text-sky-300 underline-offset-2 hover:underline"
                              onClick={onClose}
                            >
                              Open guide to add steps
                            </Link>
                          </div>
                        ) : (
                          <ul className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                            {(expandedGuide.steps ?? []).map((step) => {
                              const busy = addingStepId === step.id;
                              const stepLabel =
                                step.step_title?.trim() || "Untitled step";
                              const inStep = (step.places ?? []).some((p) =>
                                idsEqual(p.place_id, placeId)
                              );
                              return (
                                <li key={step.id}>
                                  <button
                                    type="button"
                                    disabled={stepPlaceMutation.isPending}
                                    onClick={() =>
                                      stepPlaceMutation.mutate({
                                        guideId: g.id,
                                        stepId: step.id,
                                        placeId,
                                        remove: inStep,
                                      })
                                    }
                                    aria-label={
                                      inStep ? "Remove from this step" : "Add to this step"
                                    }
                                    className="group flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.07] hover:border-white/20 disabled:opacity-45 disabled:pointer-events-none"
                                  >
                                    <span className="flex min-w-0 flex-1 items-center gap-2">
                                      {inStep ? (
                                        <span className="relative h-4 w-4 shrink-0 pointer-events-none">
                                          <span className="absolute inset-0 flex items-center justify-center text-emerald-400/95 transition-opacity group-hover:opacity-0 pointer-events-none [&_svg]:h-4 [&_svg]:w-4">
                                            <CheckIcon />
                                          </span>
                                          <span className="absolute inset-0 flex items-center justify-center text-rose-300/95 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none [&_svg]:h-4 [&_svg]:w-4">
                                            <CloseIcon />
                                          </span>
                                        </span>
                                      ) : null}
                                      <span className="text-sm font-medium text-white truncate">
                                        {stepLabel}
                                      </span>
                                    </span>
                                    {busy ? (
                                      <span className="h-4 w-4 shrink-0 border-2 border-white/25 border-t-white/90 rounded-full animate-spin" />
                                    ) : null}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  );
}
