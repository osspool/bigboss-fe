"use client";
import React, { useState, useEffect } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';
import { DynamicTabs } from "@/components/custom/ui/tabs-wrapper";
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const ResponsiveSplitLayout = ({
  leftPanel,
  rightPanel,
  className,
  leftPanelClassName,
  rightPanelClassName,
  variant = 'default', // 'default' | 'tabs' | 'fixed'
  defaultLayout = [50, 50],
  minSizes = [20, 20],
  rightPanelWidth = 400, // Fixed width for right panel when variant is 'fixed'
  persistLayoutKey,
  mobileBreakpoint = 'md', // 'sm' (640px) | 'md' (768px) | 'lg' (1024px) | 'xl' (1280px)
  forceMobile = false, // Force mobile layout regardless of screen size
  forceDesktop = false, // Force desktop layout regardless of screen size
}) => {
  const [windowWidth, setWindowWidth] = useState(0);
  const [mobileView, setMobileView] = useState('left');

  // Breakpoint values
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  // Update window width
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if we should use mobile layout
  const shouldUseMobileLayout = () => {
    if (forceDesktop) return false;
    if (forceMobile) return true;
    return windowWidth < breakpoints[mobileBreakpoint];
  };

  const isMobile = shouldUseMobileLayout();

  // Mobile view with tabs using TabsWrapper
  if (isMobile && variant === 'tabs') {
    const tabs = [
      {
        value: 'left',
        label: (
          <div className="flex items-center gap-2">
            {leftPanel.icon}
            {leftPanel.title || 'Left'}
          </div>
        ),
        content: leftPanel.content
      },
      {
        value: 'right',
        label: (
          <div className="flex items-center gap-2">
            {rightPanel.icon}
            {rightPanel.title || 'Right'}
            {rightPanel.badge && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {rightPanel.badge}
              </span>
            )}
          </div>
        ),
        content: rightPanel.content
      }
    ];

    return (
      <div className="h-full">
        <DynamicTabs
          tabs={tabs}
          defaultValue="left"
          value={mobileView}
          onValueChange={setMobileView}
          variant="default"
          className="h-full flex flex-col"
        />
      </div>
    );
  }

  // Mobile view with navigation buttons (default)
  if (isMobile) {
    const showLeft = mobileView === 'left';
    const showRight = mobileView === 'right';

    return (
      <div className={cn("flex flex-col h-full", className)}>
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className={cn(
            "h-full",
            !showLeft && "hidden",
            leftPanelClassName
          )}>
            {leftPanel.content}
          </div>

          {/* Right Panel */}
          <div className={cn(
            "h-full",
            !showRight && "hidden",
            rightPanelClassName
          )}>
            {rightPanel.content}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="border-t p-4 bg-background">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button
              variant={mobileView === 'left' ? 'default' : 'outline'}
              onClick={() => setMobileView('left')}
              className="flex-1 mr-2"
            >
              {mobileView === 'right' && <ArrowLeft className="h-4 w-4 mr-2" />}
              {leftPanel.icon}
              <span className="ml-2">{leftPanel.title || 'Left'}</span>
            </Button>
            
            <Button
              variant={mobileView === 'right' ? 'default' : 'outline'}
              onClick={() => setMobileView('right')}
              className="flex-1 ml-2 relative"
            >
              <span className="mr-2">{rightPanel.title || 'Right'}</span>
              {rightPanel.icon}
              {mobileView === 'left' && <ArrowRight className="h-4 w-4 ml-2" />}
              {rightPanel.badge && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {rightPanel.badge}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view with fixed right panel width
  if (variant === 'fixed') {
    return (
      <div className={cn("flex h-full", className)}>
        {/* Left Panel - Takes remaining space */}
        <div className={cn(
          "flex-1 overflow-auto border-r",
          leftPanelClassName
        )}>
          {leftPanel.content}
        </div>

        {/* Right Panel - Fixed width */}
        <div 
          className={cn(
            "overflow-auto flex-shrink-0",
            rightPanelClassName
          )}
          style={{ width: rightPanelWidth }}
        >
          {rightPanel.content}
        </div>
      </div>
    );
  }

  // Desktop view with resizable panels (default)
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn("h-full", className)}
      autoSaveId={persistLayoutKey}
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        minSize={minSizes[0]}
      >
        <div className={cn(
          "h-full overflow-auto",
          leftPanelClassName
        )}>
          {leftPanel.content}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel
        defaultSize={defaultLayout[1]}
        minSize={minSizes[1]}
      >
        <div className={cn(
          "h-full overflow-auto",
          rightPanelClassName
        )}>
          {rightPanel.content}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
