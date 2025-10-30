// React 19 compatibility fix for ForwardRef components
import { ForwardRefExoticComponent, RefAttributes, ReactElement } from 'react'

declare module 'react' {
  interface ForwardRefExoticComponent<P> extends ForwardRefExoticComponent<P> {
    (props: P & RefAttributes<Element>): ReactElement | null
  }
}

// Fix for Radix UI components with React 19
declare module '@radix-ui/react-tabs' {
  export const TabsList: ForwardRefExoticComponent<Record<string, never>>
  export const TabsTrigger: ForwardRefExoticComponent<Record<string, never>>
  export const TabsContent: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-dialog' {
  export const Dialog: ForwardRefExoticComponent<Record<string, never>>
  export const DialogContent: ForwardRefExoticComponent<Record<string, never>>
  export const DialogHeader: ForwardRefExoticComponent<Record<string, never>>
  export const DialogFooter: ForwardRefExoticComponent<Record<string, never>>
  export const DialogTitle: ForwardRefExoticComponent<Record<string, never>>
  export const DialogDescription: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-select' {
  export const Select: ForwardRefExoticComponent<Record<string, never>>
  export const SelectContent: ForwardRefExoticComponent<Record<string, never>>
  export const SelectItem: ForwardRefExoticComponent<Record<string, never>>
  export const SelectTrigger: ForwardRefExoticComponent<Record<string, never>>
  export const SelectValue: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-progress' {
  export const Progress: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-avatar' {
  export const Avatar: ForwardRefExoticComponent<Record<string, never>>
  export const AvatarImage: ForwardRefExoticComponent<Record<string, never>>
  export const AvatarFallback: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-dropdown-menu' {
  export const DropdownMenu: ForwardRefExoticComponent<Record<string, never>>
  export const DropdownMenuTrigger: ForwardRefExoticComponent<Record<string, never>>
  export const DropdownMenuContent: ForwardRefExoticComponent<Record<string, never>>
  export const DropdownMenuItem: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-checkbox' {
  export const Checkbox: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-switch' {
  export const Switch: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-accordion' {
  export const Accordion: ForwardRefExoticComponent<Record<string, never>>
  export const AccordionItem: ForwardRefExoticComponent<Record<string, never>>
  export const AccordionTrigger: ForwardRefExoticComponent<Record<string, never>>
  export const AccordionContent: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-popover' {
  export const Popover: ForwardRefExoticComponent<Record<string, never>>
  export const PopoverTrigger: ForwardRefExoticComponent<Record<string, never>>
  export const PopoverContent: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-tooltip' {
  export const Tooltip: ForwardRefExoticComponent<Record<string, never>>
  export const TooltipTrigger: ForwardRefExoticComponent<Record<string, never>>
  export const TooltipContent: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-toast' {
  export const Toast: ForwardRefExoticComponent<Record<string, never>>
  export const ToastProvider: ForwardRefExoticComponent<Record<string, never>>
  export const ToastViewport: ForwardRefExoticComponent<Record<string, never>>
  export const ToastTitle: ForwardRefExoticComponent<Record<string, never>>
  export const ToastDescription: ForwardRefExoticComponent<Record<string, never>>
  export const ToastAction: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-command' {
  export const Command: ForwardRefExoticComponent<Record<string, never>>
  export const CommandInput: ForwardRefExoticComponent<Record<string, never>>
  export const CommandList: ForwardRefExoticComponent<Record<string, never>>
  export const CommandEmpty: ForwardRefExoticComponent<Record<string, never>>
  export const CommandGroup: ForwardRefExoticComponent<Record<string, never>>
  export const CommandItem: ForwardRefExoticComponent<Record<string, never>>
}

declare module '@radix-ui/react-slot' {
  export const Slot: ForwardRefExoticComponent<Record<string, never>>
}
