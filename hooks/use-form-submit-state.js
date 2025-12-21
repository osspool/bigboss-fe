"use client";

import { useCallback, useEffect, useState } from "react";

export function useFormSubmitState() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitStateChange = useCallback((next) => {
    setIsSubmitting(Boolean(next));
  }, []);

  return { isSubmitting, handleSubmitStateChange };
}

export function useNotifySubmitState(isSubmitting, onSubmitStateChange) {
  useEffect(() => {
    onSubmitStateChange?.(isSubmitting);
  }, [isSubmitting, onSubmitStateChange]);
}
