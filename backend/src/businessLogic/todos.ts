import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as createError from 'http-errors'
//import * as uuid from 'uuid'
//import { parseUserId } from '../auth/utils';

// TODO: Implement businessLogic

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getAllTodos () {
    return await todosAccess.getAllTodos()
}
       
export async function createTodo (createTodoRequest: CreateTodoRequest, userId: string, todoId: string): Promise<TodoItem> {
    createLogger(`Creating todoId ${todoId} for user ${userId}}`)
    console.log('calling dataLayer Fn')
    return await todosAccess.createTodo({
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: ''
    })
}

export async function updateTodo (todoId: string, updateTodoRequest: UpdateTodoRequest, userId: string): Promise<TodoUpdate> {
    createLogger(`Updating todoId ${todoId}`)

    return await todosAccess.updateTodo(todoId, updateTodoRequest, userId)
}

export async function createAttachmentPresignedUrl(todoId: string): Promise<String> {
    return await attachmentUtils.getUploadURL(todoId)
}

export async function deleteTodo(todoId: string, userId: string): Promise<String> {
    return await todosAccess.deleteTodo(todoId, userId)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    try {
        return await todosAccess.getTodosPerUser(userId)
    }catch(e){
        createError('failed to get todos for user', e)
        return e
    }
}