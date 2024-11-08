/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { $Type, $Typed, is$typed, OmitKey } from '../../../../util'
import { lexicons } from '../../../../lexicons'

export const id = 'app.bsky.embed.defs'

/** width:height represents an aspect ratio. It may be approximate, and may not correspond to absolute dimensions in any given unit. */
export interface AspectRatio {
  $type?: 'app.bsky.embed.defs#aspectRatio'
  width: number
  height: number
}

export function isAspectRatio(v: unknown): v is $Typed<AspectRatio> {
  return is$typed(v, id, 'aspectRatio')
}

export function validateAspectRatio(v: unknown) {
  return lexicons.validate(
    `${id}#aspectRatio`,
    v,
  ) as ValidationResult<AspectRatio>
}
