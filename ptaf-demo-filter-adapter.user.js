// ==UserScript==
// @name         PT AF Demo Filter Adapter
// @namespace    local.demo.ptaf
// @version      1.0
// @description  Применяет фильтр CLIENT_IP.raw из URL в localStorage демо-PT AF
// @match        http://192.168.32.133/*
// @match        http://ptaf-demo.local/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'demo.dashboard.current.services.filter';
  const FILTER_ID = '1';
  const FILTER_FIELD = 'CLIENT_IP.raw';
  const RELOAD_MARKER = '__ptaf_demo_filter_applied__';

  function getIpFromUrl() {
    try {
      const url = new URL(window.location.href);

      const ipFromSearch = url.searchParams.get('ip');
      if (ipFromSearch) return ipFromSearch.trim();

      if (url.hash) {
        const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
        const hashUrl = new URL('http://dummy.local/' + hash.replace(/^\//, ''));
        const ipFromHashSearch = hashUrl.searchParams.get('ip');
        if (ipFromHashSearch) return ipFromHashSearch.trim();
      }
    } catch (e) {
      console.error('[PT AF Demo] Ошибка разбора URL:', e);
    }

    return null;
  }

  function isValidIp(ip) {
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
    return ipv4.test(ip);
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"list":{},"ids":[]}');
    } catch (e) {
      console.warn('[PT AF Demo] localStorage поврежден, создаю новый объект');
      return { list: {}, ids: [] };
    }
  }

  function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getCurrentFilterValue(state) {
    const entry = state?.list?.[FILTER_ID];
    if (!entry) return null;
    if (entry.field !== FILTER_FIELD) return null;
    return entry.value || null;
  }

  function applyIpFilter(ip) {
    const state = readState();

    if (!state.list || typeof state.list !== 'object') {
      state.list = {};
    }

    if (!Array.isArray(state.ids)) {
      state.ids = [];
    }

    const currentValue = getCurrentFilterValue(state);

    state.list[FILTER_ID] = {
      id: Number(FILTER_ID),
      active: true,
      type: 'terms',
      field: FILTER_FIELD,
      value: ip,
      mandate: 'must',
      docType: 'attack',
      alias: ''
    };

    if (!state.ids.map(String).includes(FILTER_ID)) {
      state.ids.push(Number(FILTER_ID));
    }

    writeState(state);

    return currentValue !== ip;
  }

  function removeIpFromUrl() {
    try {
      const url = new URL(window.location.href);
      let changed = false;

      if (url.searchParams.has('ip')) {
        url.searchParams.delete('ip');
        changed = true;
      }

      if (url.hash.includes('?')) {
        const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
        const hashUrl = new URL('http://dummy.local/' + hash.replace(/^\//, ''));

        if (hashUrl.searchParams.has('ip')) {
          hashUrl.searchParams.delete('ip');
          const cleanHash =
            '#/' +
            hashUrl.pathname.replace(/^\//, '') +
            (hashUrl.search ? hashUrl.search : '');
          url.hash = cleanHash;
          changed = true;
        }
      }

      if (changed) {
        history.replaceState(null, '', url.toString());
      }
    } catch (e) {
      console.warn('[PT AF Demo] Не удалось очистить URL:', e);
    }
  }

  function main() {
    const ip = getIpFromUrl();
    if (!ip) return;

    if (!isValidIp(ip)) {
      console.warn('[PT AF Demo] Некорректный IP в URL:', ip);
      return;
    }

    const alreadyReloadedForThisValue = sessionStorage.getItem(RELOAD_MARKER) === ip;
    const changed = applyIpFilter(ip);

    removeIpFromUrl();

    if (changed && !alreadyReloadedForThisValue) {
      sessionStorage.setItem(RELOAD_MARKER, ip);
      window.location.reload();
      return;
    }

    sessionStorage.removeItem(RELOAD_MARKER);
    console.log('[PT AF Demo] Фильтр применён:', ip);
  }

  main();
})();