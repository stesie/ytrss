/** @jsx jsx */
import { jsx } from "@emotion/react";
import styled from "@emotion/styled";
import { FunctionComponent, useState } from "react";
import { Button, Drawer } from "../components/styled";
import { useAppDispatch } from "../store/hooks";
import { fetchAllFeedsCommand } from "../store/slices/feeds";
import FeedList from "./FeedList/FeedList";
import NewFeedForm from "./NewFeedForm/NewFeedForm";

const SidebarContainer = styled.div`
  padding: 0.5rem;
  background-color: #fff;
  color: #38383d;
`;

export type View = "feeds" | "newFeed";

const Sidebar: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<View>("feeds");

  return (
    <SidebarContainer>
      <Button onClick={() => dispatch(fetchAllFeedsCommand())}>
        Fetch Feeds
      </Button>
      <Button onClick={() => setView("newFeed")}>New Feeds</Button>
      <Button onClick={() => setView("feeds")}>Feeds</Button>

      <Drawer show={view === "newFeed"}>
        <NewFeedForm />
      </Drawer>
      <FeedList />
    </SidebarContainer>
  );
};

export default Sidebar;
