import * as AWS from 'aws-sdk'
const docClient = new AWS.DynamoDB.DocumentClient()
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const todosTable = process.env.TODOS_TABLE
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    signatureVersion: 'v4',
  })
// TODO: Implement the fileStogare logic

export class AttachmentUtils {
    constructor() { }
    
    async getUploadURL(todoId: string): Promise<String> {
        const signedUrl = await s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: todoId,
            Expires: parseInt(urlExpiration, 10)
        })

        return signedUrl
    }

    async updateAttachmentUrl(todoId: string, userId: string){
        await docClient.update({
            TableName: todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${todoId}`
            }
        }).promise();
    }

    
}



