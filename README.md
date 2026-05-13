# PT AF Demo Filter Adapter

TamperMonkey userscript that injects deep-link based filters into a custom/self-hosted PT AF demo dashboard via `localStorage`.

The script extracts the `ip` parameter from the URL (query string or hash route), validates it as IPv4, and automatically applies it as a `CLIENT_IP.raw` filter inside the dashboard state. After applying the filter, it cleans the URL and reloads the page once to ensure the dashboard picks up the updated state.

The demo dashboard itself is **not an official Positive Technologies AF installation**. It is a custom-built internal prototype that mimics parts of the PT AF interface and filter storage structure. Widget/block names and dashboard state handling were intentionally implemented similarly to PT AF for prototyping and integration testing purposes.

Filter persistence and `localStorage` behavior were reverse-engineered and validated against a real PT AF installation using browser DevTools (`F12`), so the filtering logic is based on actual PT AF behavior. However, the userscript itself has only been tested against the custom/self-hosted demo implementation.

## Real PT AF validation snippet

The filter storage logic was additionally validated manually on a real PT AF instance via browser DevTools (`F12`).

For that purpose, a temporary console snippet was used to locate the PT AF dashboard filter key in `localStorage`, insert/update a `CLIENT_IP.raw` filter, save the modified dashboard filter state, and reload the page.

This snippet was used only for validating the filter format and persistence behavior on real PT AF. It is not part of the TamperMonkey userscript and was not intended for regular use or deployment.

See: `ptaf-localstorage-validation.js`

Originally designed for prototyping PT AF deep-link integrations and quick navigation to filtered attack views.

Compatibility with production Positive Technologies AF installations has not yet been verified due to current organizational policy restrictions regarding browser userscripts/TamperMonkey deployment.