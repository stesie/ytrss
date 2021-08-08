import styled from '@emotion/styled';

import { colors } from './colors';

export const Divider = styled.hr`
    border-color: ${colors.menuBorder};
    border-left: none;
    border-right: none;
    border-bottom: none;

    margin-top: 0.2rem;
    margin-bottom: 0.2rem;
`;
