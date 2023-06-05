import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./components/App";
import { BrowserRouter } from "react-router-dom";
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { AUTH_TOKEN } from "./constants";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink, webSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

//配置ApolloClient实例
//1. 创建http链接来连接GraphQL API和ApolloClient实例
const httpLink = createHttpLink({
  uri: "http://localhost:4000",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN); //a.从本地获取token
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "", //b.将token拼贴到headers
    },
  };
});

// 使用订阅要配置ApolloClient实例
// A.实例化WebSocketLink，
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`, //订阅断电
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN), //身份验证
    },
  },
});

//B. split用于将请求路由到特定的中间件链接，接收3个参数
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  }, //测试函数，返回布尔值，如果为true，将请求转发到第二个参数彻底的链接；为false则转发到第三个参数
  wsLink,
  authLink.concat(httpLink)
);

//2. 初始化ApolloClient
const client = new ApolloClient({
  link, //C.确保用正确的link来实例化ApolloClient
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
