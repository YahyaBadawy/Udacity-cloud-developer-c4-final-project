import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../../src/businessLogic/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    console.log('getting all todos', event)
    const userId = getUserId(event)
    
    console.log('userId: ', userId)
    const todos = await getTodosForUser(userId)

    return {
      statusCode: 200,
      body: 
      JSON.stringify({
       'todos': todos})
    }
  }
)

handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true,
    headers: true
  })
)
