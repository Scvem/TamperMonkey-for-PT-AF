// ptaf-localstorage-validation.js
//
// Temporary DevTools validation snippet for real PT AF instances.
// Used to validate dashboard filter persistence logic via localStorage.
//
// This is NOT part of the production TamperMonkey userscript.

(function () {
  const ip = "10.10.10.10";

  const key = Object.keys(localStorage).find(k =>
    k.includes('dashboard.current.services.filter')
  );

  console.log("filter key:", key);

  if (!key) {
    console.warn("PT AF filter storage key not found");
    return;
  }

  const v = JSON.parse(localStorage.getItem(key) || '{}');

  v.list = v.list || {};
  v.ids = Array.isArray(v.ids) ? v.ids : [];

  // Find existing CLIENT_IP.raw filter if present
  let existingId = null;

  for (const [id, obj] of Object.entries(v.list)) {
    if (
      obj &&
      obj.field === 'CLIENT_IP.raw' &&
      obj.type === 'terms' &&
      obj.docType === 'attack'
    ) {
      existingId = id;
      break;
    }
  }

  // Reuse existing filter ID or generate a new one
  const newId = existingId !== null
    ? Number(existingId)
    : (v.ids.length ? Math.max(...v.ids.map(Number)) + 1 : 2);

  // Apply/update filter
  v.list[String(newId)] = {
    id: newId,
    active: true,
    type: "terms",
    field: "CLIENT_IP.raw",
    value: ip,
    mandate: "must",
    docType: "attack",
    alias: ""
  };

  if (!v.ids.map(Number).includes(newId)) {
    v.ids.push(newId);
  }

  localStorage.setItem(key, JSON.stringify(v));

  console.log("CLIENT_IP.raw filter applied:", ip);

  location.reload();
})();
