/* Estadísticas sin cookies de letradeley.es (GoatCounter, D-027, 26/11/2026).
   Además de las visitas (las cuenta count.js), cuenta unas pocas acciones, siempre en cifras de conjunto:
   - test empezado y test terminado en los tests gratis (aviso «ldl:sesion» del motor);
   - clics en «Avísame cuando salga», «Comprar», Telegram e Instagram.
   No usa cookies ni guarda nada en el dispositivo. count.js no cuenta nada en local (localhost o file://), así que las
   pruebas con Playwright no ensucian los datos. */
(function () {
  var pendientes = [];
  var pagina = location.pathname.replace(/^\/+|\/+$/g, "") || "inicio";

  function listo() {
    return window.goatcounter && typeof window.goatcounter.count === "function";
  }
  function contar(ruta, titulo) {
    if (!listo()) {
      if (pendientes.length < 20) pendientes.push([ruta, titulo]);
      return;
    }
    try { window.goatcounter.count({ path: ruta, title: titulo || ruta, event: true }); } catch (e) {}
  }
  // count.js se carga en diferido: lo que pase antes se cuenta en cuanto esté listo (como mucho, 10 segundos)
  var intentos = 0;
  var espera = setInterval(function () {
    if (listo() || ++intentos > 40) {
      clearInterval(espera);
      if (listo()) pendientes.splice(0).forEach(function (p) { contar(p[0], p[1]); });
    }
  }, 250);

  // Clics en los enlaces que importan, también en los que pinta el motor de los tests después de cargar
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var h = a.href || "";
    var tipo = /gumroad\.com\/subscribe/.test(h) ? "avisame"
      : /gumroad\.com\/l\//.test(h) ? "comprar"
      : /(^|\/\/)t\.me\//.test(h) ? "telegram"
      : /instagram\.com\//.test(h) ? "instagram" : null;
    if (tipo) contar(tipo + "/" + pagina, tipo + " · " + pagina);
  }, true);

  // Tests gratis: empezados y terminados
  document.addEventListener("ldl:sesion", function (e) {
    var d = e.detail || {};
    if (d.fase === "inicio") contar("test-empezado/" + pagina, "Test empezado · " + pagina);
    if (d.fase === "fin") contar("test-terminado/" + pagina, "Test terminado · " + pagina);
  });
})();
