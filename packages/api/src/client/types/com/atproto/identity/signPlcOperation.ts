/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { HeadersMap, XRPCError } from '@atproto/xrpc'
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { $Type, is$typed } from '../../../../util'
import { lexicons } from '../../../../lexicons'

export const id = 'com.atproto.identity.signPlcOperation'

export interface QueryParams {}

export interface InputSchema {
  /** A token received through com.atproto.identity.requestPlcOperationSignature */
  token?: string
  rotationKeys?: string[]
  alsoKnownAs?: string[]
  verificationMethods?: {}
  services?: {}
  [k: string]: unknown
}

export interface OutputSchema {
  /** A signed DID PLC operation. */
  operation: {}
  [k: string]: unknown
}

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

export function toKnownErr(e: any) {
  return e
}
