import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FormError = ({ 
  message, 
  className, 
  icon: Icon = AlertTriangleIcon 
}) => {
  if (!message) return null;
  
  return (
    <div
      className={cn(
        "bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-destructive text-sm",
        className
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
};

export default FormError;
