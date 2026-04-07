import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGuides, createGuide, deleteGuide } from "@api";

export function useGuidesViewModel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newGuideTitle, setNewGuideTitle] = useState("");

  const { data: guides = [], isLoading: guidesLoading } = useQuery({
    queryKey: ["guides"],
    queryFn: fetchGuides,
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => createGuide(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      setNewGuideTitle("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGuide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });

  const handleCreateGuide = () => {
    const title = newGuideTitle.trim();
    if (!title) return;
    createMutation.mutate(title);
  };

  const handleSelectGuide = (id: string) => {
    navigate(`/guides/${id}`);
  };

  return {
    newGuideTitle,
    setNewGuideTitle,
    guides,
    guidesLoading,
    createMutation,
    deleteMutation,
    handleCreateGuide,
    handleSelectGuide,
  };
}

export type GuidesViewModel = ReturnType<typeof useGuidesViewModel>;
