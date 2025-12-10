// app/loading.jsx
"use client"
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export default function Loading() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(66);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <h3 className="font-medium animate-pulse">Loading...</h3>
      </div>
      
      <div className="w-[80%] max-w-md">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}