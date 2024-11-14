/**
 * GENERATED CODE - DO NOT MODIFY
 */
import express from 'express'
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { lexicons } from '../../../../lexicons'
import { $Type, is$typed } from '../../../../util'
import { HandlerAuth, HandlerPipeThrough } from '@atproto/xrpc-server'

export const id = 'com.atproto.server.createInviteCodes'

export interface QueryParams {}

export interface InputSchema {
  codeCount: number
  useCount: number
  forAccounts?: string[]
  [k: string]: unknown
}

export interface OutputSchema {
  codes: AccountCodes[]
  [k: string]: unknown
}

export interface HandlerInput {
  encoding: 'application/json'
  body: InputSchema
}

export interface HandlerSuccess {
  encoding: 'application/json'
  body: OutputSchema
  headers?: { [key: string]: string }
}

export interface HandlerError {
  status: number
  message?: string
}

export type HandlerOutput = HandlerError | HandlerSuccess | HandlerPipeThrough
export type HandlerReqCtx<HA extends HandlerAuth = never> = {
  auth: HA
  params: QueryParams
  input: HandlerInput
  req: express.Request
  res: express.Response
}
export type Handler<HA extends HandlerAuth = never> = (
  ctx: HandlerReqCtx<HA>,
) => Promise<HandlerOutput> | HandlerOutput

export interface AccountCodes {
  account: string
  codes: string[]
  [k: string]: unknown
}

export function isAccountCodes(v: unknown): v is AccountCodes & {
  $type: $Type<'com.atproto.server.createInviteCodes', 'accountCodes'>
} {
  return is$typed(v, id, 'accountCodes')
}

export function validateAccountCodes(v: unknown) {
  return lexicons.validate(
    `${id}#accountCodes`,
    v,
  ) as ValidationResult<AccountCodes>
}
