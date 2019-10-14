const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const crypto = require('crypto');


const app = express();
app.listen(3000, () => console.log('listening on 3000'));

const db = {
    users: [
        {id: '1', email: 'alex@gmail.com', name: 'alex', avatarURL: 'https://gravatar.com/...'},
        {id: '2', email: 'max@gmail.com', name: 'max', avatarURL: 'https://gravatar.com/...'},
        {id: '3', email: 'dan@gmail.com', name: 'dan', avatarURL: 'https://gravatar.com/...'}
    ], 
    messages: [
        {id: '1', userId: '1', body: 'Hello', createdAt: Date.now()},
        {id: '2', userId: '2', body: 'Ciao bella', createdAt: Date.now()},
        {id: '3', userId: '1', body: 'Howdy', createdAt: Date.now()},
    ]
}

class User {
    constructor (user) {
        Object.assign(this, user)
    }

    messages () {
        return db.messages.filter(message => message.userId === this.id)
    }
}


const schema = buildSchema(`
    type Query {
        users: [User!]!
        user(id: ID!): User
        messages: [Message!]!
    }

    type Mutation {
        addUser(
            email: String!
            name: String 
            ): User
    }

    type User {
        id: ID!
        email: String!
        name: String
        avatarURL: String
        messages: [Message!]!
    }

    type Message {
        id: ID!
        body: String!
        createdAt: String
    }
`)

// Resolvers
const rootValue = {
    users: () => db.users.map(user => new User(user)),
    user: args => db.users.find(user => user.id === args.id),
    messages: () => db.messages, 

    addUser: ({ email, name }) => {
        const user = {
            id: crypto.randomBytes(10).toString('hex'),
            email,
            name
        }

        db.users.push(user)

        return user
    }
}


app.use('/graphql', graphqlHTTP({
    schema, 
    rootValue,
    graphiql: true
}))