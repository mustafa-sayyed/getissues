import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavButtonProps = {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

/** Ghost back link — identical on every onboarding step. */
export function BackButton({ onClick, children, className }: NavButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "group h-10 cursor-pointer rounded-full px-4 text-sm font-medium",
        className,
      )}
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
      {children ?? "Back"}
    </Button>
  );
}

/** Primary forward action — identical on every onboarding step. */
export function PrimaryButton({
  onClick,
  children,
  className,
  disabled,
  withArrow = true,
}: NavButtonProps & { withArrow?: boolean }) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group h-13 cursor-pointer rounded-full px-8 text-base font-semibold",
        className,
      )}
    >
      {children}
      {withArrow && (
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      )}
    </Button>
  );
}
