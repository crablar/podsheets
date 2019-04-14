import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { Container, Header } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import PodcastStatsForm from "../forms/PodcastStatsForm.jsx";
import ContentHeader from "../generic/ContentHeader";
import LoadingContainer from "../generic/LoadingContainer";
import Sidebar from "../generic/Sidebar";
interface IPodcastStatsScreenProps {
    rootState?: RootState;
    history?: any;
}

interface IPodcastStatsScreenState {
    error?: string;
    message?: string;
}

@inject("rootState")
@observer
export default class PodcastStatsScreen extends React.Component<IPodcastStatsScreenProps, {}> {

    public state: IPodcastStatsScreenState = { error: null, message: null };

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
                        <PodcastStatsForm
                            currentPodcast={this.props.rootState.podcast}/>
                    </div>
                </main>
            </div>
        );
    }

    protected clearMessages() {
        this.setState({ error: null, message: null });
    }

}
