# Architecture rules

- Keep legacy access-token recovery in the shared access API: renew through a verified auth identity once on unauthorized responses, notify all profile subscribers when access expires, and preserve cached access during temporary connection failures so every consumer handles the same session state.
- Keep example video URLs in a shared configuration consumed verbatim by every template picker, so editing a complete URL once updates all pickers without appending filenames or forcing a media format.
- The photo upload modal preserves the whole chosen template in an object-contain upper surface with a decorative softened duplicate filling its sides; the label and photo input stay on the normal background below, without a framed player. Dashboard passes the selected video URL into it; the surface shows only the "Template escolhido" label and never the template's name.
- Open the plan picker directly after photo confirmation, without a separate credit notice or generation-loading step.
- Persist only the chosen template in session storage before authentication and consume it once after login to reopen the photo picker; never persist private photo data.
- Pending checkout reminders are scoped to the authenticated user, verified through transaction-status, and never extend the original two-minute reuse window; the server remains authoritative for PIX reuse.
- Run payment retries sequentially after the previous request settles, never on an independent timeout, to avoid overlapping charge requests.
- Keep generation-step eligibility in the shared pure decision helper so account, queue, and plan paths are tested without source-text assertions.
- Reuse InsufficientCreditsModal for every standard plan picker so quantities, prices, selection, and checkout behavior stay consistent.
- Use the existing exit-offer catalog plan when dismissing dashboard plans; rejecting that offer returns to the gallery without reopening a purchase dialog.
- Reuse pending PIX server-side by verified user and catalog amount within the original creation window, before abuse checks or gateway calls; never extend the window on retrieval.- Authenticated users with enough credits to generate see ServerQueueModal ("Servidores lotados", 4–7h wait, live queue 150–300) with the R$ 8,90 lifetime priority offer instead of the plan picker; users without enough credits still go straight to the plan picker.
