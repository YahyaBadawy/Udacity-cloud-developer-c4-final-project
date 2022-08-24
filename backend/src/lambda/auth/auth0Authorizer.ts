import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { Jwt } from '../../auth/Jwt'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import request from 'request-promise'
import axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-4y1qfjij.us.auth0.com/.well-known/jwks.json'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    console.log('staring authorization process')
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  console.log('getting certification')
  const jwksRequest = await axios.get(jwksUrl)

  console.log('done getting certification', )
  // const jwksRequestc = await request({
  //    uri: jwksUrl,
  //    strictSsl: true,
  //    json: true
  //  }).promise();

  console.log(`values of ${jwksRequest} and ${jwksRequest}`)
  
  const jwks = jwksRequest.data.keys
  const signingKeys = jwks.filter(key => key.use === 'sig'
  && key.kty === 'RSA'
  && key.kid
  && ((key.x5c && key.x5c.length) || (key.n && key.e))
).map(key => {
    return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
  });
  const signingKey = signingKeys.find(key => key.kid === jwt.header.kid)


  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  console.log(verify(token, signingKey, {algorithms: ['RS256']}) as JwtPayload)
  return verify(token, signingKey, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
