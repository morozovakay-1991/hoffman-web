"use client";

import { useState } from "react";
import { LEGAL_LINKS } from "@/lib/site";
import { Modal } from "./Modal";

export function OfferDialog({ className }: { className: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={`${className} cursor-pointer`} onClick={() => setOpen(true)}>
        {LEGAL_LINKS.offer.label}
      </button>
      {open && (
        <Modal title="Публичная оферта" onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-4">
            <p className="text-[0.875rem] leading-[1.5]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="text-[0.875rem] leading-[1.5]">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-[0.875rem] leading-[1.5]">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
