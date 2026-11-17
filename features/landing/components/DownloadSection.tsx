import { Accent, SectionIntro, introColumnClass } from "./ui";

/** Якорь блока. */
export const DOWNLOAD_SECTION_ID = "download";

/** «Скачать приложение» (Figma 1313:5702): тонкие линии сверху и снизу, «Скоро в App Store и Google Play». */
export function DownloadSection() {
  return (
    <section
      id={DOWNLOAD_SECTION_ID}
      className="scroll-mt-4 border-y-[0.5px] border-hoffman-black px-4 pt-[54px] pb-[58px] lg:px-6"
    >
      <SectionIntro label="Скачать приложение">
        Начните <Accent>с одной практики</Accent> в день. <br className="hidden lg:inline" />
        <Accent>Небольшой шаг,</Accent> который со временем <Accent>становится опорой.</Accent>
      </SectionIntro>
      <div className={`mt-[54px] flex flex-col gap-10 lg:flex-row lg:items-center ${introColumnClass}`}>
        <p className="text-[1.75rem] leading-[2.125rem]">Скоро в App Store и Google Play</p>
        <p className="w-[300px] max-w-full text-[0.875rem] leading-[1.5]">
          Установите приложение и получите доступ <br className="hidden lg:inline" />к медитациям, статьям и
          инструментам.
        </p>
      </div>
    </section>
  );
}
