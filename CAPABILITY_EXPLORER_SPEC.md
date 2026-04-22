# Capability explorer — prototype spec

## Intent

A two-tab prototype that explains Stripe's capability system and lets the team play with how configurations drive UAD status signals.

- **Tab 1 — Products ↔ capabilities.** A reference view. Shows how user-facing products map to the doc-level capability groups, and how those groups contain granular capabilities. Click-through drill-down, no live state.
- **Tab 2 — UAD–status signals.** An interactive playground. Toggle configurations (compliance roles) and see which status signals light up, which capability groups they draw from, and which products participate. Fold rules, auto-selects, and billing/tax toggles apply live.

The prototype answers two different questions: Tab 1 answers *what is this capability system*, and Tab 2 answers *how does UAD reflect an account's configuration*. Both are useful; they serve different audiences.

## Source of truth

- **`src/data/capabilityModel.ts`** — data model and resolver functions. Import directly; do not re-inline the data.
- **`docs/stripe-capability-mesh.html`** — reference implementation of behavior. Open it to verify interactions, not to copy SVG layout math.

The TS file is authoritative. If the HTML and TS disagree, TS wins; the HTML is a standalone viz that inlines data for rendering convenience.

## Route

Both tabs live at **`/network/capability-explorer`** with tab-switcher state in the URL (e.g., `/network/capability-explorer?tab=products` and `?tab=signals`).

## State integration

**Self-contained.** The explorer does not read from or write to `PrototypeContext`. Selections in the playground do not affect UAD state elsewhere.

If we later want the playground to drive UAD state, add an explicit "Apply to current UAD" button. Don't two-way bind.

## Component structure

```
CapabilityExplorer                — top-level, manages tab state and URL
├── TabSwitcher                   — two tabs: Products ↔ capabilities, UAD–status signals
├── ProductsTab                   — Tab 1
│   ├── ProductsColumn            — 10 user-facing products as pills
│   ├── CapabilityGroupsColumn    — 10 doc families, rows with count badges
│   ├── GranularCapsColumn        — drills into the focused group
│   └── Edges                     — SVG overlay (products → groups)
└── SignalsTab                    — Tab 2
    ├── PlaygroundControls        — billing toggle, tax toggle, relationship indicator
    ├── ConfigurationsColumn
    │   ├── PlatformNetwork       — 6 selectable pills (Merchant, Customer, Recipient, Storer, Borrower, Card issuer)
    │   └── NotPlatformNetwork    — 2 derived indicators (Card holder, Merchant's customer)
    ├── SignalsColumn
    │   ├── InHeader              — 7 signal pills
    │   └── ActionsRequired       — Tax reporting (dotted outline)
    ├── RightColumn               — capability groups + products (dynamic, shows only active items when anything is active)
    ├── Edges                     — SVG overlay (configs → signals, signals → caps/products)
    └── InfoBox                   — active configs, lit signals, fold notice
```

## Tab 1 — Products ↔ capabilities

### Behavior
- Start empty: products lit, groups dimmed, granular caps column empty.
- Click a product → its capability groups light up. Edges: solid for "backs", dashed for "requires".
- Click a group → granular caps appear in the third column. Groups with more caps than listed show "+N more (approximate)" at the bottom.
- Clicking a selected product or group deselects it.
- Switching products resets the focused group (otherwise stale granular caps show next to a product that doesn't touch that group).

### Products to show
Ten user-facing products:

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
- Product pills: same pill treatment as configuration pills on Tab 2 (filled when active, outlined when not). No per-product colors needed.
- Capability group rows: label + right-aligned count badge (e.g., "Payment methods · 90+"). Plain row, no pill.
- Granular caps: monospaced, compact (10-11px). These are developer-level identifiers.

## Tab 2 — UAD–status signals

### Behavior

**Configurations.**
- 6 platform-network configs are selectable pills. Clicking toggles.
- Toggling Storer auto-selects Recipient (via `ROLE_AUTO_SELECT`). Auto-selected pills render with "auto-selected" sub-label to distinguish from user-selected.
- Derived configs (Card holder, Merchant's customer) are **not selectable**. They appear as plain indicators (not pills) when their parent is active. In the empty state, they show dimmed as a structural preview.
- `merchant_customer` is derived from `merchant`. `card_holder` is derived from `card_issuer`. Derived configs contribute no signals — they're outcomes, not drivers.

**Status signals.**
- 7 header signals + 1 actions-required signal (Tax reporting) in two sectioned subcolumns.
- Tax reporting pill gets a **dotted outline** on top of the sectioning, to further signal it's not a header chip.
- A signal lights up when any active (expanded) configuration's signals include it.
- Billing signal activates when Merchant is active AND the billing toggle is on.
- Tax reporting signal activates when Merchant is active AND the tax toggle is on.
- **Fold rule**: when Storer and Recipient are both active, Transfers is removed and Financial accounts stays. The folded pill disappears. A note appears in the info box.

**Right column (capability groups + products).**
- When no configs are active (and no toggles): show all items dimmed as structural preview.
- When anything is active: show only items whose signals intersect with active signals. Others hide.
- Items rebuild on each state change (dynamic layout).

**Controls.**
- Billing toggle: disabled when Merchant is not active.
- Tax reporting toggle: disabled when Merchant is not active.
- Preset buttons: "Default" (Merchant + Customer), "Show fold rule" (Storer + Recipient), "Full platform" (all 6 platform-network configs + billing + tax), "Clear."

**Indicators.**
- "Relationship-only" indicator shown when all active configs have no compliance (only happens with Customer alone in practice).
- Fold notice lives in the info box, not in the top controls row.

### Visual notes

**Configuration pill colors (dot color, consistent across active/inactive):**

| Config | Color | Hex |
|---|---|---|
| Merchant | blue | #3B82F6 |
| Customer | orange | #F97316 |
| Recipient | cyan | #06B6D4 |
| Storer | red | #EF4444 |
| Borrower | purple | #A855F7 |
| Card issuer | green | #10B981 |
| Card holder | amber | #EAB308 |
| Merchant's customer | amber | #EAB308 |

Pill treatment:
- **Selectable pills** (platform network): filled (dark bg) when active, outlined otherwise. Dot keeps its color.
- **Derived indicators** (not platform network): no pill outline. Small dot + italic label + "derived from X" sub-label. Muted when parent inactive (and shown dimmed in empty state). When parent active, dot takes parent's color.
- **Signal pills**: outlined only. Inactive = gray outline. Active = green outline + green dot. Tax reporting keeps dotted outline even when active.

**Edge treatment.**
- Config → signal edges: colored by source config. 0.5 opacity.
- Billing edge (Merchant → Billing signal): dashed, Merchant's color.
- Signal → cap group / signal → product edges: neutral `--edge` color (no per-source coloring). 0.5 opacity.

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

**Component order to build.**
1. Tab scaffolding + URL state.
2. Tab 2 ConfigurationsColumn (selectable pills only — skip derived).
3. Tab 2 SignalsColumn with the resolver wired up.
4. Tab 2 RightColumn (dynamic show/hide logic).
5. Tab 2 Edges.
6. Tab 2 derived configs (visual treatment + conditional visibility).
7. Tab 2 PlaygroundControls (billing, tax, relationship indicator, presets).
8. Tab 1 three columns (static data, no resolver involvement).
9. Tab 1 drill-down interaction.

Tab 2 is the complex one; build it first and get it right, then Tab 1 is mostly a simpler reshape of the same patterns.

## Open questions

- **Linking to the TS model from the UI.** Does it make sense to show the capability ID (e.g., `card_payments`) as an overlay somewhere, or link out to the doc? For a team-facing prototype, maybe yes. For the current scope, skip.
- **`link_balance_withdrawals_*` caps.** Two crypto caps have no assigned signal yet (flagged TBD in the model). Current viz doesn't surface this; Cursor version could optionally list them in an "unresolved" section under granular caps.
- **Customer vs Merchant's customer distinction.** Both involve "customer" semantics but are structurally different. The current labeling ("Customer" vs "Merchant's customer") should work; watch for confusion in internal crits.
- **What happens if someone selects only Merchant's customer?** Can't — it's not selectable. But if future iterations make derived configs toggleable, we'd need rules for what they imply.
