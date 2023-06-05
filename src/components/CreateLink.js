import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { FEED_QUERY } from "./LinkList";
import { LINKS_PER_PAGE } from "../constants";

const CREATE_LINK_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

const CreateLink = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    descrition: "",
    url: "",
  });

  //解构出createLink函数
  const [createLink] = useMutation(CREATE_LINK_MUTATION, {
    variables: {
      description: formState.descrition,
      url: formState.url,
    },

    // 更新缓存
    update: (cache, { data: { post } }) => {
      const take = LINKS_PER_PAGE;
      const skip = 0;
      const orderBy = { createdAt: "desc" };

      const data = cache.readQuery({
        query: FEED_QUERY,
        variables: {
          take,
          skip,
          orderBy,
        },
      }); //读取FEED_QUERY的当前结果

      cache.writeQuery({
        query: FEED_QUERY,
        data: {
          feed: {
            links: [post, ...data.feed.links], //将最新链接插入开头并将结果写会存储
          },
        },
        variables: {
          take,
          skip,
          orderBy,
        },
      });
    },

    //这个函数会在mutation完成后触发
    onCompleted: () => navigate("/"),
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createLink(); //每当提交表单就调用createLink函数，创建新的连接
        }}
      >
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={formState.descrition}
            onChange={(e) =>
              setFormState({ ...formState, descrition: e.target.value })
            }
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={formState.url}
            onChange={(e) =>
              setFormState({ ...formState, url: e.target.value })
            }
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
export default CreateLink;
