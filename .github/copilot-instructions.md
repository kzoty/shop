# Copilot Instructions for Padaria Artesanal - PDV

## Big Picture & Architecture
- This is a browser-based POS (Ponto de Venda) for a bakery, built with HTML, CSS, and JavaScript (single-page app style).
- All business logic is in `script.js`. UI is in `index.html` and styled by `styles.css`.
- Data is persisted and managed via Supabase (Postgres + Auth). No backend code in this repo.
- Main entities: `categories`, `products`, `sales`, `sale_items`, and `authorized_users`.
- User authentication and session management are handled via Supabase Auth. Only authorized users can access the app.
- The app is designed to be mobile-first and PWA-ready, with offline support and touch gestures.

## Developer Workflows
- No build step: edit files directly and reload in browser.
- For local development, use a static server (e.g. `python -m http.server 8000`).
- All configuration (Supabase keys, etc.) is in `script.js`.
- To add new tables or change auth, use SQL scripts in `CONFIGURACAO_AUTH.md` and Supabase dashboard.
- Debugging: Use browser dev tools. All state is in JS variables; Supabase errors are logged to console.
- No automated tests or CI/CD. Manual testing is expected.

## Project-Specific Patterns & Conventions
- Categories and products are loaded from Supabase and cached in JS arrays (`categories`, `products`).
- Filtering is done client-side by matching `category_id` in products to selected category.
- Double-click/double-tap on categories opens edit modal (see event handlers in `script.js`).
- Cart is managed in-memory (`cart` array) and cleared after each sale.
- Sales are logged in Supabase: one record in `sales`, multiple in `sale_items` (see finalizeSale logic).
- All UI updates are direct DOM manipulations (no framework).
- FontAwesome is used for icons; icon names are stored in category/product objects.
- Responsive/mobile support: use touch events, viewport units, and safe-area insets.
- PWA features (manifest, service worker) are present for installability and offline use.

## Integration Points & External Dependencies
- Supabase: used for Auth, DB, and all data persistence. See initialization in `script.js`.
- FontAwesome: loaded via CDN for icons.
- No other external libraries/frameworks.

## Key Files & Directories
- `index.html`: main UI, includes all scripts/styles.
- `script.js`: all app logic, including data loading, filtering, cart, sales, modals, and Supabase integration.
- `styles.css`: layout and responsive design.
- `CONFIGURACAO_AUTH.md`: SQL setup for Supabase Auth/users.
- `README.md`: user/developer documentation.

## Example Patterns
- Filtering products:
  ```js
  filteredProducts = products.filter(product => product.category_id === selectedCategoryId);
  ```
- Logging a sale:
  ```js
  // Insert into 'sales', then bulk insert into 'sale_items' with sale_id
  ```
- Double-tap to edit:
  ```js
  element.addEventListener('touchend', handleDoubleTapEdit);
  ```

---

If any section is unclear or missing, please provide feedback so we can iterate and improve these instructions for future AI agents.
