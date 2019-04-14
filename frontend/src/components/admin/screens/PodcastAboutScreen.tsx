import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as moment from "moment";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { Container, Header } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import PodcastAboutForm, { IPodcastAboutFields } from "../forms/PodcastAboutForm";
import ContentHeader from "../generic/ContentHeader";
import LoadingContainer from "../generic/LoadingContainer";
import Sidebar from "../generic/Sidebar";

interface IPodcastAboutScreenProps {
    rootState?: RootState;
    history?: any;
}
interface IPodcastAboutScreenState {
    error?: string;
    message?: string;
}

@inject("rootState")
@observer
export default class PodcastAboutScreen extends React.Component<IPodcastAboutScreenProps, {}> {

    public state: IPodcastAboutScreenState = { error: null, message: null };

    public render() {
        return (
            <LoadingContainer
                loading={!!this.props.rootState.loadingCount}
                restrictAccess="authOnly"
                isAuthenticated={this.props.rootState.isAuthenticated} >
                {this.renderContent()}
            </LoadingContainer>
        );
    }

    protected async componentDidMount() {
        this.props.rootState.getPodcastWithEpisodes();
    }

    protected renderContent() {

        return (
            <div style={globalStyles.contentWrapper} >
                <div style={globalStyles.contentWrapper} >
                    <Sidebar currentPodcast={this.props.rootState.podcast} />
                    <main style={globalStyles.workspaceContent}>
                        <ContentHeader
                            clearMessages={() => this.clearMessages()}
                            message={this.state.message}
                            error={this.state.error} />
                        <div>
                            <PodcastAboutForm
                                onPreview={this.onPreview}
                                onSubmit={this.onSubmit}
                                currentPodcast={this.props.rootState.podcast} />
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    @autobind
    protected async onSubmit(form: IPodcastAboutFields) {
        if (this.props.rootState.podcast.theme !== form.about) {
            // tslint:disable-next-line:prefer-object-spread
            const podcast = Object.assign({}, this.props.rootState.podcast, { about: form.about });
            await this.props.rootState.updateOrCreatePodcast(podcast);
            // tslint:disable-next-line:max-line-length
            this.setState({ message: "Podcast updated " + moment().format("L") + " " + moment().format("LT"), error: "" });
        }
    }

    @autobind
    protected async onPreview(form: IPodcastAboutFields) {
        try {
            const podcast = {...this.props.rootState.podcast,  aboutPreview: form.about};
            await this.props.rootState.updateOrCreatePodcast(podcast);
        } catch (err) {
            this.setState({ error: err.message, message: "" });
        }
    }

    protected clearMessages() {
        this.setState({ error: null, message: null });
    }

}
