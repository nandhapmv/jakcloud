import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      richColors
      duration={2200}
      offset="64px"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#18181f]/95 group-[.toaster]:text-zinc-100 group-[.toaster]:border-white/15 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl rounded-2xl text-xs font-medium py-3 px-4",
          description: "group-[.toast]:text-zinc-400 text-[11px]",
          actionButton: "group-[.toast]:bg-amber-500 group-[.toast]:text-zinc-950 font-semibold rounded-lg text-xs",
          cancelButton: "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300 rounded-lg text-xs",
          success: "group-[.toaster]:!border-emerald-500/40 group-[.toaster]:!bg-[#0f1f15]/95 group-[.toaster]:!text-emerald-300",
          error: "group-[.toaster]:!border-rose-500/40 group-[.toaster]:!bg-[#200f12]/95 group-[.toaster]:!text-rose-300",
          info: "group-[.toaster]:!border-amber-500/40 group-[.toaster]:!bg-[#1f1a0f]/95 group-[.toaster]:!text-amber-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

