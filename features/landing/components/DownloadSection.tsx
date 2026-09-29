import { StoreBadges } from "@/components/layout/StoreBadges";
import { Accent, SectionIntro, introColumnClass } from "./ui";

/** Якорь блока — на него ведут «Скачать приложение» в шапке и в блоке «О приложении». */
export const DOWNLOAD_SECTION_ID = "download";

/** «Скачать приложение» (Figma 1313:5702): тонкие линии сверху и снизу, бейджи сторов. */
export function DownloadSection() {
  return (
    <section
      id={DOWNLOAD_SECTION_ID}
      className="scroll-mt-4 border-y-[0.5px] border-hoffman-black px-6 pt-[54px] pb-[58px]"
    >
      <SectionIntro label="Скачать приложение">
        Начните <Accent>с одной практики</Accent> в день. <br className="hidden lg:inline" />
        <Accent>Небольшой шаг,</Accent> который со временем <Accent>становится опорой.</Accent>
      </SectionIntro>
      <div className={`mt-[54px] flex flex-col gap-10 lg:flex-row lg:items-center ${introColumnClass}`}>
        <StoreBadges tone="dark" />
        <p className="w-[300px] max-w-full text-[14px] leading-[1.5]">
          Установите приложение и получите доступ <br className="hidden lg:inline" />к медитациям, статьям и
          инструментам.
        </p>
      </div>
    </section>
  );
}
