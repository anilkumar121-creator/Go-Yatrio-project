"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md p-6 border border-border bg-card shadow-lg animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
              isDestructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            }`}
          >
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "primary"}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}