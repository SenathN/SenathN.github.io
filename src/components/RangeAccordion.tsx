"use client";

import { useState } from "react";
import Icon from "./Icon";
import { site } from "../../content/site";

export default function RangeAccordion() {
  const [openId, setOpenId] = useState<string>(site.range[0].id);

  return (
    <div className="flex flex-col md:flex-row border-y border-[var(--line)] md:h-[460px]">
      {site.range.map((panel, i) => {
        const isOpen = openId === panel.id;
        return (
          <div
            key={panel.id}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-controls={`panel-${panel.id}`}
            onClick={() => setOpenId(panel.id)}
            onMouseEnter={() => {
              if (window.matchMedia("(hover: hover)").matches) setOpenId(panel.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenId(panel.id);
              }
            }}
            className={`range-panel relative cursor-pointer border-b md:border-b-0 md:border-r last:border-0 border-[var(--line)] flex flex-col p-6 md:p-8 min-w-0 overflow-hidden md:basis-0 ${
              isOpen ? "md:grow-[5]" : "md:grow"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="label">{String(i + 1).padStart(2, "0")}</span>
              <span
                className={`grid place-items-center w-10 h-10 rounded-full border transition-colors duration-300 ${
                  isOpen ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]" : "border-[var(--line-strong)] text-[var(--muted)]"
                }`}
              >
                <Icon name={panel.icon} className="w-[18px] h-[18px]" />
              </span>
            </div>

            <div id={`panel-${panel.id}`} className="mt-auto pt-10 md:pt-0">
              <h3
                className={`display-md whitespace-nowrap transition-colors ${
                  isOpen ? "text-[var(--ink)]" : "text-[var(--muted)] md:[writing-mode:vertical-rl] md:rotate-180"
                }`}
              >
                {panel.title}
              </h3>
              {isOpen && (
                <div className="range-detail mt-5 max-w-md">
                  <p className="text-lg md:text-xl text-[var(--ink)] mb-6">{panel.statement}</p>
                  <ul className="flex flex-wrap gap-2">
                    {panel.tools.map((tool) => (
                      <li key={tool} className="mono text-xs border border-[var(--line-strong)] px-3 py-1.5">
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
