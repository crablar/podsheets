import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { Container, Icon } from "semantic-ui-react";
import { PublicClientState } from "../../../state/PublicClientState";
import { RootState } from "../../../state/RootState";

interface IPublicPodcastFooterProps { publicClientState?: PublicClientState; }

@inject("publicClientState")
@observer
export default class Footer extends React.Component<IPublicPodcastFooterProps, {}> {
    public render() {

        return (
            <Container style={{
                width: "100%",
                backgroundColor: "white",
                borderTop: "1px solid lightgray",
                padding: 25,
                textAlign: "center",
                color: "gray",
                position: "relative",
                bottom: 0,
            }} >
                Copyright © 2019 Podsheets
            </Container>
        );
    }
}
