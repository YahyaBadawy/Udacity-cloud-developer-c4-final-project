// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'abqyybc0mj'
export const apiEndpoint = `https://${apiId}.execute-api.me-south-1.amazonaws.com/prod`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-4y1qfjij.us.auth0.com',            // Auth0 domain
  clientId: 'BHVWpbnpr76n9rK9x3lF7T4ut9RV1nQE',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}