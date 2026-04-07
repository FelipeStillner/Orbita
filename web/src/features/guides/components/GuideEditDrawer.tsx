import { useState, useEffect, useRef, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Drawer, Button, Text, Input } from "@components";
import {
  patchGuide,
  patchGuideStep,
  patchGuidePlaceOption,
  createGuideStep,
  type GuideDetail,
} from "@api";
import { letterForPlaceIndexInStep } from "../guideOrderLabels";

const textAreaClass =
  "w-full min-h-[100px] rounded-2xl px-4 py-3 text-sm text-white placeholder-white/40 glass-medium focus:outline-none focus:glass-strong border border-white/10 resize-y";

const editFieldClass =
  "w-full min-h-[72px] rounded-2xl px-4 py-3 text-sm text-white placeholder-white/40 glass-medium focus:outline-none focus:glass-strong border border-white/10 resize-y";

type StepDraft = { title: string; note: string };

interface GuideEditDrawerProps {
  open: boolean;
  onClose: () => void;
  guideId: string;
  detail: GuideDetail;
}

export default function GuideEditDrawer({
  open,
  onClose,
  guideId,
  detail,
}: GuideEditDrawerProps) {
  const [t, setT] = useState(detail.title);
  const [b, setB] = useState(detail.blurb);
  const [stepDrafts, setStepDrafts] = useState<Record<string, StepDraft>>({});
  const [placeDrafts, setPlaceDrafts] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      return;
    }
    if (!prevOpenRef.current) {
      setT(detail.title);
      setB(detail.blurb);
      const sd: Record<string, StepDraft> = {};
      const pd: Record<string, string> = {};
      for (const s of detail.steps ?? []) {
        sd[s.id] = {
          title: s.step_title ?? "",
          note: s.step_note ?? "",
        };
        for (const p of s.places ?? []) {
          pd[`${s.id}:${p.place_id}`] = p.option_note ?? "";
        }
      }
      setStepDrafts(sd);
      setPlaceDrafts(pd);
      prevOpenRef.current = true;
    }
  }, [open, detail]);

  const stepIdsKey = useMemo(
    () => (detail.steps ?? []).map((s) => s.id).join(","),
    [detail.steps]
  );

  useEffect(() => {
    if (!open) return;
    setStepDrafts((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const s of detail.steps ?? []) {
        if (!(s.id in next)) {
          next[s.id] = { title: s.step_title ?? "", note: s.step_note ?? "" };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    setPlaceDrafts((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const s of detail.steps ?? []) {
        for (const p of s.places ?? []) {
          const key = `${s.id}:${p.place_id}`;
          if (!(key in next)) {
            next[key] = p.option_note ?? "";
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [open, stepIdsKey]);

  const addStepMutation = useMutation({
    mutationFn: () => createGuideStep(guideId, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guide", guideId] });
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      await patchGuide(guideId, { title: t.trim(), blurb: b });
      const stepsList = detail.steps ?? [];
      for (const s of stepsList) {
        const d = stepDrafts[s.id] ?? {
          title: s.step_title ?? "",
          note: s.step_note ?? "",
        };
        await patchGuideStep(guideId, s.id, {
          step_title: d.title.trim(),
          step_note: d.note,
        });
      }
      for (const s of stepsList) {
        for (const p of s.places ?? []) {
          const key = `${s.id}:${p.place_id}`;
          const opt = placeDrafts[key] ?? p.option_note ?? "";
          await patchGuidePlaceOption(guideId, s.id, p.place_id, opt);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guide", guideId] });
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      onClose();
    },
  });

  const steps = detail.steps ?? [];

  const updateStep = (id: string, patch: Partial<StepDraft>) => {
    setStepDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], title: prev[id]?.title ?? "", note: prev[id]?.note ?? "", ...patch },
    }));
  };

  const updatePlace = (stepId: string, placeId: string, value: string) => {
    setPlaceDrafts((prev) => ({ ...prev, [`${stepId}:${placeId}`]: value }));
  };

  return (
    <Drawer open={open} onClose={onClose} title="Edit guide">
      <div className="px-6 pt-2 pb-6 space-y-6 overflow-y-auto no-scrollbar max-h-[75dvh]">
        <div>
          <Text variant="body-sm" muted className="mb-2">
            Title
          </Text>
          <Input
            value={t}
            onChange={(e) => setT(e.target.value)}
            className="rounded-2xl"
          />
        </div>
        <div>
          <Text variant="body-sm" muted className="mb-2">
            Description
          </Text>
          <textarea
            className={textAreaClass}
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="What is this guide about?"
            aria-label="Guide description"
          />
        </div>

        <div className="border-t border-white/10 pt-5">
          <Button
            type="button"
            size="md"
            variant="default"
            rounded={false}
            className="w-full justify-center"
            disabled={addStepMutation.isPending || save.isPending}
            onClick={() => addStepMutation.mutate()}
          >
            {addStepMutation.isPending ? "Adding…" : "Add step"}
          </Button>
        </div>

        {steps.length > 0 ? (
          <div className="space-y-5 border-t border-white/10 pt-5">
            {steps.map((step, stepIndex) => {
              const d = stepDrafts[step.id] ?? { title: "", note: "" };
              return (
                <div
                  key={step.id}
                  className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <div>
                    <Text variant="body-sm" muted className="mb-2">
                      <span className="tabular-nums text-white/45 mr-1.5">{stepIndex + 1}.</span>
                      Step title
                    </Text>
                    <Input
                      value={d.title}
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                      className="rounded-2xl"
                      placeholder="Name this step"
                    />
                  </div>
                  <div>
                    <Text variant="body-sm" muted className="mb-2">
                      Step description
                    </Text>
                    <textarea
                      className={editFieldClass}
                      value={d.note}
                      onChange={(e) => updateStep(step.id, { note: e.target.value })}
                      placeholder="What happens on this step?"
                      rows={3}
                      aria-label="Step description"
                    />
                  </div>
                  {(step.places ?? []).length > 0 ? (
                    <div className="space-y-4">
                      {(step.places ?? []).map((p, pi) => (
                        <div
                          key={p.place_id}
                          className={pi > 0 ? "pt-4 border-t border-white/10" : ""}
                        >
                          <Text variant="body-sm" className="font-medium text-white/95 mb-2">
                            <span className="text-white/50 font-semibold mr-2 tabular-nums w-6 inline-block">
                              {letterForPlaceIndexInStep(pi)}
                            </span>
                            {p.name}
                          </Text>
                          <Text variant="body-sm" muted className="mb-2">
                            Place description
                          </Text>
                          <textarea
                            className={editFieldClass + " min-h-[60px]"}
                            value={placeDrafts[`${step.id}:${p.place_id}`] ?? ""}
                            onChange={(e) =>
                              updatePlace(step.id, p.place_id, e.target.value)
                            }
                            placeholder="Tip or detail for this stop"
                            rows={2}
                            aria-label="Place description"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <Button
          type="button"
          size="md"
          variant="default"
          rounded={false}
          className="w-full justify-center"
          disabled={!t.trim() || save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </Drawer>
  );
}
