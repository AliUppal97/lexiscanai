// React 19 compatibility fix for ForwardRef components
import { ForwardRefExoticComponent, RefAttributes } from 'react'

declare module 'react' {
  interface ForwardRefExoticComponent<P> extends ForwardRefExoticComponent<P> {
    (props: P & RefAttributes<any>): React.ReactElement | null
  }
}

// Fix for Radix UI components with React 19
declare module '@radix-ui/react-tabs' {
  export const TabsList: ForwardRefExoticComponent<any>
  export const TabsTrigger: ForwardRefExoticComponent<any>
  export const TabsContent: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-dialog' {
  export const Dialog: ForwardRefExoticComponent<any>
  export const DialogContent: ForwardRefExoticComponent<any>
  export const DialogHeader: ForwardRefExoticComponent<any>
  export const DialogFooter: ForwardRefExoticComponent<any>
  export const DialogTitle: ForwardRefExoticComponent<any>
  export const DialogDescription: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-select' {
  export const Select: ForwardRefExoticComponent<any>
  export const SelectContent: ForwardRefExoticComponent<any>
  export const SelectItem: ForwardRefExoticComponent<any>
  export const SelectTrigger: ForwardRefExoticComponent<any>
  export const SelectValue: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-progress' {
  export const Progress: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-avatar' {
  export const Avatar: ForwardRefExoticComponent<any>
  export const AvatarImage: ForwardRefExoticComponent<any>
  export const AvatarFallback: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-dropdown-menu' {
  export const DropdownMenu: ForwardRefExoticComponent<any>
  export const DropdownMenuTrigger: ForwardRefExoticComponent<any>
  export const DropdownMenuContent: ForwardRefExoticComponent<any>
  export const DropdownMenuItem: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-checkbox' {
  export const Checkbox: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-switch' {
  export const Switch: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-accordion' {
  export const Accordion: ForwardRefExoticComponent<any>
  export const AccordionItem: ForwardRefExoticComponent<any>
  export const AccordionTrigger: ForwardRefExoticComponent<any>
  export const AccordionContent: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-popover' {
  export const Popover: ForwardRefExoticComponent<any>
  export const PopoverTrigger: ForwardRefExoticComponent<any>
  export const PopoverContent: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-tooltip' {
  export const Tooltip: ForwardRefExoticComponent<any>
  export const TooltipTrigger: ForwardRefExoticComponent<any>
  export const TooltipContent: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-toast' {
  export const Toast: ForwardRefExoticComponent<any>
  export const ToastProvider: ForwardRefExoticComponent<any>
  export const ToastViewport: ForwardRefExoticComponent<any>
  export const ToastTitle: ForwardRefExoticComponent<any>
  export const ToastDescription: ForwardRefExoticComponent<any>
  export const ToastAction: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-command' {
  export const Command: ForwardRefExoticComponent<any>
  export const CommandInput: ForwardRefExoticComponent<any>
  export const CommandList: ForwardRefExoticComponent<any>
  export const CommandEmpty: ForwardRefExoticComponent<any>
  export const CommandGroup: ForwardRefExoticComponent<any>
  export const CommandItem: ForwardRefExoticComponent<any>
}

declare module '@radix-ui/react-slot' {
  export const Slot: ForwardRefExoticComponent<any>
}
