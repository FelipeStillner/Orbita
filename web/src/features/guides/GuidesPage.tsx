import { useGuidesViewModel } from "./useGuidesViewModel";
import GuidesListView from "./components/GuidesListView";

export default function GuidesPage() {
  const vm = useGuidesViewModel();
  return <GuidesListView vm={vm} />;
}
