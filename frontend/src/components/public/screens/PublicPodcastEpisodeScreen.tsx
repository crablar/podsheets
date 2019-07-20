import { autobind } from "core-decorators";
import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as moment from "moment";
import * as React from "react";
import { Button, Container, Grid, Header, Icon, Image, Segment } from "semantic-ui-react";
import { PublicClientState } from "../../../state/PublicClientState";

import {
    generateShareIcon,
    ShareButtons,
    ShareCounts,
} from "react-share";

const {
    FacebookShareButton,
    GooglePlusShareButton,
    TwitterShareButton,
} = ShareButtons;

const FacebookIcon = generateShareIcon("facebook");
const TwitterIcon = generateShareIcon("twitter");
const GooglePlusIcon = generateShareIcon("google");

interface IPublicPodcastEpisodeScreenProps {
    publicClientState?: PublicClientState;
    match?: any;
}

interface IPublicPodcastEpisodeScreenState {
    mounted: boolean;
}

function replaceAll(str, search, replacement) {
    return str.split(search).join(replacement);
}

@inject("publicClientState")
@observer
export default class PublicPodcastEpisodeScreen extends React.Component<IPublicPodcastEpisodeScreenProps, IPublicPodcastEpisodeScreenState> {

    public state = {
        mounted: false,
    };

    public render() {

        const theme = this.props.publicClientState.podcast.theme;

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
                        {this.renderEpisode()}
                    </Container>
                </main>
            </div>
        );
    }

    public componentWillMount() {

        const e = _.find(this.props.publicClientState.episodes, { title: replaceAll(this.props.match.params.episodeTitle, "-", " ") });

        const type = document.createElement("meta");
        type.setAttribute("property", "og:type");
        type.setAttribute("content", "article");
        document.head.appendChild(type);

        const title = document.createElement("meta");
        title.setAttribute("property", "og:title");
        title.setAttribute("content", e.title);
        document.head.appendChild(title);

        const url = document.createElement("meta");
        url.setAttribute("property", "og:url");
        url.setAttribute("content", window.location.href);
        document.head.appendChild(url);

        const description = document.createElement("meta");
        description.setAttribute("property", "og:description");
        description.setAttribute("content", e.summary);
        document.head.appendChild(description);

        this.setState({ mounted: true });
    }
    @autobind
    protected renderEpisode() {

        // tslint:disable-next-line:max-line-length
        const e = _.find(this.props.publicClientState.episodes, { title: replaceAll(this.props.match.params.episodeTitle, "-", " ") });

        const theme = this.props.publicClientState.podcast.theme;

        if (!this.props.publicClientState.episodes || !this.props.publicClientState.episodes.length) {
            return (<Segment style={{
                ...style.episode,
            }} textAlign="center"><h3>No content available</h3></Segment>);
        }
        const layout = this.props.publicClientState.podcast.layout || "classic";

        document.title = e.title;
        if (layout === "classic") {
            return (
                <Segment style={{
                    ...style.episode,
                }} >
                    <Header style={{
                        cursor: "pointer",
                    }} as="h1">
                        {e.title}
                    </Header>
                    <div style={style.subHeader}>
                        <Icon name="time" style={{
                            fontSize: "110%",
                        }} />
                        {moment(e.updatedAt).format("ll")}
                    </div>
                    <p style={style.audioControl} >
                        <audio controls={true} style={style.audio} preload="none">
                            Your browser does not support the audio element.
                        <source src={`${e.audioUrl}`} type="audio/wav" />
                        </audio>
                    </p>
                    <p style={style.textContent}>
                        {e.fullContent ?
                            <div dangerouslySetInnerHTML={{ __html: e.fullContent }} />
                            :
                            <div dangerouslySetInnerHTML={{ __html: e.summary }} />
                        }
                    </p>
                    <div>
                        <h5>Share this:</h5>
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                        }}>
                            {this.state.mounted ?
                                <FacebookShareButton
                                    style={{ marginRight: 5 }}
                                    url={window.location.href}
                                    title={e.title}
                                    description={e.summary}>
                                    <FacebookIcon round={true} size={36} />

                                </FacebookShareButton>
                                :
                                null
                            }
                            <TwitterShareButton
                                style={{ marginRight: 5 }}
                                url={window.location.href}
                                title={e.title}>
                                <TwitterIcon round={true} size={36} />
                            </TwitterShareButton>
                            <GooglePlusShareButton
                                style={{ marginRight: 5 }}
                                url={window.location.href}>
                                <GooglePlusIcon round={true} size={36} />
                            </GooglePlusShareButton>
                        </div>
                    </div>
                </Segment>
            );
        } else if (layout === "minimalistic") {
            return (
                <Segment basic style={{
                    ...style.episode,
                    color: theme === "dark" ? "white" : "black",
                    border: theme === "sky" ? "1px solid #9EC3F5" : "1px solid lightgray",
                }} >
                    <Grid stackable>
                        <Grid.Row>
                            <Grid.Column width={4}>
                                <Image src="/assets/image.png" />
                            </Grid.Column>
                            <Grid.Column verticalAlign="middle" stretched width={12}>
                                <Header style={{
                                    cursor: "pointer",
                                    color: theme === "dark" ? "white" : "black",
                                }} as="h1">
                                    {e.title}
                                </Header>
                                <div style={style.subHeaderMinimalistic}>
                                    <Icon name="time" style={{
                                        fontSize: "110%",
                                    }} />
                                    {moment(e.updatedAt).format("ll")}
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <p style={style.audioControl} >
                                    <audio controls={true} style={style.audio} preload="none">
                                        Your browser does not support the audio element.
                                    <source src={`${e.audioUrl}`} type="audio/wav" />
                                    </audio>
                                </p>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <p style={style.textContent}>
                                    <div dangerouslySetInnerHTML={{ __html: e.fullContent }} />
                                </p>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <div>
                                    <h5>Share this:</h5>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "row",
                                    }}>
                                        <FacebookShareButton
                                            style={{ marginRight: 5 }}
                                            url={window.location.href}
                                            title={e.title}
                                            description={e.summary}>
                                            <FacebookIcon round={true} size={36} />
                                        </FacebookShareButton>
                                        <TwitterShareButton
                                            style={{ marginRight: 5 }}
                                            url={window.location.href}
                                            title={e.title}>
                                            <TwitterIcon round={true} size={36} />
                                        </TwitterShareButton>
                                        <GooglePlusShareButton
                                            style={{ marginRight: 5 }}
                                            url={window.location.href}>
                                            <GooglePlusIcon round={true} size={36} />
                                        </GooglePlusShareButton>
                                    </div>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            );
        }
    }
}

const style = {
    audioControl: {
        textAlign: "center",
    },
    audio: {
        width: "100%",
    },
    imageWrapper: {
        textAlign: "center",
    },
    image: {
        maxWidth: 150,
        margin: 30,
    },
    episode: {
        minHeight: 100,
        padding: "5vw",
    },
    textContent: {
        textAlign: "justify",
    },
    subHeader: {
        padding: 0,
        paddingBottom: 10,
        marginLeft: 0,
        marginRight: 0,
        color: "gray",
        borderBottom: "1px solid #EEE",
        marginBottom: 30,
    },
    subHeaderMinimalistic: {
        padding: 0,
        marginLeft: 0,
        marginRight: 0,
        color: "gray",
    },
    commentButton: {
        padding: 0,
        borderStyle: "none",
        marginLeft: 15,
        color: "gray",
        cursor: "pointer",
    },
    viewButton: {
        width: 85,
        padding: 10,
        marginTop: 10,
        color: "black",
        backgroundColor: "white",
    },
};
