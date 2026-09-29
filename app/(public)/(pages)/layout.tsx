import { SiteHeader } from "@/components/layout/SiteHeader";

export default function PublicPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}
