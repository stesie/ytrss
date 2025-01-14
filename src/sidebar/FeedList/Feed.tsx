import styled from '@emotion/styled';

import React, { Fragment, FunctionComponent, memo, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Folder } from 'react-feather';

import { useAppDispatch } from '../../store/hooks';
import feedsSlice, { Feed as FeedType, FeedItem as FeedItemType } from '../../store/slices/feeds';
import sessionSlice, { Point } from '../../store/slices/session';
import FeedItem from './FeedItem';

const FeedContainer = styled.ul`
    padding-left: 0;
    margin: 0 0 0.2rem 0;
    opacity: 0.9;
`;

interface FeedTitleContainerProps {
    selected: boolean;
    focus: boolean;
}

const FeedTitleContainer = styled.div<FeedTitleContainerProps>`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px 0 3px 8px;

    background-color: ${(props) =>
        props.selected
            ? props.focus
                ? props.theme.colors.selectedItemBackgroundColor
                : props.theme.colors.selectedItemNoFocusBackgroundColor
            : 'inherit'};
    color: ${(props) =>
        props.selected
            ? props.focus
                ? props.theme.colors.selectedItemTextColor
                : props.theme.colors.selectedItemNoFocusTextColor
            : 'inherit'};
    opacity: 0.9;
`;

const FeedTitle = styled.label`
    margin-left: 4px;
`;

const ToggleIndicator = styled.div`
    margin-right: 4px;
    margin-bottom: -6px;
`;

interface Props {
    feed: FeedType;
    selectedId: string;
    showTitle: boolean;
    filterString: string;
}

const renderItem = (item: FeedItemType, props: Props) => (
    <FeedItem key={item.id + item.title} feedId={props.feed.id} item={item} indented={props.showTitle} />
);

const Feed: FunctionComponent<Props> = (props: Props) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (props.selectedId === props.feed.id) {
            setFocus(true);
        }
    }, [props.selectedId]);

    const [expanded, setExpanded] = useState<boolean>(true);
    const [focus, setFocus] = useState<boolean>(false);

    const handleFeedTitleClick = () => {
        dispatch(feedsSlice.actions.select(props.feed.id));
    };

    const handleOnContextMenu = (anchorPoint: Point) => {
        dispatch(sessionSlice.actions.showContextMenu(anchorPoint));
        dispatch(feedsSlice.actions.select(props.feed.id));
    };

    return (
        <Fragment>
            {props.showTitle && (
                <FeedTitleContainer
                    tabIndex={0}
                    selected={props.selectedId === props.feed.id}
                    focus={focus}
                    onClick={() => {
                        setExpanded(!expanded);
                        setFocus(true);
                        handleFeedTitleClick();
                    }}
                    onBlur={() => {
                        setFocus(false);
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        handleOnContextMenu({ x: e.clientX, y: e.clientY });
                    }}>
                    <ToggleIndicator>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </ToggleIndicator>
                    <Folder size={16} />
                    <FeedTitle>{props.feed.title || props.feed.url}</FeedTitle>
                </FeedTitleContainer>
            )}

            {(expanded || !props.showTitle) && props.feed.items.some((x) => !x.isRead || x.id === props.selectedId) && (
                <FeedContainer>
                    {props.feed.items.map(
                        (item) =>
                            item.title?.toLowerCase().includes(props.filterString.toLowerCase()) &&
                            renderItem(item, props),
                    )}
                </FeedContainer>
            )}
        </Fragment>
    );
};

const MemoizedFeed = memo(Feed);

if (process.env.MODE === 'dev') {
    Feed.whyDidYouRender = true;
}

export default MemoizedFeed;
