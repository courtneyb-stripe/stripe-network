# Capability explorer — prototype spec

## Intent

A three-tab prototype that explains Stripe's capability system and lets the team play with how configurations drive UAD status signals.

- **Tab 1 — UAD status groups.** An interactive playground. Toggle configurations (compliance roles) and see which status signals light up, which capability groups they draw from, and which products participate. Fold rules, auto-selects, and billing/tax toggles apply live.
- **Tab 2 — Capability ↔ Status groups.** A read-only mapping with hybrid selection: all cap-group → signal edges visible at low opacity by default; click a group or signal to raise its connections. Inline notes capture design rationale (Billing, Atlas, Tax reporting, Crypto, Core, Storer).
- **Tab 3 — Capabilities map.** A reference view with an inner **Products | Configs** control. **Products** mode shows how user-facing products map to doc-level capability groups and granular caps (solid = backs, dashed = requires). **Configs** mode shows platform-network configurations (plus a non-clickable Customer row) with solid vs dotted edges to groups (full vs partial mapping) and filtered granular caps per group.

The prototype answers three questions: Tab 3 answers *what the taxonomy is*, Tab 2 answers *how groups connect to UAD signals*, and Tab 1 answers *how UAD reflects an account's configuration*. Tab order follows that narrative.

## Source of truth

- **`src/data/capabilityModel.ts`** — data model and resolver functions. Import directly; do not re-inline the data.
- **`docs/stripe-capability-mesh.html`** — reference implementation of behavior. Open it to verify interactions, not to copy SVG layout math.

The TS file is authoritative. If the HTML and TS disagree, TS wins; the HTML is a standalone viz that inlines data for rendering convenience.

## Route

All tabs live at **`/network/capability-explorer`** (and **`/capability-explorer`**) with tab-switcher state in the URL:

| Tab | URL param | Default |
|-----|-----------|---------|
| UAD status groups | `?tab=uad` | **yes** (first load) |
| Capability ↔ Status groups | `?tab=mapping` | |
| Capabilities map | `?tab=map` | |

Legacy: `?tab=signals` resolves to `uad`; `?tab=products` resolves to `map`.

## State integration

**Self-contained.** The explorer does not read from or write to `PrototypeContext`. Selections in the playground do not affect UAD state elsewhere.

If we later want the playground to drive UAD state, add an explicit "Apply to current UAD" button. Don't two-way bind.

## Component structure

```
CapabilityExplorer                — top-level, manages tab state and URL
├── TabSwitcher                   — three tabs (UAD status groups, Capability ↔ Status groups, Capabilities map)
├── SignalsTab                    — Tab 1 (UAD playground; unchanged behavior vs prior spec)
│   ├── PlaygroundControls        — billing toggle, tax toggle, relationship indicator
│   ├── ConfigurationsColumn
│   │   ├── PlatformNetwork       — selectable pills
│   │   └── NotPlatformNetwork    — derived indicators
│   ├── SignalsColumn
│   │   ├── InHeader              — 7 signal pills
│   │   └── ActionsRequired       — Tax reporting (dotted outline)
│   ├── RightColumn               — capability groups + products (dynamic)
│   ├── Edges                     — SVG overlay (configs → signals, signals → caps/products)
│   └── InfoBox                   — active configs, lit signals, fold notice
├── MappingTab                    — Tab 2 (groups ↔ signals, selection raises edges)
│   └── MappingMeshEdges
└── ProductsTab                   — Tab 3 (Capabilities map)
    ├── BabySegmentedControl      — Products | Configs
    ├── ProductsColumn            — Products mode: product pills
    ├── ConfigsColumn             — Configs mode: config pills + Customer note row
    ├── CapabilityGroupsColumn    — doc families, rows with count badges
    ├── GranularCapsColumn        — drills into selection (configs: filtered caps per group)
    └── ProductsMeshEdges         — products → groups OR configs → groups
```

## Tab 3 — Capabilities map

### Modes

**Products (default).** Same behavior as the former single “Products ↔ capabilities” tab:

- Start empty: products lit, groups dimmed, granular caps column empty.
- Click a product → its capability groups light up. Edges: solid for "backs", dashed for "requires".
- Click a group → granular caps appear in the third column.
- Clicking a selected product or group deselects it.

**Configs.**

- Left column lists Merchant, Recipient, GP Recipient, Storer, Borrower, Card issuer as pills, then **Customer** as a plain non-clickable row: “no backing capabilities — relationship only.” Derived configs (Card holder, Merchant's customer) are omitted.
- Click a config → edges to its capability groups; **dotted** = partial mapping (subset of caps in that group), **solid** = full mapping. Granular caps list only caps relevant to that config in each group (`getRelevantCapsForConfigInGroup`).
- Single-select; click again to deselect.
- Switching **Products | Configs** clears the current selection.

### Products to show (Products mode)

Ten user-facing products (unchanged):

| Product | Touches | Relationship |
|---|---|---|
| Payments | core, payment_methods | backs |
| Connect | core, misc | backs |
| Issuing | issuing | backs |
| Treasury | banking, storer | backs |
| Capital | lending | backs |
| Tax | tax | backs |
| Atlas | atlas | backs |
| Billing | payment_methods | requires |
| Checkout | payment_methods | requires |
| Terminal | payment_methods | requires |

### Visual notes

- Product / config pills: same pill treatment as configuration pills on Tab 1 when applicable.
- Capability group rows: label + right-aligned count badge. Plain row, no pill.
- Granular caps: monospaced, compact (10-11px).

## Tab 1 — UAD status groups (playground)

### Behavior

**Configurations.**

- 6 platform-network configs are selectable pills. Clicking toggles.
- Derived configs (Card holder, Merchant's customer) are **not selectable**. They appear as plain indicators when their parent is active.
- `merchant_customer` is derived from `merchant`. `card_holder` is derived from `card_issuer`. Derived configs contribute no signals — they're outcomes, not drivers.

**Status signals.**

- 7 header signals + 1 actions-required signal (Tax reporting) in two sectioned subcolumns.
- Tax reporting pill gets a **dotted outline** on top of the sectioning.
- A signal lights up when any active (expanded) configuration's signals include it.
- Billing signal activates when Merchant is active AND the billing toggle is on.
- Tax reporting signal activates when Merchant is active AND the tax toggle is on.
- **Fold rule**: when Storer and Recipient are both active, Transfers is removed and Financial accounts stays (see `foldRules` in the model).

**Right column (capability groups + products).**

- When no configs are active (and no toggles): show all items dimmed as structural preview.
- When anything is active: show only items whose signals intersect with active signals. Others hide.

**Controls.**

- Billing toggle: disabled when Merchant is not active.
- Tax reporting toggle: disabled when Merchant is not active.
- Preset buttons: "Default", "Show fold rule", "Full platform", "Clear."

**Indicators.**

- "Relationship-only" indicator when all active configs have no compliance.
- Fold notice lives in the info box.

### Visual notes

**Configuration pill colors** — unchanged from prior spec (see locked decisions / PlatformNetwork).

**Edge treatment (Tab 1).**

- Config → signal edges: colored by source config. 0.5 opacity.
- Billing edge (Merchant → Billing signal): dashed, Merchant's color.
- Signal → cap group / signal → product edges: neutral `--edge` color. 0.5 opacity.

## Tab 2 — Capability ↔ Status groups

### Behavior

- All group → signal edges from `getSignalsByCapabilityGroup` are drawn at low opacity by default (~0.28).
- Click a capability group → outbound edges to its signals raise; connected signals emphasize; other rows dim slightly.
- Click a status signal → inbound edges from backing groups raise; connected groups emphasize.
- Selection is mutually exclusive (group vs signal); click the same item again to clear selection.
- Inline italic notes always visible for Billing, Tax reporting, Atlas, Crypto, Core, Storer (see UI copy in `MappingTab.tsx`).

### Visual notes

- Neutral gray strokes; same cubic geometry as other explorer meshes.
- Tax reporting row uses dotted outline (Tab 1 parity).

## Locked decisions (don't regress these)

These represent a lot of back-and-forth alignment; if Cursor pushes toward changing any, check with me first.

1. **Billing is not a capability group.** It's a product and a status signal, but has no dedicated capability. Don't add it to `CapabilityGroupId`.
2. **Crypto is not a product.** It's a capability group only. Don't put it in the products column or `ProductId`.
3. **card_issuer, not issuer.** The configuration and the status signal share the noun "Card issuer." The capability group is named "Card issuing" (the activity). Three distinct concepts, three specific labels.
4. **Only Merchant distributes.** Every other platform-network config is "direct." Derived configs are "indirect."
5. **Tax signal is not in the UAD header.** It's actions-required only. Dotted outline + section header reinforce this visually.
6. **Payouts and Crypto don't connect.** No crypto capability maps to the Payouts signal. The crypto split is across Payments, Transfers, and Financial accounts — three signals, not four.
7. **Derived configs are not selectable and not pills.** They're outcome indicators. They have no capabilities and contribute no signals.
8. **Fold rule: Transfers → Financial accounts when Storer AND Recipient are both active.** The folded pill disappears completely; indicator text in the info box (not the top controls) explains.

## Non-goals (for this pass)

- Persistence. State resets on page load.
- URL-encoded state beyond the tab switcher.
- Animating the fold (Transfers pill just disappears).
- Dark mode (unless the prototype has it globally — match whatever's there).
- Editing the capability model from the UI. It's read-only.
- Hover tooltips on pills. Click-only interaction is enough.

## Implementation notes for Cursor

**Import, don't duplicate.** The standalone HTML inlines data as JS objects. In React, import from `src/data/capabilityModel.ts`. Use `resolveSignalsForConfigurations`, `expandConfigurationsWithAutoSelect`, and the helper functions the model exposes. Do not reimplement the resolver.

**Use CSS Grid or Flexbox for columns, SVG only for edges.** The reference HTML uses absolute SVG coordinates because it has no layout engine. React has Grid — don't port ~300 lines of positioning math. Columns flow with natural layout; an absolutely-positioned SVG overlay at the container level draws edges between them. Anchor points come from `getBoundingClientRect()`, recomputed on resize.

**Baby UI where it fits.** Pills, badges, and informational rows likely map to Baby UI components. If a shape doesn't exist in Baby UI (outlined signal pill, derived indicator), build a local component. Don't force Baby UI components where they break the intent.

**Styling.** Match the rest of the stripe-network prototype. Fidelity: low. The reference HTML's color palette is close to Stripe's but was picked quickly — use your existing design tokens as the source of truth.

**Component order to build (historical).**

Tab 1 (playground) is the most complex; Tab 3 Products mode is a simpler reshape; Tab 3 Configs and Tab 2 add mapping helpers from the model.

## Open questions

- **Linking to the TS model from the UI.** Does it make sense to show the capability ID (e.g., `card_payments`) as an overlay somewhere, or link out to the doc? For a team-facing prototype, maybe yes. For the current scope, skip.
- **`link_balance_withdrawals_*` caps.** Two crypto caps have no assigned signal yet (flagged TBD in the model). Current viz doesn't surface this; Cursor version could optionally list them in an "unresolved" section under granular caps.
- **Customer vs Merchant's customer distinction.** Both involve "customer" semantics but are structurally different. The current labeling ("Customer" vs "Merchant's customer") should work; watch for confusion in internal crits.
- **What happens if someone selects only Merchant's customer?** Can't — it's not selectable. But if future iterations make derived configs toggleable, we'd need rules for what they imply.
