import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const userId = getUserId(event)
    
    console.log('userId: ', userId)

    const msg = await deleteTodo(todoId, userId)
    
    return {
      statusCode: 202,
      body: 
      JSON.stringify({'update message': msg})
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
