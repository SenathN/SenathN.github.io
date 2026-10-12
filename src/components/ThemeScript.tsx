// Runs before first paint:
// - marks that JS is running, so reveal animations can hide content only when
//   they will also be able to show it again;
// - sets data-theme from the stored choice, or from the OS when none is stored,
//   and keeps following the OS while no choice is stored.
const script = `(function(){
  var d = document.documentElement;
  d.classList.add('js');
  var mq = window.matchMedia('(prefers-color-scheme: light)');
  function stored() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function apply() { var t = stored(); d.dataset.theme = t === 'light' || t === 'dark' ? t : (mq.matches ? 'light' : 'dark'); }
  apply();
  mq.addEventListener('change', apply);
})()`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
