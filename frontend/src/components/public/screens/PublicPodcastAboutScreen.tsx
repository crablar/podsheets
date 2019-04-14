import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Container, Header, Icon, Image, Segment } from "semantic-ui-react";
import { PublicClientState } from "../../../state/PublicClientState";

interface IPublicPodcastAboutScreenProps { publicClientState?: PublicClientState; }

@inject("publicClientState")
@observer
export default class PublicPodcastAboutScreen extends React.Component<IPublicPodcastAboutScreenProps, {}> {
    public render() {
        return (
            <div style={{
                paddingBottom: 30,
                minHeight: "100vh",
            }}>
                <div style={style.imageWrapper}>
                    <Image
                        style={style.image}
                        src={this.props.publicClientState.podcast.imageUrl || "/assets/image.png"}
                        centered spaced />
                </div>
                <main>
                    <Container>
                        <Segment style={style.content} >
                            <Header as="h1" color="blue">About</Header>
                            <p style={style.textContent}>
                                {this.props.publicClientState.podcast.title}
                            </p>
                            <p style={style.textContent}>
                                {this.props.publicClientState.podcast.subtitle}
                            </p>
                            <p style={style.textContent}>
                                <div dangerouslySetInnerHTML={{ __html: this.props.publicClientState.podcast.about }} />
                            </p>
                        </Segment>
                    </Container>
                </main>
            </div>
        );
    }
}

const style = {
    imageWrapper: {
        textAlign: "center",
    },
    image: {
        maxWidth: 150,
        margin: 30,
    },
    content: {
        backgroundColor: "#FFFFFF",
        minHeight: 100,
    },
    textContent: {
        textAlign: "justify",
    },
};
