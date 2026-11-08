---
'@navor/reader-ui': patch
---

Stop polling the workspace and live prices every 60 seconds; the Reader now refreshes only when the page regains focus, becomes visible, or comes back online.
