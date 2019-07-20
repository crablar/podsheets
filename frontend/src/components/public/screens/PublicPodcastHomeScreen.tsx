import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Button, Container, Grid, Header, Icon, Image, Segment } from "semantic-ui-react";
import { PublicClientState } from "../../../state/PublicClientState";
interface IPublicPodcastHomeScreenProps { publicClientState?: PublicClientState; }
import * as _ from "lodash";
import * as moment from "moment";
import Slider from "react-slick";

function replaceAll(str, search, replacement) {
    return str.split(search).join(replacement);
}

@inject("publicClientState")
@observer
export default class PublicPodcastHomeScreen extends React.Component<IPublicPodcastHomeScreenProps, {}> {
    public render() {

        const layout = this.props.publicClientState.podcast.layout || "classic";

        return (
            <div style={{ paddingBottom: 30, minHeight: "100vh" }}>
                <div style={style.imageWrapper}>
                    <Image
                        style={style.image}
                        src={this.props.publicClientState.podcast.imageUrl || "/assets/image.png"}
                        centered spaced />
                </div>
                <main>
                    <Container>
                        {layout === "minimalistic" ?
                            this.renderSlider()
                            :
                            null
                        }
                        {this.renderEpisodes()}
                    </Container>
                </main>
            </div>
        );
    }

    @autobind
    protected renderSlider() {

        const settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            autoplay: true,
        };

        const episodes = this.props.publicClientState.episodes;
        const paired = [];
        let pair = [];
        let i = 0;
        _.forEach(episodes, (value) => {
            if (i % 4 === 0 && i !== 0) {
                paired.push(pair);
                pair = [];
            }
            pair.push(value);
            i++;
        });
        if (pair.length > 0) {
            paired.push(pair);
        }

        return (
            <div style={{
                marginBottom: 60,
            }}>
                <Slider {...settings}>
                    {_.map(paired, (value) => {
                        return (
                            <div>
                                <Grid centered stackable>
                                    <Grid.Row>
                                        {_.map(value, (e: any) => {
                                            return (
                                                <Grid.Column width={4}>
                                                    <Image src="/assets/image.png" />
                                                    <Header
                                                        textAlign="left"
                                                        style={{ color: "#555", margin: 0, marginTop: 10 }}
                                                        as="h4">{e.title}</Header>
                                                    <Header
                                                        textAlign="left"
                                                        style={{ color: "#555", marginTop: 0 }}
                                                        as="h4">{moment(e.updatedAt).format("ll")}</Header>
                                                </Grid.Column>
                                            );
                                        })}
                                    </Grid.Row>
                                </Grid>
                            </div>
                        );
                    })}
                </Slider>
            </div>
        );
    }

    @autobind
    protected renderEpisodes() {
        const theme = this.props.publicClientState.podcast.theme;
        if (!this.props.publicClientState.episodes || !this.props.publicClientState.episodes.length) {
            return (<Segment style={{
                ...style.episode,
            }} textAlign="center"><h3>No content available</h3></Segment>);
        }
        const layout = this.props.publicClientState.podcast.layout || "classic";

        if (layout === "classic") {
            return this.props.publicClientState.episodes.map(e => (
                <Segment style={{
                    ...style.episode,
                }} >
                    <Header onClick={() => {
                        window.location.href = "#/episode/" + replaceAll(e.title, " ", "-");
                    }} style={{ cursor: "pointer" }} as="h1">
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
                        {e.summary}
                    </p>
                </Segment>
            ));
        } else if (layout === "minimalistic") {
            return this.props.publicClientState.episodes.map(e => (
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
                                <Button onClick={() => {
                                    window.location.href = "#/episode/" + replaceAll(e.title, " ", "-");
                                }} style={style.viewButton}>
                                    View
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            ));
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
