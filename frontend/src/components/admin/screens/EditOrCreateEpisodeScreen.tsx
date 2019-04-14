import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as moment from "moment";
import * as React from "react";
import { Link } from "react-router-dom";
import { Header, Message } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import EpisodeForm, { IEpisodeFields } from "../forms/EpisodeForm";
import ContentHeader from "../generic/ContentHeader";
import LoadingContainer from "../generic/LoadingContainer";
import Sidebar from "../generic/Sidebar";

interface IEditEpisodeScreenProps {
    rootState?: RootState;
    history?: any;
    match?: any;
    editingEpisode?: boolean;
    uploadProgress?: object;
}
interface IEditEpisodeScreenState {
    error?: string;
    message?: string;
}

@inject("rootState")
@observer
export default class EditEpisodeScreen extends React.Component<IEditEpisodeScreenProps, IEditEpisodeScreenState> {
    public state: IEditEpisodeScreenState = { error: null, message: null };
    public render() {
        return (
            <LoadingContainer
                loading={!!this.props.rootState.loadingCount}
                restrictAccess="authOnly"
                isAuthenticated={this.props.rootState.isAuthenticated}
                podcastRequired={this.props.rootState.podcast} >
                {this.renderContentIfPodcastPresent()}
            </LoadingContainer>
        );
    }

    protected async componentDidMount() {
        this.props.editingEpisode ?
            this.props.rootState.getEpisodeById(this.props.match.params) :
            this.props.rootState.getPodcastWithEpisodes();
    }

    protected async componentWillMount() {
        if (!this.props.editingEpisode) {
            this.props.rootState.unsetCurrentEpisode();
        }
    }

    protected renderContentIfPodcastPresent() {
        if (!this.props.rootState.podcast) { return null; }
        if (this.props.editingEpisode && !this.props.rootState.currentEpisode) { return null; }
        return (
            <div style={globalStyles.contentWrapper} >
                <Sidebar currentPodcast={this.props.rootState.podcast} />
                 <main style={globalStyles.workspaceContent}>
                    <ContentHeader
                        clearMessages={() => this.clearMessages()}
                        message={this.state.message}
                        error={this.state.error} />
                    <div>
                        <EpisodeForm
                            rootState={this.props.rootState}
                            currentPodcast={this.props.rootState.podcast}
                            onPreview={this.onPreview}
                            onSubmit={this.onSubmit}
                            getUploadPolicy={this.props.rootState.getUploadPolicy}
                            uploadFile={this.props.rootState.uploadFileToCloudStorage}
                            // tslint:disable-next-line:max-line-length
                            currentEpisode={(this.props.editingEpisode || this.props.rootState.currentEpisode) ? this.props.rootState.currentEpisode : null}
                            publishItemHandler={this.onPublish}
                            unpublishItemHandler={this.onUnpublish}
                            uploadProgress={this.props.rootState.uploadProgress} />
                    </div>
                </main>
            </div>
        );
    }

    protected renderError() {
        if (!this.state.error) { return null; }
        return (
            <Message
                error
                header="Error"
                content={this.state.error}
            />
        );
    }

    protected clearMessages() {
        this.setState({ error: null, message: null });
    }

    @autobind
    protected async onPublish(form: IEpisodeFields) {
        try {
            const formData: any = { ...form };
            if (this.props.editingEpisode || this.props.rootState.currentEpisode) {
                formData._id = this.props.rootState.currentEpisode._id;
            }
            await this.props.rootState.publishEpisode(formData);
            // tslint:disable-next-line:max-line-length
            this.setState({ message: "Episode published " + moment().format("L") + " " + moment().format("LT"), error: ""});
            this.props.history.push({ pathname: "/" });
        } catch (err) {
            this.setState({ error: err.message, message: "" });
        }
    }

    @autobind
    protected async onUnpublish(form: IEpisodeFields): Promise<void> {
        try {
            const formData: any = { ...form };
            if (!this.props.editingEpisode || !this.props.rootState.currentEpisode._id) { return null; }
            formData._id = this.props.rootState.currentEpisode._id;
            await this.props.rootState.unpublishEpisode(formData);
            // tslint:disable-next-line:max-line-length
            this.setState({ message: "Episode unpublished " + moment().format("L") + " " + moment().format("LT"), error: "" });
            // this.props.history.push({ pathname: "/" });
        } catch (err) {
            this.setState({ error: err.message, message: "" });
        }
    }

    @autobind
    protected async onSubmit(form: IEpisodeFields) {
        try {
            const formData: any = { ...form };
            if (this.props.editingEpisode) {
                formData._id = this.props.rootState.currentEpisode._id;
            }
            await this.props.rootState.updateOrCreateEpisode(formData);
            // tslint:disable-next-line:max-line-length
            this.setState({ message: "Episode saved " + moment().format("L") + " " + moment().format("LT"), error: "" });
            // this.props.history.push({ pathname: "/" });
        } catch (err) {
            this.setState({ error: err.message, message: "" });
        }
    }

    @autobind
    protected async onPreview(form: IEpisodeFields) {
        try {
            const formData: any = { ...form };
            await this.props.rootState.updateOrCreateEpisodePreview(formData);
        } catch (err) {
            this.setState({ error: err.message, message: "" });
        }
    }
}
