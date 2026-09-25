/**
 * Run `work` over every item with at most `limit` in flight, and return the results in the order of the items.
 * `work` should not throw; when it does, that item's result is `undefined` and the rest carry on, so one bad page
 * cannot stop a batch.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  work: (item: T, index: number) => Promise<R>,
): Promise<(R | undefined)[]> {
  const results: (R | undefined)[] = new Array(items.length).fill(undefined);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      try {
        results[index] = await work(items[index], index);
      } catch {
        results[index] = undefined;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
  return results;
}
