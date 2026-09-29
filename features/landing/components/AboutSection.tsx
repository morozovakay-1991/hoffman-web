import { DOWNLOAD_SECTION_ID } from "./DownloadSection";
import { Accent, ButtonLink, SectionIntro, introColumnClass } from "./ui";

/** «О приложении» (Figma 1313:2351) — под hero, отделён снизу тонкой линией. */
export function AboutSection() {
  return (
    <section className="border-b-[0.5px] border-hoffman-black px-6 pt-[54px] pb-[54px]">
      <SectionIntro label="О приложении">
        Мобильное приложение hoffman <br className="hidden lg:inline" />
        <Accent>
          – поддержка и структура для тех, кто <br className="hidden lg:inline" />
          хочет
        </Accent>{" "}
        системно работать над собой.
      </SectionIntro>
      <div className={`mt-[54px] flex flex-col gap-10 lg:flex-row lg:items-center ${introColumnClass}`}>
        <div className="flex flex-wrap gap-[38px]">
          <ButtonLink href="/register" variant="dark">
            Начать бесплатно
          </ButtonLink>
          <ButtonLink href={`#${DOWNLOAD_SECTION_ID}`} variant="light">
            Скачать приложение
          </ButtonLink>
        </div>
        <p className="w-[300px] max-w-full text-[14px] leading-[1.5]">
          Все под рукой – в удобном для вас темпе, когда нужна пауза.
        </p>
      </div>
    </section>
  );
}
