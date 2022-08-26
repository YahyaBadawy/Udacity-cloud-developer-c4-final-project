import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { AttachmentUtils } from '../helpers/attachmentUtils'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
const attachmentUtils = new AttachmentUtils()

export class TodosAccess {
    
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todoTableGsi = process.env.TODOS_CREATED_AT_INDEX 
    ){ 
    }

    async getAllTodos(): Promise<TodoItem[]> {
        console.log('Getting all todos')

        const result = await this.docClient.scan({
            TableName: this.todosTable
        }).promise()

        return result.Items as TodoItem[]
    }

    async getTodosPerUser(userId: string): Promise<TodoItem[]> {
        console.log('Getting todo for user', userId)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todoTableGsi,
            KeyConditionExpression: 'userId = :param',
            ExpressionAttributeValues: {
                ':param': userId 
            }
        }).promise()

        const items = result.Items

        console.log('Returning todos for user: ' + userId + ', and items: ' + JSON.stringify({items}))
        return items as TodoItem[]
    }

    
    async createTodo(todo: TodoItem): Promise<TodoItem> {
        console.log('creating new todo')

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        
        console.log('returning newly created todo', todo)
        
        return todo
    }

    async updateTodo(todoId: string, todo: TodoUpdate, userId: string): Promise<TodoUpdate> {
        console.log('updating the todo item')

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            },
            UpdateExpression: "set #nameAttribute = :n, dueDate = :d, done = :x",
            ExpressionAttributeNames: {"#nameAttribute": "name"},
            ExpressionAttributeValues: { ':n': todo.name, ':d': todo.dueDate, ':x': todo.done}
        }).promise()
        
        return todo
    }

    async todoExists(todoId: string) {
        const result = await this.docClient
          .get({
            TableName: this.todosTable,
            Key: {
              id: todoId
            }
          })
          .promise()
      
        console.log('Get group: ', result)
        return !!result.Item
    }

    async createAttachmentPresignedUrl(attachmentId: string): Promise<String>{
        console.log('getting the presigned url')
        const url = await attachmentUtils.getUploadURL(attachmentId)
        return url
    }

    async updateTodoAttachmentUrl(todoId: string, userId: string) {
        logger.info(`Updating todoId ${todoId} for user ${userId}`)
        console.log('updating the presigned url')
        await attachmentUtils.updateAttachmentUrl(todoId, userId) 
    }

    async deleteTodo(todoId: string, userId: string): Promise<String> {
        logger.info("Deleting todo:", {todoId: todoId});
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            }
        }).promise();
        logger.info("Delete complete.", {todoId: todoId});


        return "todo deleted"
    }
}
// TODO: Implement the dataLayer logic