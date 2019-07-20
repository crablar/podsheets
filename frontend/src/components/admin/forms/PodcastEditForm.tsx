import axios from "axios";
import { autobind } from "core-decorators";
import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as React from "react";
import {
    Button, Dropdown, Form, Header, Icon, Image, Input, Message, Modal, Popup, Radio, Reveal, Segment,
} from "semantic-ui-react";
import { allowedItunesCategories } from "../../../lib/constants";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import AvatarEditor from "../generic/AvatarEditor";
import { Link } from "react-router-dom";

interface IPodcastEditFormProps {
    onSubmit: (formState: IPodcastEditFormFields, noRedirect: boolean) => Promise<void>;
    getUploadPolicy: (file: File) => Promise<{ uploadUrl: string, publicFileUrl: string }>;
    uploadFile: (file: File, policyUrl: string) => Promise<void>;
    onSendInvite: (email: string) => Promise<void>;
    onRemoveCollaborators: (collaborators: any[]) => Promise<void>;
    currentPodcast?: IPodcast;
    rootState?: RootState;
}

export interface IPodcastEditFormFields {
    title: string;
    subtitle: string;
    author: string;
    keywords: string;
    categories: string;
    imageUrl: string;
    email: string;
    advertisingEnabled: boolean;
    socialNetEnabled: boolean;
}

export interface IPodcastEditFormState {
    fields: IPodcastEditFormFields;
    uploading: boolean;
    imagePreviewUrl: string;
    error: string;
    categoryWarning?: string;
    addCollaboratorModal: boolean;
    removeCollaboratorModal: boolean;
    invitationEmail?: string;
    inviteError?: string;
    collaborators: any[];
    removedCollaborators: any[];
    loadingCollaborators: boolean;
    isCropping: boolean;
    isSocialSubscriptionActive: boolean;
    socialNetStatusChange: boolean;
    file?: any;
}
function getBaseUrl() {
    const re = new RegExp(/^.*\//);
    return re.exec(window.location.href)[0].replace("/#/", "/");
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const options = [
    { key: "Technology", text: "Technology", value: "Technology" },
    { key: "Entertainment", text: "Entertainment", value: "Entertainment" },
    { key: "Design", text: "Design", value: "Design" },
];

@inject("rootState")
@observer
export default class PodcastEditForm extends React.Component<IPodcastEditFormProps, IPodcastEditFormState> {
    public state: IPodcastEditFormState = {
        uploading: false,
        imagePreviewUrl: null,
        error: null,
        categoryWarning: null,
        fields: { title: "", subtitle: "", author: "", keywords: "", categories: "", imageUrl: "", email: "", advertisingEnabled: false, socialNetEnabled: false },
        addCollaboratorModal: false,
        removeCollaboratorModal: false,
        collaborators: [],
        removedCollaborators: [],
        loadingCollaborators: false,
        isCropping: false,
        isSocialSubscriptionActive: false,
        socialNetStatusChange: false,
    };

    constructor(props: IPodcastEditFormProps) {
        super();
        if (props.currentPodcast) {
            const userEmail = _.get(props, "rootState.me.email", "");
            const { title, subtitle, author, keywords, categories, imageUrl, email, advertisingEnabled, socialNetEnabled } = props.currentPodcast;
            this.state = {
                fields: {
                    title,
                    subtitle,
                    author,
                    keywords,
                    categories,
                    imageUrl,
                    email: (email || userEmail || ""),
                    advertisingEnabled: advertisingEnabled || false,
                    socialNetEnabled: socialNetEnabled || false,
                },
                uploading: false,
                imagePreviewUrl: null,
                error: null,
                addCollaboratorModal: false,
                removeCollaboratorModal: false,
                collaborators: [],
                loadingCollaborators: false,
                removedCollaborators: [],
                isCropping: false,
                socialNetStatusChange: false,
                isSocialSubscriptionActive: props.currentPodcast.subscription ? props.currentPodcast.subscription.storageLimit === 1000 : false,
            };
        }
    }

    @autobind
    public render() {
        const userEmail = _.get(this.props, "rootState.me.email", "");
        return (
            <Segment style={{ width: "75%", paddingBottom: 100, paddingLeft: 0 }} basic clearing>
                {this.renderError()}
                <Form loading={this.state.uploading}>
                    <Header as="h2" style={globalStyles.title}>
                        Settings
                        <div style={{
                            display: "flex",
                            flex: 1,
                            justifyContent: "center",
                        }}>
                            <Popup
                                trigger={
                                    <Form.Button onClick={(e) => this.toggleAddCollab(e)} style={styles.actionIcon} icon>
                                        <Icon size="small" name="add user" />
                                    </Form.Button>}
                                style={styles.tooltip}
                                basic
                                size="tiny"
                                content="Add collaborator" />
                            {this.props.currentPodcast.owner.length > 1 ?
                                <Popup
                                    trigger={
                                        <Form.Button onClick={(e) => this.toggleRemoveCollab(e)} style={styles.actionIcon} icon>
                                            <Icon size="small" name="remove user" />
                                        </Form.Button>
                                    }
                                    style={styles.tooltip}
                                    basic
                                    size="tiny"
                                    content="Remove collaborator" />
                                :
                                null
                            }
                        </div>
                    </Header>
                    <p style={{ ...globalStyles.workspaceContentText, marginBottom: "2em" }}>
                        The podcast information on this page will publish to iTunes and Google Play.
                    </p>
                    {/* {this.props.rootState.env.AD_PLACEMENT === "true" ?
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            flex: 1,
                        }}>
                            <Radio
                                onClick={(e) => {
                                    const fields = this.state.fields;
                                    this.setState({
                                        fields: {
                                            ...fields,
                                            advertisingEnabled: !fields.advertisingEnabled,
                                        },
                                    });
                                }}
                                checked={this.state.fields.advertisingEnabled} toggle />
                            <div style={{
                                marginLeft: 15,
                                display: "flex",
                                flex: 1,
                                color: colors.mainDark,
                            }}>
                                {this.state.fields.advertisingEnabled ? "Disable" : "Enable"} Advertising
                        </div>
                        </div>
                        :
                        null
                    } */}

                    <p style={{
                            color: colors.mainDark,
                            fontSize: "120%",
                            marginBottom: 5,
                            fontWeight: 600,
                        }}>Cover Art</p>
                    <p>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <div style={styles.imagePreview} >
                                <Reveal animated="fade" onClick={this.onFileUploadClick}>
                                    <Reveal.Content visible>
                                        <Image
                                            src={
                                                this.state.imagePreviewUrl
                                                ||
                                                this.state.fields.imageUrl
                                                || "/assets/image.png"
                                            }
                                            size="small" />
                                    </Reveal.Content>
                                    <Reveal.Content hidden>
                                        <Icon name="upload" size="massive" style={styles.uploadIcon} />
                                    </Reveal.Content>
                                </Reveal>
                            </div>
                        </div>

                        <input
                            ref="podcastImgRef"
                            onChange={this.onFileInput}
                            type="file"
                            style={styles.hidenInput} />
                        <p style={globalStyles.workspaceContentText}>
                            Image must be between 1400 X 1400 and 3000 X 3000
                        </p>
                    </p>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        paddingTop: "20px",
                    }}>
                        <p style={{
                            color: colors.mainDark,
                            fontSize: "120%",
                            marginBottom: 5,
                            fontWeight: 600,
                        }}>RSS</p>
                        <a
                            href={getBaseUrl() + `p/${this.props.rootState.podcast.slug}/rss.xml`}
                            target="_blank"
                            style={{
                            color: colors.mainDark,
                            fontSize: "120%",
                        }}>{getBaseUrl() + `p/${this.props.rootState.podcast.slug}/rss.xml`}</a>
                    </div>
                    <Form.Field className="formInput" required>
                        <div style={styles.formLabel}>Title</div>
                        <Input
                            style={styles.formInput}
                            name="title"
                            value={this.state.fields.title}
                            onChange={this.onChangeInputField}
                            required />
                    </Form.Field>
                    <Form.Field className="formInput" required>
                        <div style={styles.formLabel}>Subtitle</div>
                        <Input
                            style={styles.formInput}
                            name="subtitle"
                            value={this.state.fields.subtitle}
                            onChange={this.onChangeInputField}
                            required />
                    </Form.Field>
                    <Form.Field className="formInput" required>
                        <div style={styles.formLabel}>Author</div>
                        <Input
                            style={styles.formInput}
                            name="author"
                            value={this.state.fields.author}
                            onChange={this.onChangeInputField}
                            required />
                    </Form.Field>
                    <Form.Field className="formInput">
                        <div style={styles.formLabel}>Email</div>
                        <Input
                            style={styles.formInput}
                            name="email"
                            value={this.state.fields.email || userEmail}
                            onChange={this.onChangeInputField}
                            required />
                    </Form.Field>
                    <Form.Field className="formInput" required>
                        <div style={styles.formLabel}>Keywords</div>
                        <Input
                            style={styles.formInput}
                            name="keywords"
                            value={this.state.fields.keywords}
                            onChange={this.onChangeInputField}
                            required />
                    </Form.Field>
                    <Form.Field className="formInput" required>
                        <div style={styles.formLabel}>Categories
                            {this.state.categoryWarning ?
                                <span style={styles.categoryErrorContainer}>
                                    {this.state.categoryWarning}
                                    <div
                                        onClick={() => this.setState({ categoryWarning: "" })}
                                        style={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            cursor: "pointer",
                                        }}>
                                        <Icon name="delete" style={{
                                            fontSize: "120%",
                                        }} />
                                    </div>
                                </span>
                                :
                                null
                            }
                        </div>
                        <p style={globalStyles.workspaceContentText}>
                            Although you can specify more than one category in your feed,
                         the iTunes Store only recognizes the first category.
                         </p>
                        <Dropdown
                            value={this.state.fields.categories ? this.state.fields.categories.split(",").map(x => x.trim()) : null}
                            floating
                            placeholder="Technology"
                            fluid
                            multiple
                            selection
                            options={this.getCategories()}
                            onChange={(e, input) => {
                                const categories = this.state.fields.categories.split(",");
                                input.value = _.filter((input.value as string[]), (val) => {
                                    return !!val;
                                });
                                if ((input.value as string[]).length > 3) {
                                    this.setState({ categoryWarning: "Only 3 categories are allowed." });
                                } else {
                                    this.setState({
                                        categoryWarning: "",
                                        fields: {
                                            ...this.state.fields,
                                            categories: (input.value as string[]).join(","),
                                        },
                                    });
                                }
                            }} />
                    </Form.Field>
                    <Button
                        onClick={(e) => this.onSubmit(e)}
                        style={{...styles.buttonStyle, backgroundColor: "#F4CB10"}}>
                        Save
                    </Button>
                </Form>
                <Modal
                    open={this.state.addCollaboratorModal}
                    closeOnEscape={true}
                    closeOnRootNodeClick={true}
                    size={"tiny" as "small"}
                >
                    <Modal.Header style={{color: colors.mainDark}}>
                        Add Collaborator
                    </Modal.Header>
                    <Modal.Content>
                        {!!this.state.inviteError ?
                            <Message
                                color="red"
                                content={this.state.inviteError}
                            />
                            :
                            null
                        }
                        <Input
                            fluid
                            type="email"
                            onChange={(e, content) => this.onInvEmailChange(content)}
                            placeholder="user@example.com" />
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={(e) => this.toggleAddCollab(e)} basic color="red">Cancel</Button>
                        <Button onClick={(e) => this.sendInvite(e)} color="violet" labelPosition="right" icon="add" content="Add" />
                    </Modal.Actions>
                </Modal>
                <Modal
                    open={this.state.removeCollaboratorModal}
                    closeOnEscape={true}
                    closeOnRootNodeClick={true}
                    size={"tiny" as "small"}
                >
                    <Icon
                        style={styles.modalCloseButton}
                        onClick={(e) => this.toggleRemoveCollab(e)}
                        name="close" />
                    <Modal.Header>
                        Remove User
                    </Modal.Header>
                    <Modal.Content>
                        {this.state.collaborators.filter((user) => {
                            return !(this.state.removedCollaborators as any).includes(user._id);
                        }).length > 0 ?
                            this.state.collaborators.
                                filter((user) => {
                                    return !(this.state.removedCollaborators as any).includes(user._id);
                                })
                                .map((user) => {
                                    return (
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            flex: 1,
                                        }}>
                                            <span style={{
                                                display: "flex",
                                                flex: 1,
                                            }}>{user.email}</span>
                                            <Icon
                                                onClick={() => this.addRemovable(user)}
                                                size="large"
                                                style={styles.removeIcon} name="remove" />
                                        </div>
                                    );
                                })
                            :
                            <span>
                                You don't have any collaborators left to remove
                            </span>
                        }
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            onClick={(e) => this.removeCollaborators(e)}
                            positive
                            style={styles.doneButton}
                            content="Done" />
                    </Modal.Actions>
                </Modal>
                <AvatarEditor
                    onFile={(file) => this.onEditedFile(file)}
                    onClose={() => this.setState({ isCropping: false })}
                    file={this.state.file}
                    isOpen={this.state.isCropping} />
            </Segment>
        );
    }

    @autobind
    protected onEditedFile(file) {
        this.setState({ uploading: true, isCropping: false });
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            this.setState({ imagePreviewUrl: reader.result, error: null });
            const img = document.createElement("img");
            this.props.getUploadPolicy(file).then(async (policyData) => {
                const { uploadUrl, publicFileUrl } = policyData;
                await this.props.uploadFile(file, uploadUrl);
                // tslint:disable-next-line:prefer-object-spread
                const fields = Object.assign({}, this.state.fields, { imageUrl: publicFileUrl });
                this.setState({ fields, uploading: false });
            }).catch((err: Error) => {
                alert(err.message);
                this.setState({ uploading: false });
            });
            img.src = reader.result;
        };
    }

    @autobind
    protected addRemovable(user) {
        const removedCollaborators = this.state.removedCollaborators;
        removedCollaborators.push(user._id);
        this.setState({ removedCollaborators });
    }

    @autobind
    protected toggleAddCollab(e) {
        e.preventDefault();
        this.setState({ addCollaboratorModal: !this.state.addCollaboratorModal });
    }

    @autobind
    protected toggleRemoveCollab(e) {
        e.preventDefault(e);
        if (!this.state.removeCollaboratorModal) {
            this.getCollaborators();
        }
        this.setState({
            removeCollaboratorModal: !this.state.removeCollaboratorModal,
            removedCollaborators: [],
        });
    }

    @autobind
    protected async getCollaborators() {
        try {
            const response = await axios.post("/get-collaborators");
            this.setState({ collaborators: response.data.collaborators });
        } catch (e) {
            this.setState({
                removeCollaboratorModal: false,
                inviteError: "Could not load collaborators, please try again later",
            });
        }
    }

    @autobind
    protected onInvEmailChange(content) {
        this.setState({ invitationEmail: content.value });
    }

    @autobind
    protected sendInvite(e) {
        e.preventDefault(e);

        const isValidEmail = validateEmail(this.state.invitationEmail);

        if (isValidEmail) {
            this.toggleAddCollab(e);
            this.props.onSendInvite(this.state.invitationEmail);
        } else {
            this.setState({ inviteError: "Invalid Email, please make sure you entered everything correctly" });
        }
    }

    @autobind
    protected removeCollaborators(e) {
        e.preventDefault();
        this.toggleRemoveCollab(e);
        if (this.state.removedCollaborators.length > 0) {
            this.props.onRemoveCollaborators(this.state.removedCollaborators);
        }
    }

    @autobind
    protected onFileUploadClick(e: MouseEvent) {
        const inputField: any = this.refs.podcastImgRef;
        inputField.click();
    }

    @autobind
    protected onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if (e.target && e.target.files && e.target.files.length) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState({ imagePreviewUrl: reader.result, error: null });
                const img = document.createElement("img");
                img.onload = () => {

                    // Check if width and height are between 1400X1400 and 3000X3000
                    if ((this as any).width < 1400 || (this as any).width > 3000 || (this as any).height < 1400 || (this as any).height > 3000) {
                        // We only check the width since we know that the width and height are equal
                        return this.setState({
                            uploading: false,
                            imagePreviewUrl: null,
                            error: "Invalid image dimensions, width and height must" +
                            " be between 1400 X 1400 and 3000 X 3000.",
                        });
                    }
                    this.setState({ isCropping: true, file });

                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
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

    @autobind
    protected onChangeInputField(e: React.ChangeEvent<HTMLInputElement>, input: any) {
        if (input && input.name) {
            // tslint:disable-next-line:prefer-object-spread
            const fields = Object.assign({}, this.state.fields, { [input.name]: input.value });
            this.setState({ fields });
        }
    }

    @autobind
    protected async onSubmit(e: any) {
        e.preventDefault();
        const fields = JSON.parse(JSON.stringify({...this.state.fields, socialNetStatusChange: this.state.socialNetStatusChange}));
        if (!fields.email) {
            const userEmail = _.get(this.props, "rootState.me.email", "");
            fields.email = userEmail;
        }
        await this.props.onSubmit(fields, true);

    }

    private getCategories(): Array<{ key: string, text: string, value: string }> {
        const result: Array<{
            key: string,
            text: string,
            value: string,
        }> = [];
        Object.keys(allowedItunesCategories).forEach(category => {
            result.push({
                key: category,
                text: category,
                value: category,
            });
            allowedItunesCategories[category].forEach(subCategory => {
                result.push({
                    key: `${category} - ${subCategory}`,
                    text: `${category} - ${subCategory}`,
                    value: `${category} - ${subCategory}`,
                });
            });
        });
        return result;
    }
}

const styles = {
    buttonStyle: {
        marginTop: "1em",
        fontWeight: 550,
        fontSize: "120%",
        color: "black",
    },
    formLabel: {
        display: "flex",
        minWidth: 80,
        textAlign: "left",
        fontSize: "120%" as "120%",
        color: colors.mainDark,
        fontWeight: 600,
        marginBottom: 15,
        marginTop: 40,
    } as React.CSSProperties,
    formInput: {
        minWidth: "75%",
        color: colors.mainLight,
    },
    hidenInput: {
        display: "none",
        visibility: "hidden",
    },
    imagePreview: {
        width: 150,
        height: 150,
        backgroundColor: "#ffffff",
        cursor: "pointer",
        padding: "5px",
        border: "solid",
        borderColor: "#f1efef",
        borderWidth: "1px",
    },
    uploadIcon: { margin: 10 },
    actionIcon: {
        fontSize: "160%",
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 5,
        alignSelf: "flex-end",
    },
    tooltip: {
        ...globalStyles.tooltip,
        margin: 0,
        marginBottom: -10,
        marginLeft: 15,
    },
    header: {
        color: colors.mainDark,
        display: "flex",
        flexDirection: "row",
    },
    categoryErrorContainer: {
        backgroundColor: "#E7C2CB",
        color: "#E37A8C",
        padding: 5,
        paddingLeft: 15,
        paddingRight: 60,
        marginLeft: 15,
        marginTop: -4,
        display: "flex",
        flexDirection: "row" as "row",
        fontSize: "80%",
        position: "relative" as "relative",
        borderRadius: 3,
        borderColor: "lightgray",
        borderWidth: 1,
        borderStyle: "solid",
    },
    modalCloseButton: {
        position: "absolute",
        top: 12.5,
        right: 5,
        color: colors.mainDark,
    },
    doneButton: {
        backgroundColor: colors.mainDark,
    },
    removeIcon: {
        color: "gray",
        cursor: "pointer",
    },
};
