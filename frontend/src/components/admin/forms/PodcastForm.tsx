import axios from "axios";
import { autobind } from "core-decorators";
import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as React from "react";
import {
    Button, Divider, Dropdown, Form, Header, Icon, Image, Input, Message, Reveal, Segment,
} from "semantic-ui-react";
import { allowedItunesCategories } from "../../../lib/constants";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import AvatarEditor from "../generic/AvatarEditor";

interface IPodcastFormProps {
    onSubmit: (formState: IPodcastFields) => Promise<void>;
    getUploadPolicy: (file: File) => Promise<{ uploadUrl: string, publicFileUrl: string }>;
    uploadFile: (file: File, policyUrl: string) => Promise<void>;
    currentPodcast?: IPodcast;
    saveButtonTitle?: string;
    rootState?: RootState;
}

export interface IPodcastFields {
    title: string;
    subtitle: string;
    author: string;
    keywords: string;
    categories: string;
    imageUrl: string;
    email: string;
    _id?: any;
}

export interface IPodcastFormState {
    fields: IPodcastFields;
    uploading: boolean;
    imagePreviewUrl: string;
    error: string;
    categoryWarning: string;
    isCropping: boolean;
    file?: any;
}

@inject("rootState")
@observer
export default class PodcastForm extends React.Component<IPodcastFormProps, IPodcastFormState> {
    public state: IPodcastFormState = {
        uploading: false,
        imagePreviewUrl: null,
        error: null,
        fields: { title: "", subtitle: "", author: "", keywords: "", categories: "", imageUrl: "", email: "" },
        categoryWarning: null,
        isCropping: false,
    };

    constructor(props: IPodcastFormProps) {
        super();
        if (props.currentPodcast) {
            const userEmail = _.get(props, "rootState.me.email", "");
            const { title, subtitle, author, keywords, categories, imageUrl, email } = props.currentPodcast;
            this.state = {
                fields: { title, subtitle, author, keywords, categories, imageUrl, email: email || userEmail },
                uploading: false,
                imagePreviewUrl: null,
                error: null,
                categoryWarning: null,
                isCropping: false,
            };
        }
    }

    @autobind
    public render() {
        const userEmail = _.get(this.props, "rootState.me.email", "");
        return (
            <Segment>
                {this.renderError()}
                <Form onSubmit={this.onSubmit} loading={this.state.uploading}>
                    <Header as="h1" style={{ color: colors.mainDark }}>
                        Tell us about your podcast
                    </Header>
                    <p>
                        <div style={styles.imagePreview} >
                            <Reveal animated="fade" onClick={this.onFileUploadClick}>
                                <Reveal.Content visible>
                                    <Image
                                        src={
                                            // tslint:disable-next-line:max-line-length
                                            this.state.imagePreviewUrl || this.state.fields.imageUrl || "/assets/image.png"
                                        }
                                        size="small"
                                        centered
                                        spaced />
                                </Reveal.Content>
                                <Reveal.Content hidden>
                                    <Icon name="upload" size="massive" style={styles.uploadIcon} />
                                </Reveal.Content>
                            </Reveal>
                        </div>
                        <input
                            ref="podcastImgRef"
                            onChange={this.onFileInput}
                            type="file"
                            style={styles.hidenInput} />
                        <Header subheader as="h5" color="grey" centered>
                            Image must be between 1400 X 1400 and 3000 X 3000
                            </Header>
                    </p>
                    <div style={{
                        marginLeft: -80,
                    }}>
                        <Form.Field inline required>
                            <label style={styles.formLabel}>Title</label>
                            <Input
                                style={styles.formInput}
                                name="title"
                                value={this.state.fields.title}
                                onChange={this.onChangeInputField}
                                required />
                        </Form.Field>
                        <Form.Field inline required>
                            <label style={styles.formLabel}>Subtitle</label>
                            <Input
                                style={styles.formInput}
                                name="subtitle"
                                value={this.state.fields.subtitle}
                                onChange={this.onChangeInputField}
                                required />
                        </Form.Field>
                        <Form.Field inline required>
                            <label style={styles.formLabel}>Author</label>
                            <Input
                                style={styles.formInput}
                                name="author"
                                value={this.state.fields.author}
                                onChange={this.onChangeInputField}
                                required />
                        </Form.Field>
                        <Form.Field inline required>
                            <label style={styles.formLabel}>Email</label>
                            <Input
                                style={styles.formInput}
                                name="email"
                                value={this.state.fields.email || userEmail}
                                onChange={this.onChangeInputField}
                                required />
                        </Form.Field>
                        <Form.Field inline required>
                            <label style={styles.formLabel}>Keywords</label>
                            <Input
                                style={styles.formInput}
                                name="keywords"
                                value={this.state.fields.keywords}
                                onChange={this.onChangeInputField}
                                required />
                        </Form.Field>
                        <div style={{
                            display: "flex",
                            flex: 1,
                            justifyContent: "center",
                        }}>
                            {this.state.categoryWarning ?
                                <Message
                                    floating
                                    style={{ width: "50%", marginLeft: 90, marginBottom: 15 }}
                                    color="red">{this.state.categoryWarning}</Message>
                                :
                                null
                            }
                        </div>
                        <Form.Field inline required>
                            <label style={styles.formLabel}>Categories</label>
                            <Dropdown
                                value={this.state.fields.categories ? this.state.fields.categories.split(",").map(x => x.trim()) : null}
                                placeholder="Technology"
                                multiple
                                selection
                                upward
                                compact
                                inline
                                style={styles.dropdownInput}
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
                    </div>
                    <Form.Button
                        style={{ backgroundColor: colors.mainDark, color: "white", marginTop: 30 }}>
                        {this.props.saveButtonTitle || "Save"}
                    </Form.Button>
                </Form>
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
    protected async onSubmit(e: React.SyntheticEvent<Event>) {
        e.preventDefault();
        const fields = JSON.parse(JSON.stringify(this.state.fields));
        if (!fields.email) {
            const userEmail = _.get(this.props, "rootState.me.email", "");
            fields.email = userEmail;
        }
        await this.props.onSubmit(fields);
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
    formLabel: {
        display: "inline-block",
        width: 100,
        maxWidth: "50%",
        textAlign: "left",
        fontSize: "120%" as "120%",
        fontWeight: 300 as 300,
    },
    dropdownInput: {
        width: "50%",
    },
    formInput: {
        minWidth: "50%",
    },
    hidenInput: {
        display: "none",
        visibility: "hidden",
    },
    imagePreview: {
        width: 150,
        height: 150,
        backgroundColor: "#ECECEC",
        cursor: "pointer",
        margin: "auto",
    },
    uploadIcon: { margin: 10 },
};
