/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { HeadersMap, XRPCError } from '@atproto/xrpc'
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'
import { CID } from 'multiformats/cid'
import * as ToolsOzoneModerationDefs from './defs.js'
import * as ComAtprotoAdminDefs from '../../../com/atproto/admin/defs.js'
import * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef.js'

export interface QueryParams {}

export interface InputSchema {
  event:
    | ToolsOzoneModerationDefs.ModEventTakedown
    | ToolsOzoneModerationDefs.ModEventAcknowledge
    | ToolsOzoneModerationDefs.ModEventEscalate
    | ToolsOzoneModerationDefs.ModEventComment
    | ToolsOzoneModerationDefs.ModEventLabel
    | ToolsOzoneModerationDefs.ModEventReport
    | ToolsOzoneModerationDefs.ModEventMute
    | ToolsOzoneModerationDefs.ModEventUnmute
    | ToolsOzoneModerationDefs.ModEventMuteReporter
    | ToolsOzoneModerationDefs.ModEventUnmuteReporter
    | ToolsOzoneModerationDefs.ModEventReverseTakedown
    | ToolsOzoneModerationDefs.ModEventResolveAppeal
    | ToolsOzoneModerationDefs.ModEventEmail
    | ToolsOzoneModerationDefs.ModEventTag
    | { $type: string; [k: string]: unknown }
  subject:
    | ComAtprotoAdminDefs.RepoRef
    | ComAtprotoRepoStrongRef.Main
    | { $type: string; [k: string]: unknown }
  subjectBlobCids?: string[]
  createdBy: string
  [k: string]: unknown
}

export type OutputSchema = ToolsOzoneModerationDefs.ModEventView

export interface CallOptions {
  signal?: AbortSignal
  headers?: HeadersMap
  qp?: QueryParams
  encoding?: 'application/json'
}

export interface Response {
  success: boolean
  headers: HeadersMap
  data: OutputSchema
}

export class SubjectHasActionError extends XRPCError {
  constructor(src: XRPCError) {
    super(src.status, src.error, src.message, src.headers, { cause: src })
  }
}

export function toKnownErr(e: any) {
  if (e instanceof XRPCError) {
    if (e.error === 'SubjectHasAction') return new SubjectHasActionError(e)
  }

  return e
}
