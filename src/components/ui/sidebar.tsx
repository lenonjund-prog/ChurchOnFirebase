"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"; // Adicionado Menu, ChevronLeft, ChevronRight

interface SidebarContextType {
  isCollapsed: boolean; // Still needed for mobile sheet state
  isMobile: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void; // Will be used to close mobile sheet
  expandSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true); // Start collapsed for mobile by default
  const isMobile = useIsMobile();

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const collapseSidebar = React.useCallback(() => {
    setIsCollapsed(true); // Explicitly collapse (close sheet)
  }, []);

  const expandSidebar = React.useCallback(() => {
    setIsCollapsed(false); // Explicitly expand (open sheet)
  }, []);

  const value = React.useMemo(
    () => ({
      isCollapsed,
      isMobile,
      toggleSidebar,
      collapseSidebar,
      expandSidebar,
    }),
    [isCollapsed, isMobile, toggleSidebar, collapseSidebar, expandSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "default" | "inset";
  isCollapsed: boolean; // Still passed, but desktop will ignore it for width
  isMobile: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant = "default", isCollapsed, isMobile, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full flex-col bg-sidebar-background",
          // Desktop: always expanded (w-64)
          !isMobile && "fixed inset-y-0 left-0 z-50 hidden w-64 border-r md:flex",
          // Mobile: width handled by SheetContent, so w-full within it
          isMobile && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-14 items-center justify-between border-b border-sidebar-border px-4",
        className
      )}
      {...props}
    >
      {children}
      {/* Removed desktop toggle button from here */}
    </div>
  );
});

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-2", className)}
    {...props}
  />
));

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto border-t border-sidebar-border p-2",
      className
    )}
    {...props}
  />
));

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, children, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      ref={ref}
      className={cn("size-8 flex items-center justify-center", className)}
      onClick={toggleSidebar}
      {...props}
    >
      {children}
    </button>
  );
});

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const { isCollapsed, isMobile } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-dvh flex-1 flex-col",
        // Desktop: always ml-64
        !isMobile && "md:ml-64",
        className
      )}
      {...props}
    />
  );
});

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("space-y-1", className)} {...props} />
));

interface SidebarMenuItemProps extends React.ComponentPropsWithoutRef<"li"> {}

const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("relative", className)} {...props} />
  )
);

interface SidebarMenuButtonProps
  extends React.ComponentPropsWithoutRef<"button"> {
  isActive?: boolean;
  tooltip?: string;
  asChild?: boolean;
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, tooltip, asChild, onClick, ...props }, ref) => {
  const { isCollapsed, isMobile, collapseSidebar } = useSidebar(); // Get collapseSidebar
  const Comp = asChild ? Slot : "button";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile) {
      collapseSidebar(); // Close sidebar on click in mobile
    }
    onClick?.(event); // Call original onClick if it exists
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp
            ref={ref}
            className={cn(
              "flex items-center w-full rounded-md transition-colors",
              isMobile ? "h-14 px-4 text-lg gap-4" : "h-10 px-3 text-base gap-3",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              // isCollapsed && "justify-center", // This class is now only relevant for mobile when sheet is open, but sidebar is "collapsed" visually
              className
            )}
            onClick={handleClick} // Use the new handleClick
            {...props}
          />
        </TooltipTrigger>
        {isCollapsed && tooltip && !isMobile && ( // Tooltip only when collapsed (desktop)
          <TooltipContent side="right" className="flex items-center gap-4">
            {tooltip}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
});

interface SidebarMenuLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link> {
  isActive?: boolean;
  tooltip?: string;
  asChild?: boolean;
}

const SidebarMenuLink = React.forwardRef<
  HTMLAnchorElement,
  SidebarMenuLinkProps
>(({ className, isActive, tooltip, asChild, onClick, ...props }, ref) => {
  const { isCollapsed, isMobile, collapseSidebar } = useSidebar(); // Get collapseSidebar
  const Comp = asChild ? Slot : Link;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) {
      collapseSidebar(); // Close sidebar on click in mobile
    }
    onClick?.(event); // Call original onClick if it exists
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp
            ref={ref}
            className={cn(
              "flex items-center w-full rounded-md transition-colors",
              isMobile ? "h-14 px-4 text-lg gap-4" : "h-10 px-3 text-base gap-3",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              // isCollapsed && "justify-center", // This class is now only relevant for mobile when sheet is open, but sidebar is "collapsed" visually
              className
            )}
            onClick={handleClick} // Use the new handleClick
            {...props}
          />
        </TooltipTrigger>
        {isCollapsed && tooltip && !isMobile && ( // Tooltip only when collapsed (desktop)
          <TooltipContent side="right" className="flex items-center gap-4">
            {tooltip}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
});

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuLink,
  useSidebar,
  Sheet,
  SheetContent,
  SheetTrigger,
};