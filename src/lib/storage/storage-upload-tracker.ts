import { deleteFromStorage } from "@/lib/supabase";

/**
 * Tracks storage paths uploaded during a single operation so they can be
 * deleted if a later step (e.g. DB insert) fails.
 */
export class StorageUploadTracker {
  private readonly paths: string[] = [];

  track(storagePath: string): void {
    this.paths.push(storagePath);
  }

  /** Commits the upload — paths are no longer eligible for rollback. */
  release(): void {
    this.paths.length = 0;
  }

  async rollback(): Promise<void> {
    const paths = [...this.paths];
    this.paths.length = 0;

    await Promise.all(paths.map((path) => deleteFromStorage(path)));
  }
}
