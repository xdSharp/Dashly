import { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Notifications } from "./notifications";

interface NotificationsPopoverProps {
  children: ReactNode;
}

export function NotificationsPopover({ children }: NotificationsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Notifications />
      </PopoverContent>
    </Popover>
  );
} 