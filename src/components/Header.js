import React from 'react';
import styled from "styled-components";
import { Header } from "semantic-ui-react";

const HeaderWrapper = styled.div`
    grid-column: 3;
    grid-row: 1;
    color: #444;
    margin: 10px 20px;

`;

export default ({ channelName }) => (
    <HeaderWrapper>
        <Header># {channelName}</Header>
        <hr />
    </HeaderWrapper>
);