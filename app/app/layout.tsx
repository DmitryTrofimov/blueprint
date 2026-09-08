import { Sidebar } from "@/components/app/sidebar";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
