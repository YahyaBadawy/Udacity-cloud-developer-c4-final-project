import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { TodosAccess } from '../../dataLayer/todosAcess'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
//import * as uuid from 'uuid'

const todoAcess = new TodosAccess()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)

    console.log('userId: ', userId)

    const url = await createAttachmentPresignedUrl(todoId)

    await todoAcess.updateTodoAttachmentUrl(todoId, userId)

    return {
      statusCode: 201,
      body:
        JSON.stringify({
          uploadImageUrl: url
        })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
