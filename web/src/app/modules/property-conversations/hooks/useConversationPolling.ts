import { useEffect, useRef } from "react";

export function useConversationPolling(
  onPoll: () => void | Promise<void>,
  enabled = true,
  intervalMs = 30_000,
) {
  const onPollRef = useRef(onPoll);

  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void onPollRef.current();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
}
