import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { Container, Header } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import PodcastDesignForm, { IPodcastDesignFields } from "../forms/PodcastDesignForm";
import ContentHeader from "../generic/ContentHeader";
import LoadingContainer from "../generic/LoadingContainer";
import Sidebar from "../generic/Sidebar";

interface IPodcastDesignScreenProps {
    rootState?: RootState;
    history?: any;
}

interface IPodcastDesignState {
    error?: string;
    message?: string;
}

@inject("rootState")
@observer
export default class PodcastDesignScreen extends React.Component<IPodcastDesignScreenProps, {}> {

    public state = {
        error: "",
        message: "",
    };

    public render() {

        return (
            <LoadingContainer
                loading={!!this.props.rootState.loadingCount}
                restrictAccess="authOnly"
                isAuthenticated={this.props.rootState.isAuthenticated} >
                {this.renderContentIfPodcastPresent()}
            </LoadingContainer>
        );
    }

    protected async componentDidMount() {
        this.props.rootState.getPodcastWithEpisodes();
    }

    protected renderContentIfPodcastPresent() {
        if (!this.props.rootState.podcast) { return null; }
        return (
            <div style={globalStyles.contentWrapper} >
                <Sidebar currentPodcast={this.props.rootState.podcast} />
                <main style={globalStyles.workspaceContent}>
                    <ContentHeader
                        clearMessages={() => this.clearMessages()}
                        message={this.state.message}
                        error={this.state.error} />
                    <div>
                        <PodcastDesignForm
                            onPreview={this.onPreview}
                            currentPodcast={this.props.rootState.podcast}
                            onSubmit={this.onSubmit} />
                    </div>
                </main>
            </div>
        );
    }

    protected clearMessages() {
        this.setState({ error: null, message: null });
    }

    @autobind
    protected async onSubmit(form: IPodcastDesignFields) {
        if (this.props.rootState.podcast.theme !== form.theme || this.props.rootState.podcast.layout !== form.layout) {
            // tslint:disable-next-line:prefer-object-spread
            const podcast = Object.assign({}, this.props.rootState.podcast, { theme: form.theme, layout: form.layout });
            const response = await this.props.rootState.updateOrCreatePodcast(podcast);
            if (response.status === 200) {
                this.setState({ message: "Podcast saved successfully.", error: null });
            } else {
                this.setState({ error: "Failed to save Podcast, please try again later.", message: null });
            }
        }
        // this.props.history.push({ pathname: "/" });
    }

    @autobind
    protected async onPreview(form: IPodcastDesignFields) {
        // tslint:disable-next-line:prefer-object-spread
        // tslint:disable-next-line:max-line-length
        const podcast = { ...this.props.rootState.podcast, preview: { theme: form.theme, layout: form.layout } };
        return this.props.rootState.updateOrCreatePodcast(podcast);
    }
}
