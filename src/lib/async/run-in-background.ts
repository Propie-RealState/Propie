/**
 * Run non-critical side effects outside the request/response path.
 *
 * The work is scheduled with setImmediate so the HTTP handler can
 * return to the client first. Errors are swallowed (logged) on
 * purpose: a failed notification or geocode must never surface as a
 * request failure, and there is no caller left to catch it.
 *
 * This is deliberately simple (no queue, no Redis). It trades an
 * at-most-once guarantee for zero infrastructure, which is the right
 * call while side effects are best-effort.
 */
export function runInBackground(
  label: string,
  task: () => Promise<unknown>,
): void {
  setImmediate(() => {
    Promise.resolve()
      .then(task)
      .catch((error) => {
        console.error(`[background:${label}] failed`, error);
      });
  });
}
