import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WeeklyInsights() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(createPageUrl("Pulse"), { replace: true });
  }, []);
  return null;
}