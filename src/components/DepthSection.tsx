import SectionHead from "./SectionHead";
import DepthExplorer from "./DepthExplorer";
import { profilePath } from "@/lib/contours";
import { site, zoneAttrs } from "../../content/site";

// Capabilities as a geological cross-section: interfaces at the surface,
// architecture and people at the bedrock. Boundary profiles are generated
// here at build time and handed to the client explorer as plain strings.
export default function DepthSection() {
  const profiles = site.layers.map((_, i) => profilePath(200 + i * 17, 1000, 14, 9 + i * 1.5, 28, 3.2));
  return (
    <section {...zoneAttrs("depth")} className="section" aria-labelledby="depth-title">
      <div className="wrap">
        <SectionHead
          id="depth"
          title={
            <>
              From the interface
              <br className="hidden md:block" /> down to bedrock.
            </>
          }
          intro="Five layers I work across, from what people see to what everything stands on. Pick one for the tools and the work behind it."
        />
        <DepthExplorer layers={site.layers} profiles={profiles} />
      </div>
    </section>
  );
}
