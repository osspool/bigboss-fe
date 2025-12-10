import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const AuthContainer = ({ 
  title, 
  description, 
  children, 
  icon,
  className = ""
}) => {
  return (
    <div className="w-full pt-16 md:pt-24 px-4">
      <Card className={`retro-card-plain max-w-md mx-auto animate-fade-in ${className}`}>
        <CardHeader className="space-y-3 text-center">
          {icon && (
            <div className="mx-auto bg-retro-primary/10 p-3 rounded-full">
              {icon}
            </div>
          )}
          <CardTitle className="text-2xl font-bold retro-text-gradient-vibrant">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthContainer;