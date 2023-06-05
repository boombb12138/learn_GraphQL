import React, { useState } from "react";
import { useLazyQuery, gql } from "@apollo/client";
import Link from "./Link";
//和LinkList组件的查询类似 不过多了参数来过滤
const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      id
      links {
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
  }
`;

const Search = () => {
  const [searchFilter, setSearchFilter] = useState("");

  const [executeSearch, { data }] = useLazyQuery(FEED_SEARCH_QUERY);

  return (
    <div>
      Search
      <input
        type="text"
        onChange={(e) => setSearchFilter(e.target.value)}
      ></input>
      <button
        onClick={() => {
          executeSearch({ variables: { filter: searchFilter } });
        }}
      >
        OK
      </button>
      {/*useLazyQuery 从服务器拿到的data里面有Link */}
      {data &&
        data.feed.links.map((link, index) => {
          return <Link key={link.id} link={link} index={index} />;
        })}
    </div>
  );
};
export default Search;
