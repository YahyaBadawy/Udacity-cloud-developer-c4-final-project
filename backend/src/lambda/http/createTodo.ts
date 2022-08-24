import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const todoId = uuid.v4() 
    const userId = getUserId(event)
    const item = await createTodo(newTodo, userId, todoId)
    
    return {
      statusCode: 201,
      body: 
      JSON.stringify({'item': item})
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
