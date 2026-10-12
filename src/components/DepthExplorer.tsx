"use client";

import { Fragment, useState } from "react";
import type { Layer } from "../../content/site";

// One stratum is always open. Click, Enter/Space, focus, or (with a fine
// pointer) hover selects it. On wide screens the open layer's detail sits in
// the right column; on narrow screens it opens in place under its stratum.
// Without JavaScript every detail is shown (see .js rules in globals.css).
export default function DepthExplorer({ layers, profiles }: { layers: Layer[]; profiles: string[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="strata" style={{ "--rows": layers.length } as React.CSSProperties} data-reveal>
      {layers.map((layer, i) => {
        const open = i === active;
        return (
          <Fragment key={layer.id}>
            <button
              type="button"
              id={`stratum-${layer.id}`}
              className={`stratum ${open ? "is-open" : ""}`}
              aria-expanded={open}
              aria-controls={`layer-${layer.id}`}
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setActive(i);
              }}
              style={{ "--k": i } as React.CSSProperties}
            >
              <svg className="stratum-edge" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path d={`${profiles[i]}L1000 40L0 40Z`} className="stratum-fill" />
                <path d={profiles[i]} className="stratum-line" vectorEffect="non-scaling-stroke" />
              </svg>
              <span className="stratum-node" aria-hidden="true" />
              <span className="stratum-index t-label" aria-hidden="true">
                L{String(i + 1).padStart(2, "0")}
              </span>
              <span className="stratum-name t-label">{layer.stratum}</span>
              <span className="stratum-title">{layer.title}</span>
              <span className="stratum-statement">{layer.statement}</span>
            </button>

            <div
              id={`layer-${layer.id}`}
              role="region"
              aria-labelledby={`stratum-${layer.id}`}
              className={`layer-detail ${open ? "is-open" : ""}`}
            >
              <div className="layer-detail-inner" key={open ? "open" : "closed"}>
                <p className="t-label">
                  Layer {String(i + 1).padStart(2, "0")} · {layer.stratum}
                </p>
                <h3 className="t-title layer-title">{layer.title}</h3>
                <p className="layer-statement">{layer.statement}</p>
                <p className="t-body">{layer.detail}</p>

                <h4 className="t-label layer-subhead">Tools</h4>
                <ul className="slash-list">
                  {layer.tools.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                <h4 className="t-label layer-subhead">Evidence</h4>
                <ul className="evidence">
                  {layer.evidence.map((e) => (
                    <li key={e.label}>
                      <a href={e.href} className="evidence-link">
                        <span>{e.label}</span>
                        <span aria-hidden="true" className="evidence-arrow">
                          ↘
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
