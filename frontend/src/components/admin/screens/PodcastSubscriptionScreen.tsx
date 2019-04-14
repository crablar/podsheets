import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { Container, Header } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import PodcastSubscriptionForm, { IPodcastSubscriptionFields } from "../forms/PodcastSubscriptionForm";
import ContentHeader from "../generic/ContentHeader";
import LoadingContainer from "../generic/LoadingContainer";
import Sidebar from "../generic/Sidebar";
interface IPodcastSubscriptionScreenProps {
    rootState?: RootState;
    history?: any;
}

interface IPodcastSubscriptionScreenState {
    error?: string;
    message?: string;
}

@inject("rootState")
@observer
export default class PodcastSubscriptionScreen extends React.Component<IPodcastSubscriptionScreenProps, {}> {

    public state: IPodcastSubscriptionScreenState = { error: null, message: null };

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

    @autobind
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
                        <PodcastSubscriptionForm
                            onCancelSubscription={this.onCancelSubscription}
                            currentPodcast={this.props.rootState.podcast}
                            onSubmit={this.onSubmit}
                        />
                    </div>
                </main>
            </div>
        );
    }

    protected clearMessages() {
        this.setState({ error: null, message: null });
    }

    @autobind
    protected async onSubmit(data: any) {

        try {
            this.clearMessages();
            console.warn("debug3");
            const response = await this.props.rootState.subscribe(data.token, data.storageLimit);
            console.warn("debug4");
            this.setState({ error: null, message: "Subscription added successfully" });
            // return response;
        } catch (err) {
            this.setState({ error: "Failed to add subscription", message: null });
        }
    }

    @autobind
    protected async onCancelSubscription() {
        try {
            this.clearMessages();
            await this.props.rootState.cancelSubscription();
            this.setState({ error: null, message: "Subscription cancelled" });
        } catch (err) {
            this.setState({ error: "Failed to cancel subscription", message: null });
        }
    }

}
