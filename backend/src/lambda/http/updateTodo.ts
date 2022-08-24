import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'



export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const userId = getUserId(event)
    
    console.log('userId: ', userId)
    const todo = await updateTodo(todoId, updatedTodo, userId)
    
    return {
      statusCode: 200,
      body: 
      JSON.stringify({
       'todos': todo})
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
