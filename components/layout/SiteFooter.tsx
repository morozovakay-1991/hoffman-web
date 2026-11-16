import Link from "next/link";
import { CONTACTS, FOOTER_CONTACT_LINKS, FOOTER_SECTION_LINKS, LEGAL_LINKS, type SiteLink } from "@/lib/site";
import { StoreBadges } from "./StoreBadges";

// Футер публичных страниц (Figma 1228:3421): копирайт, контакты, разделы,
// юр. документы, бейджи App Store / Google Play.
const footerLinkClass = "flex min-h-[44px] items-center [overflow-wrap:anywhere] hover:underline lg:tap-target lg:relative lg:inline lg:min-h-0";

export function SiteFooter() {
  const legal = [LEGAL_LINKS.privacy, LEGAL_LINKS.offer, LEGAL_LINKS.license, LEGAL_LINKS.terms];

  return (
    <footer className="bg-hoffman-light-blue px-4 pt-[54px] lg:px-6 pb-[54px] text-[0.875rem] leading-[1.5] text-hoffman-black lg:min-h-[320px]">
      <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-0">
        <div className="flex flex-col lg:w-[298px]">
          <p className="text-[2rem] leading-[1.15] tracking-[-1.28px]">hoffman</p>
          <p className="mt-4">© 1991-{new Date().getFullYear()} Hoffman Institute International</p>
          <div className="mt-[26px]">
            <StoreBadges id="download-app" />
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

// На мобильном строки списка — 44px (цель нажатия), на десктопе — интервалы макета,
// а область нажатия ссылки расширена прозрачным tap-target.
function FooterList({ links, ariaLabel }: { links: SiteLink[]; ariaLabel: string }) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-col lg:gap-4">
        {links.map((link) => (
          <li key={link.label} className="flex min-h-[44px] items-center lg:block lg:min-h-0">
            {link.href === null ? (
              link.label
            ) : link.href.startsWith("/") ? (
              <Link href={link.href} className={footerLinkClass}>
                {link.label}
              </Link>
            ) : (
              <a href={link.href} className={footerLinkClass}>
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
