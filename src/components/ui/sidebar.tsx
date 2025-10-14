"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Menu } from "lucide-react";

// 1. Sidebar Context
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  variant: SidebarVariant;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children, variant = "default" }: { children: React.ReactNode; variant?: SidebarVariant }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const value = React.useMemo(() => ({ isOpen, setIsOpen, variant }), [isOpen, variant]);

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// 2. Sidebar Root Component
const sidebarVariants = cva(
  "flex flex-col h-full border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "w-64",
        inset: "w-16 md:w-64", // Collapsed on mobile, expands on desktop
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type SidebarVariant = VariantProps<typeof sidebarVariants>["variant"];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
  children?: React.ReactNode;
}

export function Sidebar({ className, variant = "default", children, ...props }: SidebarProps) {
  const { isOpen, setIsOpen, variant: contextVariant } = useSidebar();

  const isInset = contextVariant === "inset";

  return (
    <aside
      className={cn(
        sidebarVariants({ variant: contextVariant }),
        isInset && !isOpen && "w-16", // Collapsed state for inset variant
        isInset && isOpen && "w-64", // Expanded state for inset variant
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

// 3. Sidebar Header
export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen, variant } = useSidebar();
  const isInset = variant === "inset";

  return (
    <div
      className={cn(
        "flex items-center h-14 px-4 border-b",
        isInset && !isOpen && "justify-center",
        isInset && isOpen && "justify-start",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// 4. Sidebar Content
export function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto py-4", className)} {...props}>
      {children}
    </div>
  );
}

// 5. Sidebar Footer
export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-auto border-t py-4", className)} {...props}>
      {children}
    </div>
  );
}

// 6. Sidebar Menu
export function SidebarMenu({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("space-y-1 px-2", className)} {...props}>
      {children}
    </ul>
  );
}

// 7. Sidebar Menu Item
export function SidebarMenuItem({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn(className)} {...props}>
      {children}
    </li>
  );
}

// 8. Sidebar Menu Button (Link/Button wrapper)
interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}

export function SidebarMenuButton({ className, asChild, isActive, tooltip, children, ...props }: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button";
  const { isOpen, variant } = useSidebar();
  const isInset = variant === "inset";

  const buttonClasses = cn(
    "w-full justify-start gap-3",
    isInset && !isOpen && "justify-center",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90",
    className
  );

  const content = (
    <Comp className={buttonClasses} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === "svg") { // Icon
            return React.cloneElement(child, { className: cn("size-5", child.props.className) });
          }
          if (child.type === "span") { // Text
            return React.cloneElement(child, { className: cn(isInset && !isOpen && "hidden", child.props.className) });
          }
        }
        return child;
      })}
    </Comp>
  );

  if (isInset && !isOpen && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// 9. Sidebar Inset (Main content area)
export function SidebarInset({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen, variant } = useSidebar();
  const isInset = variant === "inset";

  return (
    <div
      className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out",
        isInset && !isOpen && "ml-16", // Adjust margin for collapsed sidebar
        isInset && isOpen && "ml-64", // Adjust margin for expanded sidebar
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// 10. Sidebar Trigger (for toggling sidebar on mobile/inset)
export function SidebarTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof Button>) {
  const { setIsOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("md:hidden", className)}
      onClick={() => setIsOpen((prev) => !prev)}
      {...props}
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}