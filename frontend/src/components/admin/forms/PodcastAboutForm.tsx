import { autobind } from "core-decorators";
import * as React from "react";
import * as ReactQuill from "react-quill/src/";
import { Button, Form, Header, Icon, Input, Popup, Segment } from "semantic-ui-react";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";

interface IPodcastAboutFormProps {
    onSubmit: (formState: IPodcastAboutFields) => void; // Promise<void>;
    onPreview?: (item: IPodcastAboutFields) => void;
    currentPodcast: IPodcast;
}

export interface IPodcastAboutFields {
    about?: string;
}

export interface IPodcastAboutFormState {
    fields: IPodcastAboutFields;
    previewDevice?: string;
}

import * as Modal from "boron/FadeModal";

export default class PodcastAboutForm extends React.Component<IPodcastAboutFormProps, IPodcastAboutFormState> {

    public modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                ["link", "image"],
                ["clean"],
            ],
            handlers: {
                image: () => {
                    const range = this.quill.getSelection();
                    const value = prompt("What is the image URL");
                    if (value) {
                        this.quill.insertEmbed(range.index, "image", value, ReactQuill.Quill.sources.USER);
                    }
                },
            },
        },
    };

    public quill = null;

    public formats = [
        "header",
        "bold", "italic", "underline", "strike", "blockquote",
        "list", "bullet", "indent",
        "link", "image",
    ];

    public fileInput: any = null;

    constructor(props: IPodcastAboutFormProps) {
        super();
        if (props.currentPodcast) {
            const about = props.currentPodcast.about ? props.currentPodcast.about : "";
            this.state = {
                fields: { about },
                previewDevice: "desktop",
            };
        }
    }

    public render() {

        return (
            <Segment style={{ width: "75%", paddingLeft: 0 }} basic>
                <Form onSubmit={this.onSubmit}>
                    <Header as="h2" style={globalStyles.title}>
                        About
                    </Header>
                    <p style={globalStyles.workspaceContentText}>
                        This is the About page for your podcast website.
                    </p>
                    <div style={{ height: 320, marginTop: 30 }}>
                        <ReactQuill
                            ref={(component) => {
                                if (component) {
                                    this.quill = component.getEditor();
                                }
                            }}
                            style={{ height: 250 }}
                            theme="snow"
                            modules={this.modules}
                            formats={this.formats}
                            value={this.state.fields.about}
                            onChange={this.onChangeContentField} />
                    </div>
                    <Button
                        onClick={(e) => this.onPreview(this.state.fields, e)}
                        style={{ marginTop: "1em", fontWeight: 550, fontSize: "120%", color: "white", backgroundColor: "#6D75DD"}}>
                        Preview
                    </Button>
                    <Button
                        onClick={(e) => this.onSubmit(e)}
                        style={{ marginTop: "1em", fontWeight: 550, fontSize: "120%", color: "black", backgroundColor: "#F4CB10"}}>
                        Save
                    </Button>
                </Form>
                <Modal modalStyle={style.previewModal} ref="modal" keyboard={(e: any) => this.callback(e)}>
                    <div style={style.previewHeader}>
                        <div style={style.deviceIcons}>
                            <Button
                                onClick={() => this.setState({ previewDevice: "desktop" })} style={style.deviceIcon}>
                                <Icon style={this.getPreviewIconColor("desktop")} name="desktop" size="big" />
                            </Button>
                            <Button onClick={() => this.setState({ previewDevice: "tablet" })} style={style.deviceIcon}>
                                <Icon style={this.getPreviewIconColor("tablet")} name="tablet" size="big" />
                            </Button>
                            <Button onClick={() => this.setState({ previewDevice: "mobile" })} style={style.deviceIcon}>
                                <Icon style={this.getPreviewIconColor("mobile")} name="mobile" size="big" />
                            </Button>
                        </div>
                        <Button onClick={() => this.hidePreview()} style={style.previewCloseIcon}>
                            <Icon name="delete" size="large" />
                        </Button>
                    </div>
                    <div style={style.iframeContainer}>
                        <iframe
                            style={this.getPreviewStyle()}
                            src={`/p/${this.props.currentPodcast.slug}/preview/#/about`}>
                        </iframe>
                    </div>
                </Modal>
            </Segment>
        );
    }

    protected getPreviewIconColor(device: string) {
        return this.state.previewDevice === device ? { color: "black" } : { color: "gray" };
    }

    protected getPreviewStyle() {
        switch (this.state.previewDevice) {
            case "desktop":
                return style.previewIframeDesktop;
            case "tablet":
                return style.previewIframeTablet;
            case "mobile":
                return style.previewIframeMobile;
        }

        return style.previewIframeDesktop;
    }

    protected showPreview() {
        (this.refs.modal as any).show();
        this.setState({ previewDevice: "desktop" });
    }

    protected hidePreview() {
        (this.refs.modal as any).hide();
    }

    protected callback(event: any) {
        // console.warn(event);
    }

    @autobind
    protected onChangeContentField(content: any) {
        if (content) {
            const fields = { ...this.state.fields, about: content };
            this.setState({ fields });
        }
    }

    @autobind
    protected onPreview(item: IPodcastAboutFields, e: React.MouseEvent<HTMLButtonElement>) {
            this.props.onPreview(item);
            this.showPreview();
            e.preventDefault();
    }

    @autobind
    protected async onSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        await this.props.onSubmit(this.state.fields);

    }
}

const style = {
    formInput: {
        minWidth: "50%",
        maxWidth: 250,
    },
    publishIcon: {
        marginTop: 2,
        fontSize: "80%",
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 15,
        alignSelf: "flex-end",
    },
    unpublishIcon: {
        marginTop: -3,
        fontSize: "80%",
        marginBottom: 3,
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 15,
        alignSelf: "flex-end",
    },
    actionIcon: {
        fontSize: "80%",
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 0,
        marginRight: 15,
        alignSelf: "flex-end",
    },
    tooltip: {
        ...globalStyles.tooltip,
        margin: 0,
        marginBottom: 0,
        marginLeft: 15,
    },
    actionContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "row" as "row",
        justifyContent: "center" as "center",
    },
    previewModal: {
        width: "90%",
        height: "90%",
    },
    previewIframeDesktop: {
        display: "block",
        width: "90vw",
        height: "83vh",
    },
    previewIframeTablet: {
        display: "block",
        width: (window.innerHeight * 0.9 ) * 0.75, // iPad aspect ratio
        height: "83vh",
    },
    previewIframeMobile: {
        display: "block",
        width: (window.innerHeight * 0.9) * 0.5625, // iPhone apsect ratio
        height: "83vh",
    },
    previewHeader: {
        display: "block",
        height: "7vh",
        width: "90vw",
    },
    previewCloseIcon: {
        backgroundColor: "transparent",
        position: "absolute",
        top: 0,
        right: 0,
        width: "1vh",
        height: "1vh",
        display: "flex",
        justifyContent: "center" as "center",
    },
    deviceIcon: {
        backgroundColor: "transparent",
    },
    deviceIcons: {
        display: "flex",
        flex: 1,
        height: "7vh",
        justifyContent: "center" as "center",
        fontSize: "140%",
    },
    iframeContainer: {
        display: "flex",
        flexDirection: "row" as "row",
        justifyContent: "center" as "center",
        backgroundColor: "#333",
    },
};
