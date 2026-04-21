# Changelog

## Unreleased

- **Account status:** `limited` on a capability group no longer derives **Restricted**; only **paused** does. Header Payments/Payouts use the actions modal only for **paused** / **pausing soon** (not limited). Extra signal chips treat **limited** like **active** for visibility.
- Refactor header “signal groups”: align `configMatrix` with new role → group mapping, fold rules (e.g. Transfers into Financial accounts when Recipient + Storer), and shared display labels/order/tooltip helpers.
- Add `card_holder` (Card issuer) role; treat `issuer` as non-selectable in the configure UI; enforce Storer ⇒ Recipient when editing roles.
- Introduce `SignalGroupConfig`, `ROLE_METADATA`, `SIGNAL_GROUP_DEFAULTS`, and related types/metadata in `configMatrix`.
- Add `signalGroupsForConfigureModal()` in `uadVisibility` for consistent ordering between configure modal and header (including omitting Transfers when Storer is active).
- Replace fixed Configure FAB with `PrototypeWorkbenchBar` on account detail; tweak header layout (`gap-1`, `-ml-8` alignment).
- Update `AccountDetailActionBar` to use `HeaderSignalGroupButton`, `SignalGroup`, and optional `extraActiveCapabilityChips` for additional active capability pills.
- Large configure-modal refresh in `PrototypeFloatie` (draft state, risk section naming, role pill styling, shared matrix imports).
- Refresh simulated “+X more” capability names in `actionsRequired` (e.g. Card issuing, Financial accounts, Financing).
- Tighten header signal chip label spacing: remove extra right padding on `HeaderSignalGroupButton` label text.
