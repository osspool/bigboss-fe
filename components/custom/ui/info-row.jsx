import { CopyText } from "./copy-button";

export function InfoRow({ label, value, copyable = false, icon: Icon }) {
    if (!value && value !== 0) return null;
    
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 gap-2 group hover:bg-muted rounded-md px-3 -mx-3 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
                {Icon && <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                <span className="text-sm font-medium text-muted-foreground truncate">{label}</span>
            </div>
            <div className="sm:text-right min-w-0 flex-shrink-0">
                {copyable ? (
                    <CopyText 
                        value={value}
                        textClassName="text-foreground font-semibold"
                        maxLength={40}
                        className="justify-start sm:justify-end"
                    />
                ) : (
                    <span 
                        className="font-semibold text-foreground block truncate max-w-full sm:max-w-[250px]"
                        title={value?.toString() || "N/A"}
                    >
                        {value?.toString() || "N/A"}
                    </span>
                )}
            </div>
        </div>
    );
}
