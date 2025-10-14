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

interface SidebarContextType {
  isCollapsed: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const collapseSidebar = React.useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expandSidebar = React.useCallback(() => {
    setIsCollapsed(false);
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
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const { isCollapsed, isMobile, toggleSidebar } = useSidebar();

    return (
      <>
        {isMobile ? (
          <Sheet open={!isCollapsed} onOpenChange={toggleSidebar}>
            <SheetContent side="left" className="w-64 p-0">
              <div
                ref={ref}
                className={cn(
                  "flex h-full flex-col bg-sidebar-background",
                  className
                )}
                {...props}
              />
            </SheetContent>
          </Sheet>
        ) : (
          <div
            ref={ref}
            className={cn(
              "fixed inset-y-0 left-0 z-50 hidden h-full w-64 flex-col border-r bg-sidebar-background md:flex",
              isCollapsed && "w-16",
              variant === "inset" && "md:w-64",
              className
            )}
            {...props}
          />
        )}
      </>
    );
  }
);

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-14 items-center justify-center border-b border-sidebar-border px-4",
      className
    )}
    {...props}
  />
));

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
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <SheetTrigger asChild>
      <button
        ref={ref}
        className={cn("size-8", className)}
        onClick={toggleSidebar}
        {...props}
      />
    </SheetTrigger>
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
        !isMobile && isCollapsed && "md:ml-16",
        !isMobile && !isCollapsed && "md:ml-64",
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
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, tooltip, ...props }, ref) => {
  const { isCollapsed, isMobile } = useSidebar();
  const Comp = props.asChild ? Slot : "button";
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp
            ref={ref}
            className={cn(
              "flex items-center w-full rounded-md transition-colors",
              isMobile ? "h-14 px-4 text-lg gap-4" : "h-10 px-3 text-base gap-3", // Conditional styling for mobile
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              isCollapsed && "justify-center",
              className
            )}
            {...props}
          />
        </TooltipTrigger>
        {isCollapsed && tooltip && (
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
}

const SidebarMenuLink = React.forwardRef<
  HTMLAnchorElement,
  SidebarMenuLinkProps
>(({ className, isActive, tooltip, ...props }, ref) => {
  const { isCollapsed, isMobile } = useSidebar();
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            ref={ref}
            className={cn(
              "flex items-center w-full rounded-md transition-colors",
              isMobile ? "h-14 px-4 text-lg gap-4" : "h-10 px-3 text-base gap-3", // Conditional styling for mobile
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              isCollapsed && "justify-center",
              className
            )}
            {...props}
          />
        </TooltipTrigger>
        {isCollapsed && tooltip && (
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
};