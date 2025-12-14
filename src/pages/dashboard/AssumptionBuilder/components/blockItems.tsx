import { GitBranch, CheckCircle, XCircle } from "lucide-react";
import type { BlockItem } from "./types";

// Draggable block items
export const blockItems: BlockItem[] = [
  {
    type: "condition",
    label: "Condition Stage",
    icon: <GitBranch className="w-5 h-5" />,
    color: "#00B7AD",
  },
  {
    type: "success",
    label: "Action: Success",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "#22C55E",
  },
  {
    type: "fail",
    label: "Action: Fail",
    icon: <XCircle className="w-5 h-5" />,
    color: "#EF4444",
  },
];
