const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

// GraphQLスキーマ言語を記述してスキーマを構築する
// スキーマはあくまで定義のみで実際のデータ操作は行わない
const schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    getMessage(id: ID!): Message
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }
`);

class Message {
  constructor(id, { content, author }) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

// データの入れ物
let fakeDatabase = {};

// リゾルバ関数（特定のフィールドのデータを返す関数であり、実際のデータ操作を行う部分）
const root = {
  getMessage: ({ id }) => {
    if (!fakeDatabase[id]) {
      throw new Error("no message exists with id" + id);
    }

    return new Message(id, fakeDatabase[id]);
  },

  createMessage: ({ input }) => {
    // ランダムなIdを生成
    var id = require("crypto").randomBytes(10).toString("hex");

    fakeDatabase[id] = input;

    return new Message(id, input);
  },

  updateMessage: ({ id, input }) => {
    if (!fakeDatabase[id]) {
      throw new Error("no message exists with id" + id);
    }
    // 古いデータの書き換え
    fakeDatabase[id] = input;
    return new Message(id, input);
  },
};

// Expressでサーバーを立てる
// graphql: true としたため、GraphQLを利用できる
const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
