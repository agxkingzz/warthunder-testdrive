'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Status } from "@/types/vehicles";

interface StatusAlertProps {
  status: Status;
}

export default function StatusAlert({ status }: StatusAlertProps) {
  if (!status.message) return null;
  
  const colors = {
    error: "bg-destructive/15 text-destructive border-destructive/50",
    success: "bg-green-500/15 text-green-500 border-green-500/50",
    info: "bg-blue-500/15 text-blue-500 border-blue-500/50"
  };

  return (
    <Alert className={`mt-4 ${colors[status.type]}`}>
      <AlertDescription>{status.message}</AlertDescription>
    </Alert>
  );
}