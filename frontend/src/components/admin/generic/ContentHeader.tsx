import { autobind } from "core-decorators";
import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { Button, Container, Dropdown, Header, Icon, Input, Message, Modal, Popup, Progress, Segment } from "semantic-ui-react";
import { storage } from "../../../lib/constants";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import PodcastForm, { IPodcastFields } from "../forms/PodcastForm";

interface IHeaderProps {
    rootState?: RootState;
    error?: string;
    message?: string;
    fullWidth?: boolean;
    clearMessages?: () => void;
}

interface IHeaderState {
    createOpen: boolean;
}

@inject("rootState")
@observer
export default class ContentHeader extends React.Component<IHeaderProps, IHeaderState> {

    public state: IHeaderState = {
        createOpen: false,
    };

    public render() {
        let podcasts = this.props.rootState.podcasts;
        if (!podcasts) {
            podcasts = [this.props.rootState.podcast];
        }
        return (
            <div style={{ height: "11rem", paddingTop: 20, width: !!this.props.fullWidth ? "100%" : "75%" }}>
                <Header style={{ ...globalStyles.text, paddingBottom: 10 }} as="h2">
                    {this.renderRSSLink()}
                    <Dropdown style={{
                        marginTop: 4,
                    }} text={this.props.rootState.podcast.title} icon="dropdown">
                        <Dropdown.Menu style={{
                            marginTop: 5,
                            width: "100%",
                        }}>
                            {podcasts.map((option) => <Dropdown.Item
                                onClick={() => this.props.rootState.switchPodcast(option._id)}
                                style={{
                                    color: colors.mainDark,
                                }}
                                value={option._id}
                                text={option.title}
                                key={option._id} />)}
                            <Button
                                onClick={() => this.toggleCreate()}
                                style={{
                                    backgroundColor: colors.mainDark,
                                    color: "white",
                                    borderRadius: 0,
                                }}
                                fluid>
                                New Podcast
                            </Button>
                        </Dropdown.Menu>
                    </Dropdown>
                </Header>
                <div style={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "row",
                }}>
                    <Button
                        floated="left"
                        style={style.newEpisode}
                        as={Link}
                        to="/new_episode"
                        positive>New Episode</Button>
                    {this.renderStorageWarning()}
                    {this.renderErrorMessage()}
                    {this.renderImportProgress()}
                </div>
                <Modal
                    closeIcon={true}
                    open={this.state.createOpen}
                    onClose={() => this.toggleCreate()}
                    size="small">
                    <Container style={style.content} textAlign="center" text>
                        <PodcastForm
                            saveButtonTitle="Create"
                            onSubmit={this.onSubmit}
                            getUploadPolicy={this.props.rootState.getUploadPolicy}
                            uploadFile={this.props.rootState.uploadFileToCloudStorage}
                            currentPodcast={null} />
                    </Container>
                </Modal>
            </div>
        );
    }

    protected toggleCreate() {
        this.setState({ createOpen: !this.state.createOpen });
    }

    @autobind
    protected async onSubmit(form: IPodcastFields) {
        form._id = null;
        await this.props.rootState.updateOrCreatePodcast(form);
        this.toggleCreate();
        location.reload();
    }

    protected renderErrorMessage() {

        if (!this.props.error && !this.props.message) { return null; }

        return (
            <div style={{
                width: "100%",
                paddingLeft: 0,
                height: 50,
            }}>
                <div style={{
                    width: "100%",
                    borderRadius: 3,
                    backgroundColor: this.props.error ? "#E7C2CB" : "#F1FDF4",
                    color: this.props.error ? "#E37A8C" : "#73BC79",
                    padding: 11,
                    fontSize: "120%",
                    boxShadow: "1px 1px 3px lightgray",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "lightgray",
                    position: "relative",
                }}>
                    {this.props.error || this.props.message}
                    <div
                        onClick={() => this.props.clearMessages()}
                        style={{
                            position: "absolute",
                            top: 11,
                            right: 11,
                            cursor: "pointer",
                        }}>
                        <Icon name="delete" style={{
                            fontSize: "120%",
                        }} />
                    </div>
                </div>
            </div>
        );
    }

    protected renderStorageWarning() {

        const storageLimit = _.get(this.props, "rootState.podcast.subscription.storageLimit", storage.free);
        const usedStorage = _.get(this.props, "rootState.podcast.usedStorage", 0).toFixed(2);
        const uploadDisabled = Number(usedStorage) >= storageLimit;
        const usedAlot = Number(usedStorage) / storageLimit > 0.9;
        const message = uploadDisabled ? "You have exceeded the amount of monthly storage." :
            "You have used more than 90% of your storage";
        if ((uploadDisabled || usedAlot) && !this.props.rootState.warningDismissed) {
            return (
                <Message
                    onDismiss={() => this.props.rootState.dismissWarning()}
                    style={{
                        marginTop: 0,
                        float: "left",
                        display: "flex",
                        flex: 1,
                        height: 40,
                        paddingTop: 10,
                    }} color="yellow">
                    <Icon name="warning sign" />
                    {message}
                </Message>
            );
        } else {
            return null;
        }
    }

    @autobind
    protected renderImportProgress() {
        const importProgress = this.props.rootState.importProgress;
        if (importProgress && !(importProgress as any).done && !(importProgress as any).error) {
            return (
                <div>
                    <Progress
                        label={(importProgress as any).status}
                        size="large"
                        color="green"
                        style={style.progress}
                        value={(importProgress as any).current}
                        total={(importProgress as any).total}
                        indicating />
                </div>
            );
        } else if (importProgress && !!(importProgress as any).error) {
            return (
                <div>
                    <Message
                        style={{
                            marginLeft: 150,
                        }}
                        color="red"
                        onDismiss={() => this.handleDismiss()}
                        content="Failed to import some episodes from RSS feed."
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    protected handleDismiss() {
        this.props.rootState.resetImport();
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
}

const style = {
    content: {
        ...globalStyles.content,
        padding: 0,
    },
    newEpisode: {
        color: "white",
        fontSize: "120%",
        backgroundColor: "limegreen",
        marginTop: 0,
        height: 40,
        minWidth: 160,
    },
    progress: {
        marginLeft: 150,
        top: 1,
    },
};
