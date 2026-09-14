export function shouldTriggerFallback(status: number): boolean {
  return status >= 400;
}

/**
 * A 200 whose usage reports BOTH zero prompt and zero completion tokens is a
 * silent upstream failure, not a usable completion: the provider returned
 * HTTP 200 but generated no content at all. OpenRouter free-tier models under
 * rate-limit/overload are the canonical case, and unlike a normal 4xx/5xx
 * there is no error status for `shouldTriggerFallback` to catch.
 *
 * Mirrors `shouldTriggerFallback` as a content-based trigger. Returns false
 * when usage is absent (some providers/models don't report usage at all) or
 * when either side reports real tokens — the latter keeps legitimate
 * empty-completion edges (safety-filter stops, empty function-calling turns)
 * out of the fallback chain.
 */
export function shouldTriggerFallbackForZeroUsage(
  usage:
    | {
        prompt_tokens: number;
        completion_tokens: number;
      }
    | null
    | undefined,
): boolean {
  return !!usage && usage.prompt_tokens === 0 && usage.completion_tokens === 0;
}
