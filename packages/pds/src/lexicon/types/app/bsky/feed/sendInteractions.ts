/**
 * GENERATED CODE - DO NOT MODIFY
 */
import express from 'express'
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { lexicons } from '../../../../lexicons'
import { $Type, is$typed } from '../../../../util'
import { HandlerAuth, HandlerPipeThrough } from '@atproto/xrpc-server'
import * as AppBskyFeedDefs from './defs'

export const id = 'app.bsky.feed.sendInteractions'

export interface QueryParams {}

export interface InputSchema {
  interactions: AppBskyFeedDefs.Interaction[]
  [k: string]: unknown
}

export interface OutputSchema {
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
