import { Button } from "@iq24/ui/button";
import { Icons } from "@iq24/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@iq24/ui/tooltip";

type Props = {
  disabled: boolean;
  onClick: () => void;
};

export function SyncTransactions({ onClick, disabled }: Props) {
  return (
    <TooltipProvider delayDuration={70}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-7 h-7 flex items-center"
            disabled={disabled}
            onClick={onClick}
          >
            <Icons.Refresh size={16} />
          </Button>
        </TooltipTrigger>

        <TooltipContent className="px-3 py-1.5 text-xs" sideOffset={10}>
          Synchronize
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
