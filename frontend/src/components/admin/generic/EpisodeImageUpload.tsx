import { autobind } from "core-decorators";
import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { Button, Container, Header, Icon, Image, Input, Menu, Message, Modal, Popup, Progress, Segment } from "semantic-ui-react";
import { IEpisode, IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
interface IImageUploadProps {
    rootState?: RootState;
    episode?: IEpisode;
    podcast?: IPodcast;
    onClose: () => void;
    onImage: (url) => void;
    isOpen: boolean;
}

interface IImageUploadState {
    all: boolean;
    loading: boolean;
    selectedImage?: string;
    error?: string;
}

@inject("rootState")
@observer
export default class EpisodeImageUpload extends React.Component<IImageUploadProps, IImageUploadState> {

    public state = {
        all: false,
        selectedImage: null,
        loading: false,
        error: null,
    };

    @autobind
    public render() {
        return (
            <div>
                <Modal
                    onClose={() => this.props.onClose()}
                    open={this.props.isOpen}>
                    <Container
                        style={style.modalContent}>
                        <Container style={style.headerContainer}>
                            <Header
                                as="h2"
                                style={style.header}>
                                Images
                            </Header>
                            <Icon
                                size="large"
                                onClick={() => this.props.onClose()}
                                style={style.closeIcon}
                                name="close" />
                        </Container>
                        <Menu style={style.menu} tabular>
                            <Menu.Item
                                name="Episode"
                                active={!this.state.all}
                                onClick={(e, { name }) => this.handleItemClick(e, name)} />
                            <Menu.Item
                                name="All"
                                active={this.state.all}
                                onClick={(e, { name }) => this.handleItemClick(e, name)} />
                        </Menu>
                        <div style={style.trashContainer}>
                            <Icon
                                onClick={() => this.deleteImage()}
                                style={style.trashIcon}
                                name="trash outline"
                                size="large" />
                        </div>
                        <Container style={style.section}>
                            <Container style={{
                                display: !this.state.all ? "block" as "block" : "none" as "none",
                            }}>
                                {this.renderError()}
                                {this.renderEpisodeSection()}
                            </Container>
                            <Container style={{
                                display: this.state.all ? "block" as "block" : "none" as "none",
                            }}>
                                {this.renderError()}
                                {this.renderAllSection()}
                            </Container>
                        </Container>
                        <Container style={style.footer}>
                            <Button
                                onClick={() => this.onImagePick()}
                                disabled={!this.state.selectedImage}
                                style={style.addButton}
                                floated="right">
                                Add
                            </Button>
                        </Container>
                    </Container>
                </Modal>
                <input
                    onChange={(e) => this.onFile(e)}
                    ref="imageInput"
                    type="file"
                    style={{ display: "none" }} />
            </div>
        );
    }

    protected async deleteImage() {
        const selectedImage = this.state.selectedImage;
        await this.props.rootState.deleteImage(selectedImage);
    }

    protected renderError() {
        if (this.state.error) {
            return (
                <Message color="red">
                    {this.state.error}
                    <Icon
                        onClick={() => this.setState({ error: null })}
                        style={{
                            cursor: "pointer",
                            paddingTop: 4,
                            paddingRight: 10,
                        }} name="close" />
                </Message>
            );
        } else {
            return null;
        }
    }

    protected onImagePick() {
        const image = _.find(this.props.rootState.images, { _id: this.state.selectedImage });
        this.props.onImage(image.url);
    }
    protected renderEpisodeSection() {
        const filtered = _.filter(this.props.rootState.images, { episode: this.props.episode ? this.props.episode._id : null });
        return (
            <div style={style.sectionContent}>
                {this.renderImagesFromSource(filtered.reverse())}
            </div>
        );
    }

    protected renderAllSection() {
        const filtered = _.filter(this.props.rootState.images, { podcast: this.props.podcast._id });
        return (
            <div style={style.sectionContent}>
                {this.renderImagesFromSource(filtered.reverse())}
            </div>
        );
    }

    protected async onFile(e) {
        const file = _.get(e, "target.files", [null])[0];
        this.setState({ loading: true });
        if (file && file.name.match(/.(jpg|jpeg|png|gif|tif)$/i)) {
            try {
                const policyData = await this.props.rootState.getUploadPolicy(file);
                const { uploadUrl, publicFileUrl } = policyData;
                const response = await this.props.rootState.uploadFileToCloudStorage(file, uploadUrl, publicFileUrl);
                if (response.status === 200) {
                    // Upload was successfull
                    const episode = this.props.episode;
                    const podcast = this.props.podcast;
                    const entryResponse = await this.props.rootState.addImageEntry(publicFileUrl, episode ? episode._id : "", podcast._id);
                    this.setState({ error: null });
                } else {
                    this.setState({ error: "Image upload failed, please try again later." });
                    console.warn("Failed to upload image");
                }
            } catch (e) {
                this.setState({ error: "Image upload failed, please try again later." });
                console.warn(e);
            }
        } else {
            this.setState({ error: "Unsupported file format, please use jpg, png, tif or gif " });
        }
        this.setState({ loading: false });
    }

    protected renderImagesFromSource(source) {
        const images = _.map(source, (image) => {
            return (
                <Image
                    onClick={() => this.selectImage(image)}
                    style={{
                        ...style.image,
                        border: (image as any)._id === this.state.selectedImage ? "3px solid " + colors.highlight : "none",
                    }}
                    key={(image as any)._id}
                    src={(image as any).url}
                    size="small" />
            );
        });
        const uploadCard = this.state.all ? [] : [(
            <div
                style={style.uploadCard}
                onClick={() => (this.refs.imageInput as any).click()}>
                <Icon
                    style={{ color: colors.mainDark }}
                    name={this.state.loading ? "spinner" : "add"}
                    loading={this.state.loading}
                    size="large" />
            </div>
        )];

        return uploadCard.concat(images);
    }

    protected selectImage(image) {
        this.setState({ selectedImage: image._id });
    }

    protected handleItemClick(e, name) {
        this.setState({ all: name !== "Episode" });
    }

}

const style = {
    content: {
        ...globalStyles.content,
        padding: 0,
    },
    header: {
        color: colors.mainDark,
        display: "flex" as "flex",
        flex: 1,
    },
    closeIcon: {
        cursor: "pointer",
        color: colors.mainDark,
    },
    modalContent: {
        padding: 30,
    },
    headerContainer: {
        display: "flex" as "flex",
        flex: 1,
        flexDirection: "row" as "row",
    },
    menu: {
        marginTop: 15,
        width: "100%",
    },
    section: {
        height: 400,
    },
    footer: {
        paddingBottom: 30,
    },
    addButton: {
        marginTop: 15,
        color: "white",
        background: colors.mainDark,
    },
    sectionContent: {
        display: "flex" as "flex",
        flex: 1,
        flexDirection: "row" as "row",
        flexWrap: "wrap" as "wrap",
        overflow: "scroll" as "scroll",
        height: 400,
    },
    image: {
        width: 150,
        height: 150,
        margin: 5,
        borderRadius: 3,
        cursor: "pointer",
    },
    uploadCard: {
        width: 150,
        height: 150,
        margin: 5,
        borderRadius: 3,
        cursor: "pointer",
        border: "3px solid #EEE",
        display: "flex" as "flex",
        flexDirection: "column" as "column",
        textAlign: "center" as "center",
        justifyContent: "center" as "center",
        alignItems: "center" as "center",
    },
    trashContainer: {
        display: "flex",
        flex: 1,
        flexDirection: "row" as "row",
        justifyContent: "flex-end" as "flex-end",
    },
    trashIcon: {
        cursor: "pointer",
    },
};
