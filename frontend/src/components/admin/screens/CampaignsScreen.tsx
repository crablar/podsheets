import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as moment from "moment";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { Container, Header } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import ContentHeader from "../generic/ContentHeader";
import LoadingContainer from "../generic/LoadingContainer";
import Sidebar from "../generic/Sidebar";

interface ICampaignsScreenProps {
    rootState?: RootState;
    history?: any;
}
interface ICampaignsScreenState {
    error?: string;
    message?: string;
}

@inject("rootState")
@observer
export default class CampaignsScreen extends React.Component<ICampaignsScreenProps, {}> {

    public state: ICampaignsScreenState = { error: null, message: null };

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
                        <Header as="h2" style={globalStyles.title}>Campaigns</Header>
                    </main>
                </div>
            </div>
        );
    }

    @autobind
    protected async onSubmit(form: any) {
        // TO-DO
    }

    protected clearMessages() {
        this.setState({ error: null, message: null });
    }

}
