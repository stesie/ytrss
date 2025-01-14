/** @jsx jsx */
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';

import { FunctionComponent, MouseEventHandler } from 'react';
import { ArrowDownCircle, ArrowUpCircle, CheckSquare, Plus } from 'react-feather';

import { UnreachableCaseError } from '../../utils/UnreachableCaseError';

type IconKeys = 'plus' | 'arrowDown-circle' | 'arrowUp-circle' | 'check-square';

interface Props {
    icon?: IconKeys;
    children: React.ReactNode;
    onMouseDown: MouseEventHandler<HTMLLIElement>;
}

export const StyledListItem = styled.li`
    display: flex;
    flex-direction: row;
    align-items: center;

    padding: 0.4rem;
    padding-left: ${(props: { hasIcon: boolean }) => (props.hasIcon ? '4px' : '24px')};

    list-style: none;

    &:hover {
        background-color: ${(props) => props.theme.colors.menuHoverBackgroundColor};
        color: ${(props) => props.theme.colors.menuHoverTextColor};
    }
`;

const IconContainer = styled.div`
    /* center the icon */
    width: 24px;
    height: 16px;
    padding-left: 4px;
`;

const renderIcon = (key: IconKeys) => {
    const size = 16;

    switch (key) {
        case 'plus':
            return <Plus size={size} />;

        case 'arrowDown-circle':
            return <ArrowDownCircle size={size} />;

        case 'arrowUp-circle':
            return <ArrowUpCircle size={size} />;

        case 'check-square':
            return <CheckSquare size={size} />;

        default:
            throw new UnreachableCaseError(key);
    }
};

const MenuItem: FunctionComponent<Props> = (props: Props) => {
    return (
        <StyledListItem onMouseDown={props.onMouseDown} hasIcon={props.icon !== undefined}>
            {props.icon && <IconContainer>{renderIcon(props.icon)}</IconContainer>}
            <div>{props.children}</div>
        </StyledListItem>
    );
};

export default MenuItem;
