import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { Container } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import PodcastEditForm, { IPodcastEditFormFields } from "../forms/PodcastEditForm";
import PodcastForm, { IPodcastFields } from "../forms/PodcastForm";
import ContentHeader from "../generic/ContentHeader";
import LoadingContainer from "../generic/LoadingContainer";
import Sidebar from "../generic/Sidebar";

interface IPodcastHomeScreenProps {
    rootState?: RootState;
    history?: any;
    editingPodcast?: boolean;
}

@inject("rootState")
@observer
export default class CreatePodcastScreen extends React.Component<IPodcastHomeScreenProps, {}> {

    public state = { error: "", message: "" };

    public render() {
        // We only allow users to create one podcast
        if (this.props.rootState.podcast && !this.props.editingPodcast) {
            return (<Redirect to={{ pathname: "/" }} />);
        }
        if (!this.props.rootState.podcast) {
            return (
                <LoadingContainer
                    loading={!!this.props.rootState.loadingCount}
                    restrictAccess="authOnly"
                    isAuthenticated={this.props.rootState.isAuthenticated} >
                    <Container style={globalStyles.content} textAlign="center" text>
                        <PodcastForm
                            onSubmit={this.onSubmit}
                            getUploadPolicy={this.props.rootState.getUploadPolicy}
                            uploadFile={this.props.rootState.uploadFileToCloudStorage}
                            currentPodcast={this.props.rootState.podcast} />
                    </Container>
                </LoadingContainer>
            );
        } else {
            return (
                <div style={globalStyles.contentWrapper} >
                    <Sidebar currentPodcast={this.props.rootState.podcast} />
                    <main style={globalStyles.workspaceContent}>
                        <ContentHeader
                            clearMessages={() => this.clearMessages()}
                            message={this.state.message}
                            error={this.state.error} />
                        <div>
                            <PodcastEditForm
                                onRemoveCollaborators={this.onRemoveCollaborators}
                                onSendInvite={this.onSendInvite}
                                onSubmit={this.onSubmit}
                                rootState={this.props.rootState}
                                getUploadPolicy={this.props.rootState.getUploadPolicy}
                                uploadFile={this.props.rootState.uploadFileToCloudStorage}
                                currentPodcast={this.props.rootState.podcast} />
                        </div>
                    </main>
                </div>
            );
        }
    }

    protected clearMessages() {
        this.setState({ error: "", message: "" });
    }

    protected async componentDidMount() {
        this.props.rootState.getPodcastWithEpisodes();
    }

    @autobind
    protected async onSendInvite(email: string) {
        const { error, message } = await this.props.rootState.sendInviteForCollab(email);
        this.setState({ error, message });
    }

    @autobind
    protected async onRemoveCollaborators(collaborators: any[]) {
        const { error, message } = await this.props.rootState.removeCollaborators(collaborators);
        this.setState({ error, message });
    }

    @autobind
    protected async onSubmit(form: IPodcastFields, noRedirect = false) {
        const response = await this.props.rootState.updateOrCreatePodcast(form);
        if (response.status === 200) {
            this.setState({ message: "Podcast saved successfully.", error: null });
        } else {
            this.setState({ error: "Failed to save Podcast, please try again later.", message: null });
        }
        if (!noRedirect) {
            this.props.history.push({ pathname: "/" });
        }
    }
}
