import { DOWNLOAD_SECTION_ID } from "./DownloadSection";
import { Accent, ButtonLink, SectionIntro, introColumnClass } from "./ui";

/** Кнопка растянута на ширину колонки, текст и иконка по центру. */
const mobileFullWidth = "max-lg:w-full max-lg:justify-center";

/** «О приложении» (Figma 1313:2351) — под hero, отделён снизу тонкой линией. */
export function AboutSection() {
  return (
    <section className="border-b-[0.5px] border-hoffman-black px-4 pt-[54px] pb-[54px] lg:px-6">
      <SectionIntro label="О приложении">
        Мобильное приложение hoffman <br className="hidden lg:inline" />
        <Accent>
          – поддержка и структура для тех, кто <br className="hidden lg:inline" />
          хочет
        </Accent>{" "}
        системно работать над собой.
      </SectionIntro>
      <div className={`mt-[54px] flex flex-col gap-10 lg:flex-row lg:items-center ${introColumnClass}`}>
        {/* На мобильном: текст над кнопками, кнопки во всю ширину столбиком (макета нет). */}
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:gap-[38px]">
          <ButtonLink href="/register" variant="dark" layoutClassName={mobileFullWidth}>
            Начать бесплатно
          </ButtonLink>
          <ButtonLink href={`#${DOWNLOAD_SECTION_ID}`} variant="light" layoutClassName={mobileFullWidth}>
            Скачать приложение
          </ButtonLink>
        </div>
        <p className="w-[300px] max-w-full text-[0.875rem] leading-[1.5] max-lg:order-first">
          Все под рукой – в удобном для вас темпе, когда нужна пауза.
        </p>
      </div>
    </section>
  );
}
