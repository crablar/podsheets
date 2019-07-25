import { autobind } from "core-decorators";
import * as _ from "lodash";
import * as MobileDetect from "mobile-detect";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { Button, Container, Divider, Grid, Header, Icon, Image, Popup, Segment } from "semantic-ui-react";
import { IEpisode } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import RSSImportForm, { IRSSImportFields } from "../forms/RSSImportForm";
import PublishPodcastModal, { IPublishPodcastFields } from "../generic/PublishPodcastModal";
import ContentHeader from "../generic/ContentHeader";
import Episode from "../generic/Episode";
import Footer from "../generic/Footer";
import LoadingContainer from "../generic/LoadingContainer";
import Sidebar from "../generic/Sidebar";
import UnsupportedBrowser from "../generic/UnsupportedBrowser";

interface IPodcastHomeScreenProps { rootState?: RootState; }
interface IPodcastHomeScreenState {
    filter: "all" | "published" | "drafts" | "scheduled";
    episodes?: IEpisode[];
    message?: string;
    error?: string;
}

function browserSwitch(component) {

    const md = new MobileDetect(window.navigator.userAgent);

    if (md.mobile()) {
        return <UnsupportedBrowser />;
    }

    return component;
}

@inject("rootState")
@observer
export default class PodcastHomeScreen extends React.Component<IPodcastHomeScreenProps, IPodcastHomeScreenState> {

    constructor(props: IPodcastHomeScreenProps) {
        super();
        this.state = { filter: "all" };

    }

    public render() {
        if (this.props.rootState.isAuthenticated) {
            return browserSwitch(
                <LoadingContainer
                    loading={!!this.props.rootState.loadingCount}
                    restrictAccess="authOnly"
                    isAuthenticated={this.props.rootState.isAuthenticated}
                    podcastRequired={this.props.rootState.podcast} >
                    <div style={globalStyles.contentWrapper} >
                        <Sidebar currentPodcast={this.props.rootState.podcast} />
                        <main style={globalStyles.workspaceContent}>
                            <ContentHeader
                                clearMessages={() => this.clearMessages()}
                                message={this.state.message}
                            />
                            <div style={{ display: "flex", flexDirection: "row", width: "75%" }}>
                                <Header as="h2" style={globalStyles.title}>Episodes</Header>

                                <RSSImportForm
                                    onSubmit={this.onSubmitFeed} />
                                <PublishPodcastModal
                                    onSubmit={this.onSubmitPodcast}/>
                            </div>
                            <div style={style.headWrapper}>
                                {this.renderEpisodesMenu()}
                            </div>
                            <br />
                            {this.renderGetStartedMessage()}
                            <Grid>
                                <Grid.Column style={{ width: "75%" }}>
                                    {this.renderEpisodes()}
                                </Grid.Column>
                            </Grid>
                        </main>
                    </div>
                </LoadingContainer>,
            );
        } else {
            return (
                <div style={globalStyles.contentWrapper} >
                    <main style={style.content}>
                        <Grid doubling stackable style={style.gridContainer}>
                            <Grid.Row style={{ paddingBottom: 0 }}>
                                <Grid.Column style={style.platformMessageContainer} width={12}>
                                    <div style={{ maxWidth: 500, height: 150, marginBottom: 30 }}>
                                        <h1 style={style.mainMessage}>
                                            Podsheets is an open source platform to host and monetize your podcast
                                        </h1>
                                    </div>
                                    <div style={{ height: 125 }}>
                                            <Button
                                                onClick={() => window.location.href = "/#/sign_up"}
                                                size="large"
                                                floated={"left"}
                                                style={style.getStarted}>
                                                Get Started
                                        </Button>
                                        </div>
                                    <div style={{ maxWidth: 350 }}>
                                        <h4 style={style.secondaryMessage}>
                                        </h4>
                                    </div>
                                </Grid.Column>
                                <Grid.Column mobile={4} width={8}>
                                        <div style={style.someImagesContainer}>
                                            <div style={style.someImagesBox}>
                                                <img style={style.someImage} src="assets/audio-reviews-hd.png" />
                                            </div>
                                        </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <Grid style={{ padding: 20, paddingBottom: 0, paddingTop: 15 }} doubling stackable centered>
                        <Grid.Row textAlign="center" style={{ marginTop: 40 }}>
                                <Grid.Column columns={1} width={7}>
                                    <h1 style={style.creatorText}>
                                        What We Offer
                                    </h1>
                                </Grid.Column>
                        </Grid.Row>
                        <Grid.Row textAlign="center" style={{ marginTop: 40 }}>
                                <Grid.Column width={3}>
                                    <Grid.Row textAlign="center">
                                        <h3 style={{ ...style.podsheetsOptionsText, marginBottom: 5 }}>
                                            Open Source
                                        </h3>
                                    </Grid.Row>
                                    <Grid.Row centered textAlign="center" style={{ marginTop: 30, marginBottom: 30 }}>
                                        <Grid.Column width={4}>
                                            <Image
                                                width={100 as 10}
                                                src="assets/opensource.svg"
                                                centered />
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row style={{ marginTop: 10 }} textAlign="center">
                                        <Grid.Row style={{
                                            color: colors.mainDark,
                                            marginTop: 5,
                                            fontSize: "140%",
                                        }} centered textAlign="center">
                                            Open source platform for managing your podcast
                                        </Grid.Row>
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Column width={3}>
                                    <Grid.Row textAlign="center">
                                        <h3 style={{ ...style.podsheetsOptionsText, marginBottom: 5 }}>
                                            Hosting
                                        </h3>
                                    </Grid.Row>
                                    <Grid.Row centered textAlign="center" style={{ marginTop: 30, marginBottom: 30 }}>
                                        <Grid.Column width={4}>
                                            <Image
                                                width={100 as 10}
                                                src="assets/headphones.svg"
                                                centered />
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row style={{ marginTop: 10 }} textAlign="center">
                                        <Grid.Row style={{
                                            color: colors.mainDark,
                                            marginTop: 5,
                                            fontSize: "140%",
                                        }} centered textAlign="center">
                                            One click publishing across all podcast players
                                        </Grid.Row>
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Column width={3}>
                                    <Grid.Row textAlign="center">
                                        <h3 style={{ ...style.podsheetsOptionsText, marginBottom: 5 }}>
                                            Analytics
                                        </h3>
                                    </Grid.Row>
                                    <Grid.Row centered textAlign="center" style={{ marginTop: 30, marginBottom: 30 }}>
                                        <Grid.Column width={4}>
                                            <Image
                                                width={100 as 10}
                                                src="assets/analytics.svg"
                                                centered />
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row style={{ marginTop: 10 }} textAlign="center">
                                        <Grid.Row style={{
                                            color: colors.mainDark,
                                            marginTop: 10,
                                            fontSize: "140%",
                                        }} centered textAlign="center">
                                            Detailed analytics on downloads & episode popularity
                                        </Grid.Row>
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Column width={3}>
                                    <Grid.Row textAlign="center">
                                        <h3 style={{ ...style.podsheetsOptionsText, marginBottom: 5 }}>
                                            Community
                                        </h3>
                                    </Grid.Row>
                                    <Grid.Row centered textAlign="center" style={{ marginTop: 30, marginBottom: 30 }}>
                                        <Grid.Column width={4}>
                                            <Image
                                                width={100 as 10}
                                                src="assets/community.svg"
                                                centered />
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row style={{ marginTop: 10, paddingBottom: "40px" }} textAlign="center">
                                        <Grid.Row style={{
                                            color: colors.mainDark,
                                            marginTop: 5,
                                            fontSize: "140%",
                                        }} centered textAlign="center">
                                            Connect with a community of experienced podcasters
                                        </Grid.Row>
                                    </Grid.Row>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row textAlign="center" style={{ marginTop: 40 }}>
                                <Grid.Column columns={1} width={7}>
                                    <h1 style={style.creatorText}>
                                        The Platform
                                    </h1>
                                </Grid.Column>
                        </Grid.Row>
                            <Grid.Row style={{ marginTop: 80 }}>
                                <Grid.Column width={5}>
                                    <Grid.Row >
                                        <h3 style={{textAlign: "left", color: colors.mainDark, marginBottom: 5 , marginTop: "2vw", fontWeight: 600 as 600, fontSize: "150%"}}>
                                            Intuitive and fast
                                        </h3>
                                        <Grid.Row textAlign="left" style={{ color: colors.mainDark}}>
                                         <div style={{textAlign: "left", paddingTop: "20px", fontSize: "130%", lineHeight: "25px"}}>
                                         With just a podcast title, cover image, and an audio file, publish your podcast to iTunes, Google Play and all other players
                                         <br/><br/>
                                         Migrate your podcasts from other hosting providers with one click RSS imports
                                        </div>
                                        </Grid.Row>
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Column width={1}></Grid.Column>
                                <Grid.Column width={6}>
                                    <img style={style.productImage} src="assets/podcast-episodes.png" />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row style={{ marginTop: 80 }}>
                                <Grid.Column width={6}>
                                    <img style={style.productImage} src="assets/audio-reviews.png" />
                                </Grid.Column>
                                <Grid.Column width={1}></Grid.Column>
                                <Grid.Column width={5}>
                                    <Grid.Row>
                                        <h3 style={{ textAlign: "left", color: colors.mainDark, marginBottom: 5 , marginTop: "2vw", fontWeight: 600 as 600, fontSize: "150%"}}>
                                           Your podcast on the web
                                        </h3>
                                        <Grid.Row textAlign="left" style={{ color: colors.mainDark}}>
                                        <div style={{textAlign: "left", paddingTop: "20px", fontSize: "130%", lineHeight: "25px"}}>
                                         Forget fumbling to create a separate website for your podcast.<br/><br/>
                                         Customize a simple website, your home on the web, where your episodes will be posted automatically.<br/><br/>
                                         Invite your team to collaborate.
                                        </div>
                                        </Grid.Row>
                                    </Grid.Row>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row textAlign="center" style={{ marginTop: 90 }}>
                                <Grid.Column columns={1} width={7}>
                                    <h1 style={style.creatorText}>
                                        From the creators of
                                    </h1>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row textAlign="center" style={{ marginTop: 20}}>
                                <Grid.Column width={4}>
                                    <a href="https://softwareengineeringdaily.com/">
                                        <Image
                                            style={{ marginLeft: "auto", marginRight: "auto" }}
                                            src="assets/software-engineering-daily.png" />
                                    </a>
                                </Grid.Column>
                                <Grid.Column width={4}>
                                    <a href="https://thewomenintechshow.com/">
                                        <Image
                                            style={{ marginLeft: "auto", marginRight: "auto" }}
                                            src="assets/the-women-in-tech-show.png" />
                                    </a>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row style={{
                                marginTop: 100,
                                marginBottom: 80,
                            }} width={12}></Grid.Row>
                            {/*TO-DO: uncomment payment information <Grid.Row style={{
                                marginTop: 100,
                                marginBottom: 80,
                            }} width={12}>
                                <Grid.Column floated="left"
                                    style={{
                                        marginTop: 15,
                                        backgroundColor: "#F2E7FA",
                                        padding: "50px 30px 50px 30px",
                                        marginRight: 20,
                                    }} width={4}>
                                    <Grid.Row textAlign="center">
                                        <h1 style={{ ...style.positiveText, marginBottom: 20 }}>
                                            Free for 10 episodes
                                        </h1>
                                    </Grid.Row>
                                    <Grid.Row style={{ marginTop: 10 }} textAlign="center">
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 5,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            Create a podcast website
                                        </Grid.Row>
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 10,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            View your podcast stats
                                        </Grid.Row>
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 10,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            10 episodes free
                                        </Grid.Row>
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Row only="mobile">
                                    <div style={{ height: 10, width: 10 }}>

                                    </div>
                                </Grid.Row>
                                <Grid.Column style={{
                                    marginTop: "15",
                                    backgroundColor: "#F2E7FA",
                                    padding: "50px 30px 50px 30px",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }} width={4}>
                                    <Grid.Row textAlign="center">
                                        <h1 style={{ ...style.positiveText, marginBottom: 20 }}>
                                            $5 monthly
                                        </h1>
                                    </Grid.Row>
                                    <Grid.Row style={{ marginTop: 10 }} textAlign="center">
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 5,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            Create a podcast website
                                        </Grid.Row>
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 10,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            View your podcast stats
                                        </Grid.Row>
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 10,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            Ideal for 30 min weekly shows
                                        </Grid.Row>
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 10,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            200 MB of storage per month
                                        </Grid.Row>
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Row only="mobile">
                                    <div style={{ height: 10, width: 10 }}>

                                    </div>
                                </Grid.Row>
                                <Grid.Column style={{
                                    marginTop: "15",
                                    backgroundColor: "#F2E7FA",
                                    padding: "50px 30px 50px 30px",
                                    marginLeft: 20,
                                }} width={4}>
                                    <Grid.Row textAlign="center">
                                        <h1 style={{ ...style.positiveText, marginBottom: 20 }}>
                                            $20 monthly
                                        </h1>
                                    </Grid.Row>
                                    <Grid.Row style={{ marginTop: 10 }} textAlign="center">
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 5,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            Create a podcast website
                                        </Grid.Row>
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 10,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            View your podcast stats
                                        </Grid.Row>
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 10,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            Ideal for 60 min weekly shows
                                        </Grid.Row>
                                        <Grid.Row style={{
                                            color: colors.mainLVibrant,
                                            marginTop: 10,
                                            fontSize: "140%",
                                            fontWeight: 100,
                                        }} centered textAlign="center">
                                            500 MB of storage per month
                                        </Grid.Row>
                                    </Grid.Row>
                                </Grid.Column>
                            </Grid.Row>*/}
                        </Grid>
                        <Footer />
                    </main>
                </div>
            );
        }
    }

    protected clearMessages() {
        this.setState({ error: null, message: null });
    }

    @autobind
    protected async onSubmitFeed(form: IRSSImportFields) {
        try {
            return await this.props.rootState.uploadRssFeed(form.feedUrl, form.publish);
        } catch (e) {
            console.error("ERROR IMPORTING FEED");
        }
    }

    @autobind
    protected async onSubmitPodcast(form: IPublishPodcastFields) {
        try {
            // Get the data of the podcast: rss link, podcast id
            // Send an email with the details of the podcast to be submitted
            const response = await this.props.rootState.submitPodcast();
            if (response.status === 200) {
                this.setState({message: response.message});
            }
            return response;
        } catch (e) {
            console.error("ERROR SUBMITTING PODCAST");
            this.setState({error: "Your podcast could not be submitted for publishing."});
        }
    }

    @autobind
    protected chanfeFilter(filter: "all" | "published" | "drafts" | "scheduled") {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            if (filter === "all") {
                this.setState({
                    filter: "all",
                    episodes: this.props.rootState.episodes,
                });
            } else if (filter === "published") {
                this.setState({
                    filter: "published",
                    episodes: this.props.rootState.publishedEpisodes,
                });
            } else if (filter === "drafts") {
                this.setState({
                    filter: "drafts",
                    episodes: this.props.rootState.draftEpisodes,
                });
            } else if (filter === "scheduled") {
                this.setState({
                    filter: "scheduled",
                    episodes: this.props.rootState.scheduledEpisodes,
                });
            }
        };
    }

    protected renderEpisodesMenu() {
        const episodes = (this.state.episodes && this.state.episodes.length > 0) ?
            this.state.episodes
            :
            this.props.rootState.episodes;
        if (!episodes || episodes.length === 0) {
            return (null);
        }
        return (<Grid style={{ display: "flex", flex: 1 }}>
            <Grid.Row centered>
                <Button.Group centered>
                    <Button
                        basic
                        style={{
                            backgroundColor: "transparent",
                            borderRight: "1px solid #EEE",
                        }}
                        onClick={this.chanfeFilter("all")}>
                        <span
                            style={this.state.filter === "all" ?
                                style.activeSectionButton
                                :
                                style.sectionButton
                            }>All</span>
                    </Button>
                    <Button
                        basic
                        style={{
                            backgroundColor: "transparent",
                            borderRight: "1px solid #EEE",
                        }}
                        onClick={this.chanfeFilter("published")}>
                        <span
                            style={this.state.filter === "published" ?
                                style.activeSectionButton
                                :
                                style.sectionButton
                            }>Published</span>
                    </Button>
                    <Button
                        basic
                        style={{
                            backgroundColor: "transparent",
                            borderRight: "1px solid #EEE",
                        }}
                        onClick={this.chanfeFilter("drafts")}>
                        <span
                            style={this.state.filter === "drafts" ?
                                style.activeSectionButton
                                :
                                style.sectionButton
                            }>Drafts</span>
                    </Button>
                    <Button
                        basic
                        style={{ backgroundColor: "transparent" }}
                        onClick={this.chanfeFilter("scheduled")}>
                        <span
                            style={this.state.filter === "scheduled" ?
                                style.activeSectionButton
                                :
                                style.sectionButton
                            }>Scheduled</span>
                    </Button>
                </Button.Group>
            </Grid.Row>
        </Grid>);
    }

    protected renderRSSLink() {
        if (!this.props.rootState.podcast) { return null; }
        return (
            <Popup
                trigger={
                    <Button
                        as="a"
                        href={`/p/${this.props.rootState.podcast.slug}/rss.xml`}
                        target="_blank"
                        floated="left"
                        style={{
                            marginTop: 5,
                            padding: 2,
                            backgroundColor: "#EDAA44",
                            marginRight: 15,
                        }} >
                        <Icon style={{
                            margin: 0,
                            marginTop: 4,
                            fontSize: "140%",
                        }} name="rss" inverted />
                    </Button>
                }
                style={{
                    ...globalStyles.tooltip,
                    margin: 0,
                    marginBottom: -10,
                    marginLeft: 15,
                }}
                basic
                size="tiny"
                content="RSS feed" />
        );
    }

    protected uploadProgress(publicFileUrl: string) {
        const currentProgress = _.find(this.props.rootState.uploadProgress, { publicFileUrl });
        const progressEvent = _.get(currentProgress, "progress", {
            loaded: false,
            total: 0,
        });
        if (publicFileUrl && progressEvent && progressEvent.loaded && progressEvent.total) {
            return Math.ceil((+progressEvent.loaded / progressEvent.total) * 100);
        } else {
            return 0;
        }
    }

    protected uploadError(publicFileUrl: string) {
        const currentProgress = _.find(this.props.rootState.uploadProgress, { publicFileUrl });
        return _.get(currentProgress, "error", "");
    }

    protected renderGetStartedMessage() {
        const episodes = (this.state.episodes && this.state.episodes.length > 0) ?
            this.state.episodes
            :
            this.props.rootState.episodes;
        if (!episodes || episodes.length === 0) {
            return (<p style={globalStyles.workspaceContentText}>To get started create a new episode.</p>);
        }
    }

    protected renderEpisodes() {
        const episodes = this.state.episodes || this.props.rootState.episodes;
        if (!episodes) { return (null); }
        return episodes.map(e => {
            return (<Episode
                key={`ep-${e._id}`}
                item={e}
                progress={this.uploadProgress(e.uploadUrl)}
                uploadError={this.uploadError(e.uploadUrl)}
                editItemHandler={this.props.rootState.getEpisodeById}
                deleteItemHandler={this.props.rootState.deleteEpisode}
                publishItemHandler={this.props.rootState.publishEpisode}
                unpublishItemHandler={this.props.rootState.unpublishEpisode} />);
        });
    }

    protected async componentDidMount() {
        await this.props.rootState.getPodcastWithEpisodes();
    }
}

const style = {
    content: {
        ...globalStyles.content,
        padding: 0,
    },
    headWrapper: {
        display: "flex",
        width: "75%",
    },
    buttonGroup: {
        float: "center",
        backgroundColor: "green",
        display: "flex",
        flex: 1,
        justifyContent: "center",
    },
    sectionButton: {
        color: colors.mainULight,
        fontSize: "130%",
    },
    activeSectionButton: {
        color: colors.mainDark,
        fontSize: "130%",
    },
    newEpisode: {
        color: "white",
        fontSize: "120%",
        backgroundColor: "limegreen",
    },
    platformMessageContainer: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        marginTop: "2em",
    },
    mainMessage: {
        color: "white",
        textAlign: "left",
        fontSize: "250%",
        fontWeight: 200 as 200,
    },
    secondaryMessage: {
        color: "white",
        textAlign: "left",
        fontSize: "145%",
        marginTop: 0,
        fontWeight: 100 as 100,
    },
    gridContainer: {
        marginTop: 0,
        minHeight: "60vh",
        padding: "10vw",
        paddingTop: "10vh",
        paddingBottom: "0vh",
        background: "linear-gradient(to right, #2740a8 0%,#c190d9 79%)",
    },
    getStarted: {
        backgroundColor: "#5FC67A",
        color: "white",
        fontSize: "1.25em",
    },
    someImagesContainer: {
        display: "flex",
        flex: 1,
        justifyContent: "center" as "center",
    },
    someImagesBox: {
        display: "flex",
        flex: 1,
        justifyContent: "center" as "center",
        paddingTop: 15,
    },
    someImage: {
        width: "100%",
        height: "auto",
        position: "absolute",
        bottom: 0,
    } as React.CSSProperties,
    productImage: {
        width: "100%",
        height: "auto",
        border: "none",
        boxShadow: "2px 3px 10px 3px #e6e6e6",
    },
    creatorText: {
        aligSelf: "center",
        color: colors.mainLVibrant,
        fontWeight: 900 as 900,
    },
    podsheetText: {
        marginTop: "2vw",
        color: colors.mainLVibrant,
        fontWeight: 900 as 900,
        fontSize: "220%",
    },
    podsheetsOptionsText: {
        marginTop: "2vw",
        marginBottom: "2vw",
        color: colors.mainDark,
        fontWeight: 600 as 600,
        fontSize: "190%",
    },
    positiveText: {
        color: "limegreen",
        fontSize: "190%",
    },
};
