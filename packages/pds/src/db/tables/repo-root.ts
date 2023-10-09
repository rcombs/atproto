// @NOTE also used by app-view (moderation)
export interface RepoRoot {
  did: string
  root: string
  rev: string | null
  indexedAt: string
}

export const tableName = 'repo_root'

export type PartialDB = { [tableName]: RepoRoot }
