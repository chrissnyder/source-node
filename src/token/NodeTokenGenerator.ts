import { SignJWT } from 'jose/jwt/sign' // eslint-disable-line

import { SourceConfiguration } from '../SourceConfiguration'
import { ApiKey } from '../authentication'

import { TokenGenerator, TokenOptions } from './TokenGenerator'

export default class NodeTokenGenerator implements TokenGenerator {
  private readonly encoder = new TextEncoder()

  constructor(private readonly configuration: SourceConfiguration) {}

  /**
   * Generates a JWT suitable to allow a member to access the API
   *
   * @param options options for configuring the generated token
   * @returns a generated token that allows a member access to the API
   */
  public async generate(options: TokenOptions): Promise<string> {
    const authentication = this.configuration.getAuthentication()
    if (!(authentication instanceof ApiKey)) {
      throw new Error('You may only generate tokens when using API key authentication')
    }

    const signJWT = new SignJWT({
      sub: options.member,
      iat: Math.floor(Date.now() / 1_000),
      exp: Math.floor(options.expiration.getTime() / 1_000),
      scopes: options.scopes ?? [],
    })

    return await signJWT
      .setProtectedHeader({ alg: 'HS256', kid: authentication.id })
      .sign(this.encoder.encode(authentication.secret))
  }
}
