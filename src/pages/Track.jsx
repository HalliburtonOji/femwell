import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Track() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/Today?tab=track", { replace: true });
  }, []);
  return null;
}