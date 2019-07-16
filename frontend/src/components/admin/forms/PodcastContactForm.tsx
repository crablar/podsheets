import { autobind } from "core-decorators";
import * as React from "react";
import * as ReactQuill from "react-quill/src/";
import { Button, Form, Header, Icon, Input, Popup, Segment } from "semantic-ui-react";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";

interface IPodcastContactFormProps {
    onSubmit: (formState: IPodcastContactFields) => void; // Promise<void>;
    onPreview?: (item: IPodcastContactFields) => void;
    currentPodcast: IPodcast;
}

export interface IPodcastContactFields {
    contactEmail?: string;
    contactMessage?: string;
    contactFacebook?: string;
    contactTwitter?: string;
}

export interface IPodcastContactFormState {
    fields: IPodcastContactFields;
    previewDevice?: string;
}

import * as Modal from "boron/FadeModal";

export default class PodcastContactForm extends React.Component<IPodcastContactFormProps, IPodcastContactFormState> {

    constructor(props: IPodcastContactFormProps) {
        super();

        if (props.currentPodcast) {
            this.state = {
                fields: {
                    contactEmail: props.currentPodcast.contactEmail || "",
                    contactMessage: props.currentPodcast.contactMessage || "",
                    contactFacebook: props.currentPodcast.contactFacebook || "",
                    contactTwitter: props.currentPodcast.contactTwitter || "",
                },
                previewDevice: "desktop",
            };
        }
    }

    public render() {

        return (
            <Segment style={{ width: "75%", paddingLeft: 0 }} basic>
                <Form onSubmit={this.onSubmit}>
                    <Header as="h2" style={globalStyles.title}>
                        Contact
                    </Header>
                    <p style={globalStyles.workspaceContentText}>
                        This is the Contact page for your podcast website. Include your information
                         so listeners can contact you. Your email will not be shown on the
                          page; people on the site will see a contact form.
                    </p>
                    <Form.Field className="formInput">
                        <div style={style.formLabel}>Message to your listeners*</div>
                        <Input
                            style={style.formInput}
                            name="contactMessage"
                            placeholder="Please contact me with ideas and suggestions."
                            value={this.state.fields.contactMessage}
                            onChange={this.onChangeInputField}
                            required />
                    </Form.Field>
                    <Form.Field className="formInput">
                        <div style={style.formLabel}>Email</div>
                        <p style={globalStyles.workspaceContentText}>
                            Your email will not be displayed. A contact form will be displayed to send you an email.
                        </p>
                        <Input
                            required
                            style={style.formInput}
                            name="contactEmail"
                            value={this.state.fields.contactEmail}
                            onChange={this.onChangeInputField}
                            />
                    </Form.Field>
                    <Form.Field className="formInput">
                        <div style={style.formLabel}>Facebook</div>
                        <Input
                            style={style.formInput}
                            name="contactFacebook"
                            value={this.state.fields.contactFacebook}
                            onChange={this.onChangeInputField}
                            />
                    </Form.Field>
                    <Form.Field className="formInput">
                        <div style={style.formLabel}>Twitter</div>
                        <Input
                            style={style.formInput}
                            name="contactTwitter"
                            value={this.state.fields.contactTwitter}
                            onChange={this.onChangeInputField}
                            />
                    </Form.Field>
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
                            src={`/p/${this.props.currentPodcast.slug}/preview/#/contact`}>
                        </iframe>
                    </div>
                </Modal>
            </Segment>
        );
    }

    protected getPreviewIconColor(device: string) {
        return this.state.previewDevice === device ? { color: "black" } : { color: "gray" };
    }

    @autobind
    protected onChangeInputField(e: React.ChangeEvent<HTMLInputElement>, input: any) {
        if (input && input.name) {
            // tslint:disable-next-line:prefer-object-spread
            const fields = Object.assign({}, this.state.fields, { [input.name]: input.value });
            this.setState({ fields });
        }
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
    protected onPreview(item: IPodcastContactFields, e: React.MouseEvent<HTMLButtonElement>) {
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
    formLabel: {
        display: "flex",
        minWidth: 80,
        textAlign: "left",
        fontSize: "120%" as "120%",
        color: colors.mainDark,
        fontWeight: 300 as 300,
        marginBottom: 15,
        marginTop: 40,
    },
    formInput: {
        minWidth: "75%",
        color: colors.mainLight,
    },
    hidenInput: {
        display: "none",
        visibility: "hidden",
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
        width: (window.innerHeight * 0.9) * 0.75, // iPad aspect ratio
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
