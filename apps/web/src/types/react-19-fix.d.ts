// React 19 compatibility fix for ForwardRef components
import { ForwardRefExoticComponent, RefAttributes } from 'react'

declare module 'react' {
  interface ForwardRefExoticComponent<P> extends ForwardRefExoticComponent<P> {
    (props: P & RefAttributes<unknown>): React.ReactElement | null
  }
}

// Fix for Radix UI components with React 19
declare module '@radix-ui/react-tabs' {
  export const TabsList: ForwardRefExoticComponent<unknown>
  export const TabsTrigger: ForwardRefExoticComponent<unknown>
  export const TabsContent: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-dialog' {
  export const Dialog: ForwardRefExoticComponent<unknown>
  export const DialogContent: ForwardRefExoticComponent<unknown>
  export const DialogHeader: ForwardRefExoticComponent<unknown>
  export const DialogFooter: ForwardRefExoticComponent<unknown>
  export const DialogTitle: ForwardRefExoticComponent<unknown>
  export const DialogDescription: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-select' {
  export const Select: ForwardRefExoticComponent<unknown>
  export const SelectContent: ForwardRefExoticComponent<unknown>
  export const SelectItem: ForwardRefExoticComponent<unknown>
  export const SelectTrigger: ForwardRefExoticComponent<unknown>
  export const SelectValue: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-progress' {
  export const Progress: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-avatar' {
  export const Avatar: ForwardRefExoticComponent<unknown>
  export const AvatarImage: ForwardRefExoticComponent<unknown>
  export const AvatarFallback: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-dropdown-menu' {
  export const DropdownMenu: ForwardRefExoticComponent<unknown>
  export const DropdownMenuTrigger: ForwardRefExoticComponent<unknown>
  export const DropdownMenuContent: ForwardRefExoticComponent<unknown>
  export const DropdownMenuItem: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-checkbox' {
  export const Checkbox: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-switch' {
  export const Switch: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-accordion' {
  export const Accordion: ForwardRefExoticComponent<unknown>
  export const AccordionItem: ForwardRefExoticComponent<unknown>
  export const AccordionTrigger: ForwardRefExoticComponent<unknown>
  export const AccordionContent: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-popover' {
  export const Popover: ForwardRefExoticComponent<unknown>
  export const PopoverTrigger: ForwardRefExoticComponent<unknown>
  export const PopoverContent: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-tooltip' {
  export const Tooltip: ForwardRefExoticComponent<unknown>
  export const TooltipTrigger: ForwardRefExoticComponent<unknown>
  export const TooltipContent: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-toast' {
  export const Toast: ForwardRefExoticComponent<unknown>
  export const ToastProvider: ForwardRefExoticComponent<unknown>
  export const ToastViewport: ForwardRefExoticComponent<unknown>
  export const ToastTitle: ForwardRefExoticComponent<unknown>
  export const ToastDescription: ForwardRefExoticComponent<unknown>
  export const ToastAction: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-command' {
  export const Command: ForwardRefExoticComponent<unknown>
  export const CommandInput: ForwardRefExoticComponent<unknown>
  export const CommandList: ForwardRefExoticComponent<unknown>
  export const CommandEmpty: ForwardRefExoticComponent<unknown>
  export const CommandGroup: ForwardRefExoticComponent<unknown>
  export const CommandItem: ForwardRefExoticComponent<unknown>
}

declare module '@radix-ui/react-slot' {
  export const Slot: ForwardRefExoticComponent<unknown>
}
