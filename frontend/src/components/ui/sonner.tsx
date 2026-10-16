import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      richColors
      duration={2200}
      offset="64px"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-900 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-xl rounded-2xl text-xs font-medium py-3 px-4",
          description: "group-[.toast]:text-zinc-600 text-[11px]",
          actionButton: "group-[.toast]:bg-amber-500 group-[.toast]:text-zinc-950 font-bold rounded-lg text-xs",
          cancelButton: "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-700 rounded-lg text-xs",
          success: "group-[.toaster]:!border-emerald-300 group-[.toaster]:!bg-emerald-50 group-[.toaster]:!text-emerald-900",
          error: "group-[.toaster]:!border-rose-300 group-[.toaster]:!bg-rose-50 group-[.toaster]:!text-rose-900",
          info: "group-[.toaster]:!border-amber-300 group-[.toaster]:!bg-amber-50 group-[.toaster]:!text-amber-900",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

