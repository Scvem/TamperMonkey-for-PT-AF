# TamperMonkey-for-PT-AF

PT AF Demo Filter Adapter

TamperMonkey userscript that injects deep-link based filters into the PT AF demo dashboard via localStorage.

The script extracts the `ip` parameter from the URL (query string or hash route), validates it as IPv4, and automatically applies it as a `CLIENT_IP.raw` filter inside the dashboard state. After applying the filter, it cleans the URL and reloads the page once to ensure the dashboard picks up the updated state.

Originally designed for prototyping PT AF deep-link integrations and quick navigation to filtered attack views.

Tested only against a custom/self-hosted PT AF demo implementation. Compatibility with production Positive Technologies AF installations has not yet been verified due to deployment policy restrictions regarding browser userscripts/TamperMonkey.

