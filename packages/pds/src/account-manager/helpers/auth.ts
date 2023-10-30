import assert from 'node:assert'
import { KeyObject } from 'node:crypto'
import * as jose from 'jose'
import * as ui8 from 'uint8arrays'
import * as crypto from '@atproto/crypto'
import { AuthScope } from '../../auth-verifier'
import { AccountDb } from '../db'

export type AuthToken = {
  scope: AuthScope
  sub: string
  exp: number
}

export type RefreshToken = AuthToken & { scope: AuthScope.Refresh; jti: string }

export const createTokens = async (opts: {
  did: string
  jwtKey: KeyObject
  scope?: AuthScope
  jti?: string
  expiresIn?: string | number
}) => {
  const { did, jwtKey, scope, jti, expiresIn } = opts
  const [accessJwt, refreshJwt] = await Promise.all([
    createAccessToken({ did, jwtKey, scope, expiresIn }),
    createRefreshToken({ did, jwtKey, jti, expiresIn }),
  ])
  return { accessJwt, refreshJwt }
}

export const createAccessToken = (opts: {
  did: string
  jwtKey: KeyObject
  scope?: AuthScope
  expiresIn?: string | number
}): Promise<string> => {
  const { did, jwtKey, scope = AuthScope.Access, expiresIn = '120mins' } = opts
  // @TODO set alg header?
  const signer = new jose.SignJWT({ scope })
    .setProtectedHeader({ alg: 'HS256' }) // only symmetric keys supported
    .setSubject(did)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
  return signer.sign(jwtKey)
}

export const createRefreshToken = (opts: {
  did: string
  jwtKey: KeyObject
  jti?: string
  expiresIn?: string | number
}): Promise<string> => {
  const { did, jwtKey, jti = getRefreshTokenId(), expiresIn = '90days' } = opts
  // @TODO set alg header? audience?
  const signer = new jose.SignJWT({ scope: AuthScope.Refresh })
    .setProtectedHeader({ alg: 'HS256' }) // only symmetric keys supported
    .setSubject(did)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
  return signer.sign(jwtKey)
}

// @NOTE unsafe for verification, should only be used w/ direct output from createRefreshToken() or createTokens()
export const decodeRefreshToken = (jwt: string) => {
  const token = jose.decodeJwt(jwt)
  assert.ok(token.scope === AuthScope.Refresh, 'not a refresh token')
  return token as RefreshToken
}

export const storeRefreshToken = async (
  db: AccountDb,
  payload: RefreshToken,
  appPasswordName: string | null,
) => {
  return db.db
    .insertInto('refresh_token')
    .values({
      id: payload.jti,
      did: payload.sub,
      appPasswordName,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    })
    .onConflict((oc) => oc.doNothing()) // E.g. when re-granting during a refresh grace period
    .executeTakeFirst()
}

export const getRefreshToken = async (db: AccountDb, id: string) => {
  return db.db
    .selectFrom('refresh_token')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export const deleteExpiredRefreshTokens = async (
  db: AccountDb,
  did: string,
  now: string,
) => {
  await db.db
    .deleteFrom('refresh_token')
    .where('did', '=', did)
    .where('expiresAt', '<=', now)
    .returningAll()
    .executeTakeFirst()
}

export const addRefreshGracePeriod = async (
  db: AccountDb,
  opts: {
    id: string
    expiresAt: string
    nextId: string
  },
) => {
  await db.db
    .updateTable('refresh_token')
    .where('id', '=', opts.id)
    .set({ expiresAt: opts.expiresAt, nextId: opts.nextId })
    .executeTakeFirst()
}

export const revokeRefreshToken = async (db: AccountDb, id: string) => {
  const { numDeletedRows } = await db.db
    .deleteFrom('refresh_token')
    .where('id', '=', id)
    .executeTakeFirst()
  return numDeletedRows > 0
}

export const revokeRefreshTokensByDid = async (db: AccountDb, did: string) => {
  const { numDeletedRows } = await db.db
    .deleteFrom('refresh_token')
    .where('did', '=', did)
    .executeTakeFirst()
  return numDeletedRows > 0
}

export const revokeAppPasswordRefreshToken = async (
  db: AccountDb,
  did: string,
  appPassName: string,
) => {
  const { numDeletedRows } = await db.db
    .deleteFrom('refresh_token')
    .where('did', '=', did)
    .where('appPasswordName', '=', appPassName)
    .executeTakeFirst()
  return numDeletedRows > 0
}

export const getRefreshTokenId = () => {
  return ui8.toString(crypto.randomBytes(32), 'base64')
}
