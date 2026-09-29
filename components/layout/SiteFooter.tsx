import Link from "next/link";
import { CONTACTS, FOOTER_CONTACT_LINKS, FOOTER_SECTION_LINKS, LEGAL_LINKS, type SiteLink } from "@/lib/site";
import { StoreBadges } from "./StoreBadges";

// Футер публичных страниц (Figma 1228:3421): копирайт, контакты, разделы,
// юр. документы, бейджи App Store / Google Play.
export function SiteFooter() {
  const legal = [LEGAL_LINKS.privacy, LEGAL_LINKS.offer, LEGAL_LINKS.license, LEGAL_LINKS.terms];

  return (
    <footer className="bg-hoffman-light-blue px-6 pt-[54px] pb-[54px] text-[14px] leading-[1.5] text-hoffman-black lg:min-h-[320px]">
      <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-0">
        <div className="flex flex-col lg:w-[298px]">
          <p className="text-[32px] leading-[1.15] tracking-[-1.28px]">hoffman</p>
          <p className="mt-4">© 1991-{new Date().getFullYear()} Hoffman Institute International</p>
          <div className="mt-[26px]">
            <StoreBadges />
          </div>
        </div>

        <FooterList
          ariaLabel="Контакты"
          links={[
            { label: CONTACTS.email, href: `mailto:${CONTACTS.email}` },
            { label: CONTACTS.phone, href: CONTACTS.phoneHref },
            ...FOOTER_CONTACT_LINKS,
          ]}
        />
        <FooterList ariaLabel="Разделы" links={FOOTER_SECTION_LINKS} />

        <div className="flex flex-col gap-4 lg:w-[285px]">
          <p>Размещенные на сайте предложения и цены являются публичной офертой (Ст. 437, 494 ГК РФ).</p>
          <FooterList ariaLabel="Документы" links={legal} />
        </div>
      </div>
    </footer>
  );
}

function FooterList({ links, ariaLabel }: { links: SiteLink[]; ariaLabel: string }) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-col gap-4">
        {links.map((link) => (
          <li key={link.label}>
            {link.href === null ? (
              link.label
            ) : link.href.startsWith("/") ? (
              <Link href={link.href} className="hover:underline">
                {link.label}
              </Link>
            ) : (
              <a href={link.href} className="hover:underline">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
