import { CheckCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FormSuccess = ({ 
  message, 
  className, 
  icon: Icon = CheckCircleIcon 
}) => {
  if (!message) return null;
  
  return (
    <div
      className={cn(
        "bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-emerald-500 text-sm",
        className
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
};

export default FormSuccess;
