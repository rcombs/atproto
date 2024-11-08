/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { lexicons } from '../../../../lexicons'
import { $Type, $Typed, is$typed, OmitKey } from '../../../../util'
import * as AppBskyActorDefs from '../../../app/bsky/actor/defs'

export const id = 'tools.ozone.team.defs'

export interface Member {
  $type?: 'tools.ozone.team.defs#member'
  did: string
  disabled?: boolean
  profile?: AppBskyActorDefs.ProfileViewDetailed
  createdAt?: string
  updatedAt?: string
  lastUpdatedBy?: string
  role:
    | 'lex:tools.ozone.team.defs#roleAdmin'
    | 'lex:tools.ozone.team.defs#roleModerator'
    | 'lex:tools.ozone.team.defs#roleTriage'
    | (string & {})
}

export function isMember(v: unknown): v is $Typed<Member> {
  return is$typed(v, id, 'member')
}

export function validateMember(v: unknown) {
  return lexicons.validate(`${id}#member`, v) as ValidationResult<Member>
}

/** Admin role. Highest level of access, can perform all actions. */
export const ROLEADMIN = 'tools.ozone.team.defs#roleAdmin'
/** Moderator role. Can perform most actions. */
export const ROLEMODERATOR = 'tools.ozone.team.defs#roleModerator'
/** Triage role. Mostly intended for monitoring and escalating issues. */
export const ROLETRIAGE = 'tools.ozone.team.defs#roleTriage'
