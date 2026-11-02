import type { Message, Session, Part, SnapshotFileDiff, SessionStatus, Provider } from "@auracode/sdk/v2"
import { createSimpleContext } from "./helper"
import { PreloadMultiFileDiffResult } from "@pierre/diffs/ssr"

export type NormalizedProviderListResponse = {
  all: Map<string, Provider>
  default: {
    [key: string]: string
  }
  connected: Array<string>
}

type Data = {
  agent?: {
    name: string
    color?: string
  }[]
  provider?: NormalizedProviderListResponse
  session: Session[]
  session_status: {
    [sessionID: string]: SessionStatus
  }
  session_diff: {
    [sessionID: string]: SnapshotFileDiff[]
  }
  session_diff_preload?: {
    [sessionID: string]: PreloadMultiFileDiffResult<any>[]
  }
  message: {
    [sessionID: string]: Message[]
  }
  part: {
    [messageID: string]: Part[]
  }
  part_text_accum_delta?: {
    [partID: string]: string
  }
}

export type NavigateToSessionFn = (sessionID: string) => void

export type SessionHrefFn = (sessionID: string) => string

// auracode_change start
// The optional trailing sessionID scopes the open to the session the file
// reference was rendered for, so the extension resolves its workspace directory
// from that explicit id instead of whatever session is current when the click
// is processed (avoids opening the wrong worktree during a session switch).
export type OpenFileFn = (filePath: string, line?: number, column?: number, sessionID?: string) => void

export type OpenDiffFn = (diff: {
  file: string
  before?: string // auracode_change - optional, aura uses `patch`
  after?: string // auracode_change - optional, aura uses `patch`
  patch?: string // auracode_change
  additions: number
  deletions: number
  status?: "added" | "deleted" | "modified" // auracode_change
  // auracode_change start - multi-file patch preview payload
  files?: Array<{
    file: string
    before?: string
    after?: string
    patch?: string
    additions: number
    deletions: number
    status?: "added" | "deleted" | "modified" // auracode_change
  }>
  // auracode_change end
}) => void

export type OpenUrlFn = (url: string, sessionID?: string) => void // auracode_change - optional sessionID scopes the open

export type OpenContentFn = (content: string, language?: string) => void // auracode_change

// auracode_change start: sessionID scopes validation to the session the
// candidates were rendered for, so the extension resolves its workspace
// directory from that explicit id instead of whatever session is current.
export type ValidateFilesFn = (sessionID: string, paths: string[]) => Promise<string[]>
// auracode_change end

export const { use: useData, provider: DataProvider } = createSimpleContext({
  name: "Data",
  init: (props: {
    data: Data
    directory: string
    onNavigateToSession?: NavigateToSessionFn
    onSessionHref?: SessionHrefFn
    onOpenFile?: OpenFileFn // auracode_change
    onOpenDiff?: OpenDiffFn // auracode_change
    onOpenUrl?: OpenUrlFn // auracode_change
    onOpenContent?: OpenContentFn // auracode_change
    onValidateFiles?: ValidateFilesFn // auracode_change
    // auracode_change start - web links open in the Integrated Browser
    browserLinks?: boolean // auracode_change
    // auracode_change end
  }) => {
    return {
      get store() {
        return props.data
      },
      get directory() {
        return props.directory
      },
      navigateToSession: props.onNavigateToSession,
      sessionHref: props.onSessionHref,
      openFile: props.onOpenFile, // auracode_change
      openDiff: props.onOpenDiff, // auracode_change
      openUrl: props.onOpenUrl, // auracode_change
      openContent: props.onOpenContent, // auracode_change
      validateFiles: props.onValidateFiles, // auracode_change
      // auracode_change start
      get browserLinks() {
        // auracode_change
        return props.browserLinks // auracode_change
      }, // auracode_change
      // auracode_change end
    }
  },
})
