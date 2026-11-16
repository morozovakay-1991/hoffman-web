import { SiteHeader } from "@/components/layout/SiteHeader";

export default function PublicPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
    </>
  );
}
