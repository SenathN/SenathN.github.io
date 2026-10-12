import Icon from "./Icon";
import Mark from "./Mark";
import { site } from "../../content/site";

// Server-rendered. DepthSystem marks the active link, updates the depth
// readout and closes the mobile menu after a jump. The menu is a native
// <details>, so it still opens and closes without JavaScript.
export default function Nav() {
  return (
    <header className="nav" data-nav>
      <nav aria-label="Primary" className="wrap nav-inner">
        <a href="#home" className="brand">
          <Mark />
          <span>{site.name}</span>
        </a>

        <ul className="nav-links">
          {site.nav.map((item, i) => (
            <li key={item.href}>
              <a href={item.href} className="nav-link">
                <span className="nav-index" aria-hidden="true">
                  {String(i + 2).padStart(2, "0")}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-tools">
          <p className="nav-depth" aria-hidden="true">
            <span data-depth-readout>0</span>&nbsp;m<span className="nav-zone" data-zone-readout>Epipelagic</span>
          </p>
          <a href={site.cvHref} download className="btn-line nav-cv">
            CV
            <Icon name="download" className="w-3.5 h-3.5" />
          </a>
          <details className="menu" data-menu>
            <summary className="btn-line menu-toggle">
              <span className="menu-open-label">Menu</span>
              <span className="menu-close-label">Close</span>
            </summary>
            <div className="menu-panel">
              <ul className="menu-links">
                {site.nav.map((item, i) => (
                  <li key={item.href}>
                    <a href={item.href}>
                      <span className="nav-index" aria-hidden="true">
                        {String(i + 2).padStart(2, "0")}
                      </span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="menu-foot">
                <a href={`mailto:${site.contact.email}`} className="link-line">
                  {site.contact.email}
                </a>
                <a href={site.cvHref} download className="link-line">
                  {site.cv.label}
                </a>
              </div>
            </div>
          </details>
        </div>
      </nav>
      <span className="nav-progress" data-progress-bar aria-hidden="true" />
    </header>
  );
}
