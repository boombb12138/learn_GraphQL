import React from "react";
import { AUTH_TOKEN, LINKS_PER_PAGE } from "../constants";
import { timeDifferenceForDate } from "../utils";
import { gql, useMutation } from "@apollo/client";
import { FEED_QUERY } from "./LinkList";

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        id
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

const Link = (props) => {
  const take = LINKS_PER_PAGE;
  const skip = 0;
  const orderBy = { createdAt: "desc" };

  const { link } = props;
  const authToken = localStorage.getItem(AUTH_TOKEN);

  const [vote] = useMutation(VOTE_MUTATION, {
    variables: {
      linkId: link.id,
    },
    // 在mutation完成后，允许读取缓存，修改，提交更新。更新将触发组件重新渲染
    update: (cache, { data: { vote } }) => {
      const { feed } = cache.readQuery({
        query: FEED_QUERY,
        variables: {
          take,
          skip,
          orderBy,
        },
      }); //读取缓存

      //创建一个包含刚刚进行投票的新数据数组
      const updatedLinks = feed.links.map((feedLink) => {
        if (feedLink.id === link.id) {
          return {
            ...feedLink,
            votes: [...feedLink.votes, vote], //vote是使用mutation进行的投票
          };
        }
        return feedLink;
      });

      // 拥有投票列表后，使用writeQuery将更改提交到缓存中
      cache.writeQuery({
        query: FEED_QUERY,
        data: {
          feed: {
            links: updatedLinks,
          },
        },
        variables: {
          take,
          skip,
          orderBy,
        },
      });
    },
  });

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}</span>
        {/* 登录用户可以投票 */}
        {authToken && (
          <div
            className="ml1 gray f11"
            style={{ cursor: "pointer" }}
            onClick={vote}
          >
            {" "}
            ▲
          </div>
        )}
        <div className="ml1">
          <div>
            {link.description}({link.url})
          </div>
          {
            <div className="f6 lh-copy gray">
              {/* 渲染每个链接的投票数和发布者的名称 */}
              {link.votes.length} votes | by {}
              {link.postedBy ? link.postedBy.name : "Unknown"}
              {timeDifferenceForDate(link.createdAt)}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Link;
