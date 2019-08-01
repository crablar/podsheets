import { autobind } from "core-decorators";

import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as React from "react";
import * as DayPicker from "react-day-picker";
import * as ReactQuill from "react-quill/src/";
import { Quill } from "react-quill/src/";

import * as Modal from "boron/FadeModal";
import * as lamejs from "lamejs";
import * as ImageResize from "quill-image-resize-module";
import { Button, Form, Header, Icon, Input, Menu, Popup, Progress, Segment, TextArea } from "semantic-ui-react";
import { storage } from "../../../lib/constants";
import { IEpisode, IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import AudioEditor from "../generic/AudioEditor";
import EpisodeImageUpload from "../generic/EpisodeImageUpload";
import AdForm from "./AdForm";

import "react-day-picker/lib/style.css";

const summaryPlaceholder =
    `This is what appears on iTunes for the episode. Keep this short and interesting so that people click to listen.`;

const showNotesPlaceholder = 
    `Add a full description of your episode for the podcast website. Include images or videos.`

const fullContentPlaceholder =
    `Add information about the episode, show notes, additional links.
This appears in the show website.`;

interface IEpisodeFormProps {
    rootState: RootState;
    onSubmit: (formState: IEpisodeFields) => void;
    onPreview: (formState: IEpisodeFields) => void;
    currentEpisode?: IEpisode;
    getUploadPolicy?: (file: File) => Promise<{ uploadUrl: string, publicFileUrl: string }>;
    uploadFile?: (file: File, policyUrl: string, publicFileUrl?: string) => Promise<void>;
    currentPodcast?: IPodcast;
    publishItemHandler: (item: IEpisode) => void;
    unpublishItemHandler: (item: IEpisode) => void;
    uploadProgress?: any;
    error?: string;
}

export interface IEpisodeFields {
    title: string;
    summary: string;
    fullContent: string;
    audioUrl: string;
    uploadUrl?: string;
    audioDuration?: number;
    publishedAt?: Date;
    published?: boolean;
    adPlacement?: object;
}

export interface IEpisodeFormState {
    fields: IEpisodeFields;
    uploading: boolean;
    uploadProgress: number;
    publicFileUrl?: string;
    pickingDate?: boolean;
    previewDevice: string;
    local_url?: string;
    local_mime?: string;
    time_of_day?: string;
    scheduledDate?: Date;
    scheduledHours?: string;
    scheduledMinutes?: string;
    editingAudio: boolean;
    renderedFile?: any;
    isUploadingImage: boolean;
    section: string;
}

@inject("rootState")
@observer
export default class EpisodeForm extends React.Component<IEpisodeFormProps, IEpisodeFormState> {
    public state: IEpisodeFormState = {
        uploading: false,
        uploadProgress: 0,
        fields: {
            title: "",
            summary: "",
            fullContent: "",
            audioUrl: "",
            uploadUrl: "",
        },
        pickingDate: false,
        previewDevice: "desktop",
        time_of_day: "AM",
        scheduledDate: new Date(),
        scheduledHours: "00",
        scheduledMinutes: "00",
        editingAudio: false,
        isUploadingImage: false,
        section: "Episode",
    };

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
                    this.setState({ isUploadingImage: true });
                },
            },
            modules: {
                ImageResize: {},
            },
        },
    };

    public adPlacement = null;

    public quill = null;

    public formats = [
        "header",
        "bold", "italic", "underline", "strike", "blockquote",
        "list", "bullet", "indent",
        "link", "image",
    ];

    public fileInput: any = null;

    constructor(props: IEpisodeFormProps) {
        super(props);
        if (props.currentEpisode) {
            // tslint:disable-next-line:max-line-length
            const { title, summary, fullContent, audioUrl, uploadUrl, audioDuration, publishedAt, published } = props.currentEpisode;
            this.state = {
                uploading: false,
                uploadProgress: 0,
                fields: {
                    title, summary, fullContent, audioUrl, uploadUrl, audioDuration, publishedAt, published,
                },
                previewDevice: "desktop",
                time_of_day: "AM",
                scheduledDate: new Date(),
                scheduledHours: "00",
                scheduledMinutes: "00",
                editingAudio: false,
                isUploadingImage: false,
                section: "Episode",
            };
        }
    }

    public componentDidMount() {
        if (!this.props.currentEpisode) {
            return;
        }
        const { title, summary, fullContent, audioUrl, uploadUrl, audioDuration, publishedAt, published } = this.props.currentEpisode;

        this.setState({
            uploading: false,
            uploadProgress: 0,
            fields: {
                title, summary, fullContent, audioUrl, uploadUrl, audioDuration, publishedAt, published,
            },
            previewDevice: "desktop",
            time_of_day: "AM",
            scheduledDate: new Date(),
            scheduledHours: "00",
            scheduledMinutes: "00",
            editingAudio: false,
            isUploadingImage: false,
            section: "Episode",
        });
    }

    public render() {
        const storageLimit = _.get(this.props, "currentPodcast.subscription.storageLimit", storage.free);
        const usedStorage = _.get(this.props, "currentPodcast.usedStorage", 0).toFixed(2);
        const uploadDisabled = Number(usedStorage) >= storageLimit;
        const uploadError = this.uploadError();
        const audioUrl = this.state.fields.audioUrl || "";
        const uploadUrl = this.state.fields.uploadUrl || "";
        const splitAudioUrl = audioUrl.split("/");
        const splitUploadUrl = uploadUrl.split("/");
        const { title, summary, fullContent} = this.state.fields;
        const shouldDisablePublish = false; // !(title && summary && (audioUrl || uploadUrl));
        let fileName = "";
        if (audioUrl || uploadUrl) {
            fileName = splitAudioUrl[splitAudioUrl.length - 1] || splitUploadUrl[splitUploadUrl.length - 1];
        }
        return (
            <Segment style={{ paddingBottom: 25 }} basic>
                <Form onSubmit={this.onSubmit} enctype="multipart/form-data">
                    {this.props.rootState.env.AUDIO_EDITOR === "true" ?
                        <Menu style={{ width: "75%" }} tabular>
                            <Menu.Item
                                name="Episode"
                                active={!this.state.editingAudio}
                                onClick={(e, { name }) => this.handleItemClick(e, name)} />
                            <Menu.Item
                                name="Audio Editor"
                                active={this.state.editingAudio}
                                onClick={(e, { name }) => this.handleItemClick(e, name)} />
                        </Menu>
                        :
                        null
                    }
                    {this.props.rootState.podcast.advertisingEnabled ?
                        <Menu style={{ width: "75%" }} tabular>
                            <Menu.Item
                                name="Episode"
                                active={this.state.section === "Episode"}
                                onClick={(e, { section }) => this.setState({ section: "Episode" })} />
                            <Menu.Item
                                name="Ad Placements"
                                active={this.state.section === "Ad Placements"}
                                onClick={(e, { section }) => this.setState({ section: "Ad Placements" })} />
                        </Menu>
                        :
                        null
                    }
                    <div style={{
                        width: "100%",
                        display: !this.state.editingAudio ? "none" : "flex",
                        flex: 1,
                        justifyContent: "flex-start",
                    }}>
                        {/*<AudioEditor
                            onAudio={(file) => this.setState({ renderedFile: file })} />*/}
                    </div>
                    <div style={{
                        width: "100%",
                        display: this.state.section === "Ad Placements" ? "flex" : "none",
                        flex: 1,
                        justifyContent: "flex-start",
                    }}>
                        {/*<AdForm
                            adPlacement={this.props.currentEpisode.adPlacement} onChange={(adPlacement) => {
                            const fields = this.state.fields;
                            this.adPlacement = adPlacement;
                        }} episodeState={this.state} />*/}
                    </div>
                    <div style={{
                        display: this.state.section === "Episode" ? "block" : "none",
                    }}>
                        <div style={style.formLabel}>Title</div>
                        <Form.Group>
                            <Form.Input
                                placeholder="New Episode Title"
                                width="12"
                                name="title"
                                style={style.titleInput}
                                value={this.state.fields.title}
                                onChange={this.onChangeInputField}
                                required />
                        </Form.Group>
                        {!!uploadError ?
                            <div style={{ color: "tomato" }}>
                                {uploadError}
                            </div>
                            :
                            null
                        }
                        <div style={{ marginTop: 50 }}>
                        <div style={style.formLabel}>Audio File</div>
                        <Segment style={style.uploadSegment} disabled={this.state.uploading} basic>
                            <div style={{
                                display: "flex",
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 15,
                            }}>
                                <Form.Field style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "75%",
                                    alignItems: "center",
                                }} inline>
                                    <input disabled={uploadDisabled} id={"episodeFormFileInput"} onChange={this.onFileInput} type="file" />
                                </Form.Field>
                                {this.state.renderedFile ?
                                    <Button
                                        onClick={(e) => this.onUploadFromEditor(e)}
                                        style={{
                                            marginLeft: -165,
                                            backgroundColor: colors.mainDark,
                                            color: "white",
                                        }}>Upload From Editor</Button>
                                    :
                                    null}
                            </div>
                            {this.renderUploadProgressBar()}
                            {this.state.fields.audioUrl || uploadUrl ?
                                <div>
                                    <Icon name="attach" size="big" />
                                    <strong>{fileName}</strong>
                                </div>
                                :
                                null
                            }
                            <Form.Input
                                style={{ display: "none" }}
                                width="12"
                                name="audioUrl"
                                placeholder="Audio URL Generated from Google Cloud Storage"
                                value={this.state.fields.audioUrl}
                                readOnly
                                disabled={this.state.uploading} />
                        </Segment>
                        </div>
                        <div style={{ marginTop: 50 }} className="formBoxInput">
                        <div style={style.formLabel}>Description</div> 
                            <Form.Field
                                style={{ height: 120 }}
                                control={TextArea}
                                width="12"
                                name="summary"
                                placeholder={summaryPlaceholder}
                                value={this.state.fields.summary}
                                onChange={this.onChangeInputField} />
                            <div style={{ width: "75%", marginTop: 50 }}>
                            <div style={style.formLabel}>Show Notes</div>
                                <div style={{ height: 320 }}>
                                    <ReactQuill
                                        ref={(component) => {
                                            if (component) {
                                                this.quill = component.getEditor();
                                            }
                                        }}
                                        style={{ height: 250 }}
                                        theme="snow"
                                        modules={this.modules}
                                        placeholder={showNotesPlaceholder}
                                        formats={this.formats}
                                        value={this.state.fields.fullContent}
                                        onChange={this.onChangeContentField} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Form.Group style={{ width: "75%" }}>
                        <div style={{
                            display: "flex",
                            flex: 1,
                            justifyContent: "flex-start" as "flex-start",
                        }}>
                            <Popup
                                trigger={
                                    <Button
                                            style={{ marginTop: "1em", fontWeight: 550, fontSize: "120%", color: "#787878", backgroundColor: "white", border: "solid 0.1em #E6E6E6"}}>
                                            Save
                                    </Button>}
                                style={style.tooltip}
                                basic
                                size="tiny"
                                content="Save changes to your podcast episode" />
                            {this.renderPublishButton()}
                            {!(this.props.currentEpisode && this.props.currentEpisode.published) && <Popup
                                trigger={
                                    <span>
                                        <Button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                this.setState({ pickingDate: true });
                                            }}
                                            style={{ marginTop: "1em", fontWeight: 550, fontSize: "120%", color: "#5FC67A", backgroundColor: "white", border: "solid 0.1em #5FC67A"}}>
                                            Schedule
                                        </Button>
                                    </span>}
                                style={style.calendarTooltip}
                                on="click"
                                position="bottom center"
                                size="tiny"
                                open={this.state.pickingDate}
                                onClose={() => this.setState({ pickingDate: false })}
                                onOpen={() => this.setState({ pickingDate: true })}
                                content={
                                    <div>
                                        <Header textAlign="center" as="h3">
                                            Schedule Publish
                                        </Header>
                                        <DayPicker
                                            initialMonth={this.state.scheduledDate}
                                            selectedDays={this.state.scheduledDate}
                                            onDayClick={(e: Date) => {
                                                this.setState({ scheduledDate: e });
                                            }} />
                                        <Segment style={{
                                            paddingBottom: 0,
                                            paddingTop: 0,
                                        }} basic>
                                            <Input
                                                value={this.state.scheduledHours}
                                                onChange={(e, input) => {
                                                    let val = input.value;
                                                    if (Number(val) > 12) {
                                                        val = "12";
                                                    }
                                                    if (Number(val) < 0) {
                                                        val = "00";
                                                    }
                                                    this.setState({ scheduledHours: val });
                                                }}
                                                style={{ width: 47, padding: 0 }}
                                                type={"number"}
                                                placeholder="00" />
                                            <span style={{ marginLeft: 5, marginRight: 5 }}>:</span>
                                            <Input
                                                value={this.state.scheduledMinutes}
                                                // tslint:disable-next-line:max-line-length
                                                onChange={(e, input) => {
                                                    let val = input.value;
                                                    if (Number(val) > 60) {
                                                        val = "60";
                                                    }
                                                    if (Number(val) < 0) {
                                                        val = "00";
                                                    }
                                                    this.setState({ scheduledMinutes: val });
                                                }}
                                                type={"number"}
                                                style={{ width: 47, padding: 0 }} placeholder="00" />
                                            <Button.Group floated="right" style={{ marginLeft: 5 }}>
                                                <Button style={{
                                                    padding: 10.5,
                                                    paddingLeft: 10,
                                                    paddingRight: 10,
                                                    // tslint:disable-next-line:max-line-length
                                                    backgroundColor: this.state.time_of_day === "AM" ? "lightgray" : "#EEE",
                                                }}
                                                    onClick={() => this.switchTimeOfDay("AM")}>AM</Button>
                                                <Button style={{
                                                    padding: 10.5,
                                                    paddingLeft: 10,
                                                    paddingRight: 10,
                                                    // tslint:disable-next-line:max-line-length
                                                    backgroundColor: this.state.time_of_day === "PM" ? "lightgray" : "#EEE",
                                                }}
                                                    onClick={() => this.switchTimeOfDay("PM")}>PM</Button>
                                            </Button.Group>
                                        </Segment>
                                        <Segment basic>
                                            <Button
                                                onClick={() => this.setState({ pickingDate: false })}
                                                basic
                                                size="small"
                                                floated="left"
                                                negative>Cancel</Button>
                                            <Button
                                                onClick={(e) => {
                                                    const schedule = this.state.scheduledDate;
                                                    let hours = this.state.scheduledHours;
                                                    const minutes = this.state.scheduledMinutes;
                                                    if (this.state.time_of_day === "PM") {
                                                        hours = String(Number(hours) + 12);
                                                    }
                                                    schedule.setHours(Number(hours));
                                                    schedule.setMinutes(Number(minutes));
                                                    schedule.setSeconds(0);
                                                    schedule.setMilliseconds(0);
                                                    const item = {
                                                        ...this.state.fields,
                                                        publishedAt: schedule,
                                                    };
                                                    this.setState({ fields: item });
                                                    if (this.state.uploading && item.audioUrl) {
                                                        const url = item.audioUrl;
                                                        item.audioUrl = "";
                                                        item.uploadUrl = url;
                                                    }
                                                    this.props.publishItemHandler(item);
                                                }}
                                                size="small"
                                                floated="right"
                                                positive>Schedule</Button>
                                        </Segment>
                                    </div>
                                } />}
                                <Popup
                                trigger={
                                    <Button
                                        onClick={this.onPreview(this.state.fields)}
                                        style={{ marginTop: "1em", fontWeight: 550, fontSize: "120%", color: "#6B7BE1", backgroundColor: "white", border: "solid 0.1em #6B7BE1"}}>
                                        Preview
                                    </Button>}
                                style={style.tooltip}
                                basic
                                size="tiny"
                                content="Preview the episode on your website" />
                        </div>
                    </Form.Group>
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
                            src={`/p/${this.props.currentPodcast.slug}/preview/`}>
                        </iframe>
                    </div>
                </Modal>
                <EpisodeImageUpload
                    onImage={(url) => this.onImagePick(url)}
                    onClose={() => this.setState({ isUploadingImage: !this.state.isUploadingImage })}
                    episode={this.props.currentEpisode}
                    podcast={this.props.currentPodcast}
                    isOpen={this.state.isUploadingImage} />
            </Segment>
        );
    }

    protected onImagePick(url: string) {
        const range = this.quill.getSelection() || { index: 0 };
        const value = url;
        if (value) {
            this.quill.insertEmbed(range.index, "image", value, ReactQuill.Quill.sources.USER);
            this.setState({ isUploadingImage: false });
        }
    }

    protected onUploadFromEditor(e) {
        e.preventDefault();
        const ev = e;
        const file = this.state.renderedFile;
        file.filename = file.name;
        ev.target.files = [file];

        this.onFileInput(ev);
    }

    protected handleItemClick(e, name) {
        this.setState({ editingAudio: name !== "Episode" });
    }

    protected switchTimeOfDay(new_time) {
        this.setState({
            time_of_day: new_time,
        });
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
    protected onAdvancedEditor(e) {
        e.preventDefault();
    }

    @autobind
    protected uploadProgress() {
        const publicFileUrl = this.state.publicFileUrl ?
            this.state.publicFileUrl
            :
            _.get(this.props, "currentEpisode.uploadUrl", "");
        const currentProgress = _.find(this.props.uploadProgress, { publicFileUrl });
        const progressEvent = _.get(currentProgress, "progress", {
            loaded: false,
            total: 0,
        });
        if (publicFileUrl && progressEvent && progressEvent.loaded && progressEvent.total) {
            const uploadProgress = Math.ceil((+progressEvent.loaded / progressEvent.total) * 100);
            if (this.state.uploading && (uploadProgress === 0 || uploadProgress === 100)) {
                this.setState({ uploading: false });
            } else if (!this.state.uploading && (uploadProgress > 0 && uploadProgress < 100)) {
                this.setState({ uploading: true });
            }
            return uploadProgress;
        } else {
            if (this.state.uploading) {
                this.setState({ uploading: false });
            }
            return 0;
        }
    }

    @autobind
    protected uploadError() {
        const publicFileUrl = this.state.publicFileUrl ?
            this.state.publicFileUrl
            :
            _.get(this.props, "currentEpisode.uploadUrl", "");
        const currentProgress = _.find(this.props.uploadProgress, { publicFileUrl });
        const uploadError = _.get(currentProgress, "error", "");
        const fileInput = document.getElementById("episodeFormFileInput");
        if (!!uploadError && this.fileInput && this.fileInput.value) {
            this.fileInput.value = "";
        }
        if (!!uploadError && this.state.uploading) {
            this.setState({ uploading: false });
        }
        return uploadError;
    }

    @autobind
    protected renderUploadProgressBar() {
        const uploadProgress = this.uploadProgress();
        if (uploadProgress === 0 || uploadProgress === 100) { return null; }
        return (
            <Form.Field width="12">
                <Progress percent={uploadProgress} style={style.uploadProgress} size="tiny">
                    {uploadProgress}%
                </Progress>
            </Form.Field>
        );
    }

    @autobind
    protected renderPublishButton() {
        const episode = this.props.currentEpisode;
        if (episode && episode.published) {
            return (
                <Button
                    onClick={this.onUnpublishItem(this.state.fields)}
                    style={{ marginTop: "1em", fontWeight: 550, fontSize: "120%", color: "#C95959", backgroundColor: "white", border: "solid 0.1em #C95959"}}>
                    Unpublish
                </Button>
            );
        }
        const { title, summary, fullContent, audioUrl, uploadUrl } = this.state.fields;
        const shouldDisablePublish = false; // !(title && summary && (audioUrl || uploadUrl));
        return (
                <Button
                    style={{ marginTop: "1em", fontWeight: 550, fontSize: "120%", color: "white", backgroundColor: "#6B7BE1"}}
                    onClick={this.onPublishItem(this.state.fields)}
                    disabled={shouldDisablePublish}>
                    Publish
                </Button>
        );
    }

    @autobind
    protected onPublishItem(item: IEpisode) {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            if (this.state.uploading && item.audioUrl) {
                const uploadUrl = item.audioUrl;
                item.audioUrl = "";
                item.uploadUrl = uploadUrl;
            }
            item.publishedAt = new Date();
            this.props.publishItemHandler(item);
            e.preventDefault();
        };
    }

    @autobind
    protected onPreview(item: IEpisodeFields) {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            this.props.onPreview(item);
            this.showPreview();
            e.preventDefault();
        };
    }

    @autobind
    protected onUnpublishItem(item: IEpisode) {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            if (this.state.fields.published) {
                this.setState({
                    fields: {
                        ...this.state.fields,
                        published: false,
                    },
                });
            }
            this.props.unpublishItemHandler(item);
            e.preventDefault();
        };
    }

    @autobind
    protected async onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        this.fileInput = e.target;
        if (e.target && e.target.files && e.target.files.length) {
            const file = e.target.files[0];
            const duration = await this.getFileDuration(e);
            this.props.getUploadPolicy(file).then(async (policyData) => {
                const { uploadUrl, publicFileUrl } = policyData;
                this.setState({ publicFileUrl });
                this.props.uploadFile(file, uploadUrl, publicFileUrl);
                // tslint:disable-next-line:max-line-length
                // tslint:disable-next-line:prefer-object-spread
                const fields = Object.assign({}, this.state.fields, { audioUrl: publicFileUrl, audioDuration: duration });
                this.setState({ fields });
            }).catch((err: Error) => {
                alert(err.message);
            });
        }

    }

    protected getFileDuration(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files[0];
        const mime = file.type;
        const rd = new FileReader();
        const fileEl = document.querySelector("input");

        return new Promise((resolve, reject) => {
            try {
                // tslint:disable-next-line:no-shadowed-variable
                rd.onload = function (e) {
                    const blob = new Blob([(e.target as any).result], { type: mime });
                    const url = (URL).createObjectURL(blob);
                    const video = document.createElement("video");
                    video.preload = "metadata";
                    video.addEventListener("loadedmetadata", function () {
                        resolve(video.duration);
                    });
                    video.src = url;
                };
                rd.readAsArrayBuffer(file);
            } catch (err) {
                reject(1);
            }

        });

    }

    @autobind
    protected onChangeInputField(e: React.ChangeEvent<HTMLInputElement>, input: any) {
        if (input && input.name) {
            const fields = { ...this.state.fields, [input.name]: input.value };
            this.setState({ fields });
        }
    }

    @autobind
    protected onChangeContentField(content: any) {
        if (content) {
            const fields = { ...this.state.fields, fullContent: content };
            this.setState({ fields });
        }
    }

    @autobind
    protected onSubmit(e: React.FormEvent<Event>) {
        e.preventDefault();

        if (!Boolean(this.state.fields.audioUrl)) {
            alert("Could not save episode. Please upload an audio file.");
            return;
        }

        const fields = this.state.fields;
        fields.adPlacement = this.adPlacement;
        if (this.state.uploading && fields.audioUrl) {
            const uploadUrl = fields.audioUrl;
            fields.audioUrl = "";
            fields.uploadUrl = uploadUrl;
        }
        this.props.onSubmit(fields);
    }
}

const style = {
    uploadSegment: {
        padding: 0,
    },
    uploadProgress: {
        marginBottom: 35,
    },
    actionIcon: {
        fontSize: "160%",
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 0,
        alignSelf: "flex-end",
    },
    calendarIcon: {
        fontSize: "155%",
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 15,
        marginRight: 0,
        alignSelf: "flex-end" as "flex-end",
    },
    publishIcon: {
        marginTop: 2,
        fontSize: "160%",
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 0,
        marginRight: 20,
        alignSelf: "flex-end",
    },
    unpublishIcon: {
        marginTop: -3,
        fontSize: "155%",
        marginBottom: 3,
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 0,
        marginRight: 20,
        alignSelf: "flex-end",
    },
    previewIcon: {
        fontSize: "160%",
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 0,
        alignSelf: "flex-end",
        marginRight: 30,
    },
    tooltip: {
        ...globalStyles.tooltip,
        margin: 0,
        marginBottom: -10,
        marginLeft: 15,
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
    calendarTooltip: {
    },
    titleInput: {
        color: colors.mainDark,
        borderStyle: "none",
        height: 40,
    },
    fullContentLabel: {
        fontSize: "120%",
        fontWeight: 100 as 100,
        color: colors.mainLight,
        paddingBottom: 15,
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
