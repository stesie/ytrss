/** @jsx jsx */
import { jsx } from '@emotion/react';

import { FunctionComponent } from 'react';

import { MenuContainer, MenuList } from '../../base-components';
import { useAppDispatch } from '../../store/hooks';
import feedsSlice from '../../store/slices/feeds';
import sessionSlice, { Point } from '../../store/slices/session';
import MenuItem from './MenuItem';

interface Props {
    anchorPoint: Point;
}

const ContextMenu: FunctionComponent<Props> = (props: Props) => {
    const dispatch = useAppDispatch();

    // TODO open menu to the left if x coordinate is to far right
    return (
        <MenuContainer anchorTop={props.anchorPoint.y} anchorLeft={props.anchorPoint.x}>
            <MenuList>
                <MenuItem
                    onMouseDown={() => {
                        dispatch(sessionSlice.actions.hideMenu());
                        window.confirm('Do you want to delete the selected feed?')
                            ? dispatch(feedsSlice.actions.deleteSelectedFeed())
                            : undefined;
                    }}>
                    Delete Feed
                </MenuItem>
                <MenuItem onMouseDown={() => dispatch(feedsSlice.actions.markSelectedFeedAsRead())}>
                    Mark as Read
                </MenuItem>
            </MenuList>
        </MenuContainer>
    );
};

export default ContextMenu;
