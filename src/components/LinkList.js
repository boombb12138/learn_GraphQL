import { useQuery, gql } from "@apollo/client";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Link from "./Link";
import { LINKS_PER_PAGE } from "../constants";

// skip定义了跳过多少条数据，如果skip=10，响应中不包含前10条list
// take定义了我们向从list中加载多少条数据，如果skip=10，take=5，
// 最终会收到list中第10-15条数据
export const FEED_QUERY = gql`
  query FeedQuery($take: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(take: $take, skip: $skip, orderBy: $orderBy) {
      id
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

// 一旦GraphQL解析了一些数据 LinkList组件就会重新渲染
const LinkList = () => {
  const navigate = useNavigate();

  const location = useLocation(); //提供了一个用于访问和操作当前 URL 的 location 对象。
  const isNewPage = location.pathname.includes("new"); //includes用于确认一个字符串中是否包含指定的字符串 区分大小写 返回布尔值
  const pageIndexParams = location.pathname.split("/"); //split以指定的字符串拆分字符串对象，返回数组
  const page = parseInt(
    pageIndexParams[pageIndexParams.length - 1] //拿到最后一个参数,即为page
  );

  console.log("page", page);
  const pageIndex = page ? (page - 1) * LINKS_PER_PAGE : 0;

  const getQueryVariables = (isNewPage, page) => {
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const take = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = { createdAt: "desc" }; //确保最新的链接先展示
    return { take, skip, orderBy };
  };

  //useQuery返回3个元素
  // loading 当请求正在进行loading值为true
  //data 是从服务端接收到的实际数据
  const { data, loading, error, subscribeToMore } = useQuery(FEED_QUERY, {
    variables: getQueryVariables(isNewPage, page),
    fetchPolicy: "network-only",
  });

  subscribeToMore({
    document: NEW_VOTES_SUBSCRIPTION,
  });

  subscribeToMore({
    document: NEW_LINKS_SUBSCRIPTION, //NEW_LINKS_SUBSCRIPTION会监听新创建的链接
    //更新缓存
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev;
      const newLink = subscriptionData.data.newLink;
      const exists = prev.feed.links.find(({ id }) => id === newLink.id);
      if (exists) return prev;

      return Object.assign({}, prev, {
        feed: {
          links: [newLink, ...prev.feed.links],
          count: prev.feed.links.length + 1,
          __typename: prev.feed.__typename,
        },
      });
    },
  });

  const getLinksToRender = (isNewPage, data) => {
    console.log("isNewPage", isNewPage);
    if (isNewPage) {
      console.log("data.feed.links", data.feed.links);
      return data.feed.links;
    }
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {/* JSON.stringify对error做格式化 
      <pre>是按HTML原来的格式输出
      */}
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}

      {/* //// LinkList组件初次渲染的时候 data变量没有信息 所以要加限制条件 */}
      {data && (
        <>
          {getLinksToRender(isNewPage, data).map((link, index) => {
            console.log("indexpageIndex", index + pageIndex);
            return <Link key={link.id} link={link} index={index + pageIndex} />;
          })}

          {isNewPage && (
            <div className="flex ml4 mv3 gray">
              <div
                className="pointer mr2"
                onClick={() => {
                  if (page > 1) {
                    const previousPage = page - 1;
                    const skip = (previousPage - 1) * LINKS_PER_PAGE;
                    navigate(`/new/${page - 1}`, { state: { skip } });
                  }
                }}
              >
                Previous
              </div>
              <div
                className="pointer"
                onClick={() => {
                  console.log("data.feed ", data.feed);
                  if (page <= data.feed.count / LINKS_PER_PAGE) {
                    const nextPage = page + 1;
                    const skip = (nextPage - 1) * LINKS_PER_PAGE;
                    navigate(`/new/${nextPage}`, { state: { skip } });
                  }
                }}
              >
                Next
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default LinkList;
