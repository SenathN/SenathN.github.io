// Runs before first paint and marks that JavaScript is available. Reveal
// animations and the layer explorer only hide content under html.js, so
// visitors without JavaScript always get the full page.
const script = `document.documentElement.classList.add('js')`;

export default function BootScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
