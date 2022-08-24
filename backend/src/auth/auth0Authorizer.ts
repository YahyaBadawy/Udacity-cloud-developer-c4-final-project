import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { Jwt } from './Jwt'

import * as middy from 'middy'
import { secretsManager } from 'middy/middlewares'

const secredId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

export const handler = middy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {

    try {
        const decodedToken = await verifyToken(event.authorizationToken, context.AUTH0_SECRET[secretField])
        console.log('user was authorized')

        return {
            principalId: decodedToken.payload.sub,
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
    } catch(e) {
        console.log('user was not authorized', e.message)
        
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

})

async function verifyToken (authHeader: string, secret: string): Promise<Jwt> {
    if (!authHeader) 
        throw new Error('No authorization header!!')
    

    if (!authHeader.toLocaleLowerCase().startsWith('bearer'))
        throw new Error('Invalid authorization header')
    

    const split = authHeader.split(' ')
    const token = split[1]

    return verify(token, secret) as Jwt
    //A request has been authorized.
}

handler.use(
  secretsManager({
    cache: true,
    cacheExpiryInMillis: 60000,
    throwOnFailedCall: true,
    secrets: {
      AUTH0_SECRET: secredId
    }
  })
)