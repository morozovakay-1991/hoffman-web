import { SiteFooter } from "@/components/layout/SiteFooter";

// Шапку рендерят вложенные разделы: на лендинге она светлая и лежит поверх фото hero,
// на остальных публичных страницах — обычная (см. (pages)/layout.tsx).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-hoffman-black">
      {children}
      <SiteFooter />
    </div>
  );
}
