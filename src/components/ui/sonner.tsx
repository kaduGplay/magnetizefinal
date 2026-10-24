import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      closeButton
      duration={5000}
      visibleToasts={3}
      expand
      swipeDirections={["top", "left", "right"]}
      toastOptions={{
        classNames: {
          toast:
            "group toast pointer-events-auto touch-pan-y select-none flex items-start gap-3 !rounded-2xl !border !border-white/10 !bg-zinc-900/95 !text-white !shadow-2xl !shadow-black/50 backdrop-blur-xl pl-4 pr-11 py-3.5",
          title: "!text-white text-sm font-semibold leading-snug",
          description: "!text-white/70 text-xs leading-snug mt-0.5",
          actionButton:
            "!rounded-full !bg-gradient-to-r !from-primary !to-orange-500 !text-white !text-xs !font-bold !px-3 !py-1.5",
          cancelButton: "!rounded-full !bg-white/10 !text-white/80 !text-xs !px-3 !py-1.5",
          closeButton:
            "!left-auto !right-2 !top-1/2 !-translate-y-1/2 !translate-x-0 !bg-white/10 hover:!bg-white/20 !border-0 !text-white/70 hover:!text-white !rounded-full !w-7 !h-7 !flex !items-center !justify-center transition-colors",
          success: "!border-emerald-500/30",
          error: "!border-red-500/40",
          warning: "!border-orange-500/40",
          info: "!border-white/10",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
