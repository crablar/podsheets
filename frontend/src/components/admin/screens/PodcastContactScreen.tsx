import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as moment from "moment";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { Container, Header } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import PodcastContactForm, { IPodcastContactFields } from "../forms/PodcastContactForm";
import ContentHeader from "../generic/ContentHeader";
import LoadingContainer from "../generic/LoadingContainer";
import Sidebar from "../generic/Sidebar";

interface IPodcastContactScreenProps {
    rootState?: RootState;
    history?: any;
}
interface IPodcastContactScreenState {
    error?: string;
    message?: string;
}

@inject("rootState")
@observer
export default class PodcastContactScreen extends React.Component<IPodcastContactScreenProps, {}> {

    public state: IPodcastContactScreenState = { error: null, message: null };

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
                            <PodcastContactForm
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
    protected async onSubmit(form: IPodcastContactFields) {
        try {
            const formData: any = { ...form };

            await this.props.rootState.updatePodcastContactInformation(formData);
            this.setState({
                message: "Podcast saved " + moment().format("L") + " " + moment().format("LT"),
                error: "",
            });

        } catch (err) {
            this.setState({ error: err.message, message: "" });
        }
    }

    @autobind
    protected async onPreview(form: IPodcastContactFields) {

        try {
            const formData: any = { ...form };

            await this.props.rootState.previewPodcastContactInformation(formData);
        } catch (err) {
            this.setState({ error: err.message, message: "" });
        }

    }

    protected clearMessages() {
        this.setState({ error: null, message: null });
    }

}
