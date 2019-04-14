import * as moment from "moment";
import * as React from "react";
import * as DayPicker from "react-day-picker";
import { Link } from "react-router-dom";
import { Button, Container, Form, Header, Icon, Input, Popup, Progress, Segment } from "semantic-ui-react";
import { IEpisode } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";

interface IEpisodeProps {
    error?: string;
    onError?: (message: string) => void;
    item: IEpisode;
    progress?: number;
    uploadError?: string;
    editItemHandler: (params: { episodeId: string }) => Promise<void>;
    deleteItemHandler: (item: IEpisode) => void;
    publishItemHandler: (item: IEpisode) => void;
    unpublishItemHandler: (item: IEpisode) => void;
}

interface IEpisodeState {
    error?: string;
}

const onEpisodeEdit = (props: IEpisodeProps) => async (e: React.MouseEvent<HTMLButtonElement>) => {
    await props.editItemHandler({ episodeId: props.item._id });
    window.location.href = `/#/episode/${props.item._id}`;
};

const onEpisodeOpen = async (props: IEpisodeProps) => {
    await props.editItemHandler({ episodeId: props.item._id });
    window.location.href = `/#/episode/${props.item._id}`;
};

const onEpisodeDelete = (props: IEpisodeProps) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const verified = confirm("Are you sure you want to delete this episode?");
    if (verified) {
        props.deleteItemHandler(props.item);
    }
    e.preventDefault();
};

const onPublishItem = (props: IEpisodeProps) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const item = props.item;
    let error = "";
    if (!item.audioUrl) {
        error += "Audio";
    }
    if (!item.title) {
        error += (error ? ", " : "") + "Title";
    }
    if (!item.summary) {
        error += (error ? ", " : "") + "Summary";
    }
    if (!item.fullContent) {
        error += (error ? ", " : "") + "Full Content";
    }
    if (error) {
        props.onError("Please fill out all of the missing details before publishing: " + error);
    } else {
        props.publishItemHandler(props.item);
    }
    e.preventDefault();
};

const onSchedulePublish = (props: IEpisodeProps) => (e: React.MouseEvent<HTMLButtonElement>) => {
    // Scheduled publish action [TO-DO]
    e.preventDefault();
};

const onUnpublishItem = (props: IEpisodeProps) => (e: React.MouseEvent<HTMLButtonElement>) => {
    props.unpublishItemHandler(props.item);
    e.preventDefault();
};

interface IScheduleButtonProps {
    currentEpisode?: IEpisode;
    publishItemHandler: (item: IEpisode) => void;
}

export interface IScheduleButtonState {
    pickingDate?: boolean;
    time_of_day?: string;
    scheduledDate?: Date;
    scheduledHours?: string;
    scheduledMinutes?: string;
}

class ScheduleButton extends React.Component<IScheduleButtonProps, IScheduleButtonState> {

    public state: IScheduleButtonState = {
        pickingDate: false,
        time_of_day: "AM",
        scheduledHours: "00",
        scheduledMinutes: "00",
        scheduledDate: new Date(),
    };

    public render() {
        return (
            <Popup
                trigger={
                    <div style={{ width: 40, marginLeft: 50 }}>
                        <Popup
                            trigger={
                                <Form.Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({ pickingDate: true });
                                    }}
                                    style={{ ...style.publishButton, fontSize: "120%", width: 40 }}
                                >
                                    <Icon size="large" name="calendar" />
                                </Form.Button>}
                            style={style.tooltip}
                            basic
                            size="tiny"
                            content="Schedule" />
                    </div>}
                style={style.calendarTooltip}
                on="click"
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
                                        ...this.props.currentEpisode,
                                        published: true,
                                        publishedAt: schedule,
                                    };
                                    if (item.audioUrl) {
                                        item.published = true;
                                        this.props.publishItemHandler(item);
                                    }
                                }}
                                size="small"
                                floated="right"
                                positive>Schedule</Button>
                        </Segment>
                    </div>
                } />
        );
    }

    protected switchTimeOfDay(new_time) {
        this.setState({
            time_of_day: new_time,
        });
    }

}
const renderPublishButton = (props: IEpisodeProps) => {
    if (props.item.published) {
        return (
            <span>
                <Popup
                    style={{
                        ...globalStyles.tooltip,
                        margin: 0,
                        marginBottom: 5,
                        marginLeft: 15,
                    }}
                    basic
                    size="tiny"
                    trigger={
                        <Button
                            floated="left"
                            style={style.publishButton}
                            onClick={onUnpublishItem(props)}
                        >
                            <Icon name="delete calendar" style={style.publishIcon} />
                        </Button>}
                    content="Unpublish"
                />
                <div style={{ marginLeft: 0 }}>
                    {(new Date(props.item.publishedAt)).getTime() <= (new Date()).getTime() ?
                        "Published on "
                        :
                        "Scheduled for "
                    }
                    {moment(props.item.publishedAt).format("l")}
                    {(new Date(props.item.publishedAt)).getTime() <= (new Date()).getTime() ?
                        ""
                        :
                        " " + moment(props.item.publishedAt).format("LT")
                    }
                </div>
            </span>
        );
    }
    return (
        <span>
            <Popup
                style={{
                    ...globalStyles.tooltip,
                    margin: 0,
                    marginBottom: 0,
                    marginLeft: 15,
                }}
                basic
                size="tiny"
                trigger={
                    <Button
                        floated="left"
                        style={style.publishButton}
                        onClick={onPublishItem(props)}
                    >
                        <Icon size="large" name="external share" style={style.publishIcon} />
                    </Button>}
                content="Publish"
            />
            <div>
                <ScheduleButton
                    currentEpisode={props.item}
                    publishItemHandler={props.publishItemHandler} />
            </div>
        </span>
    );
};

const renderUploadProgressBar = (props: IEpisodeProps) => {
    const uploadProgress: number = props.progress;
    const uploadError: string = props.uploadError;
    if ((!uploadProgress || uploadProgress === 100) && !uploadError) { return null; }
    return (
        <div style={{
            color: uploadError ? colors.negative : colors.positive,
            display: "flex",
            flexDirection: "row",
            fontSize: "80%",
            justifyContent: "center",
        }}>
            Uploading audio
                <Progress
                error={!!uploadError}
                color="green"
                percent={uploadProgress}
                style={style.uploadProgress}
                size="small" />
            {!!uploadError ?
                uploadError
                :
                (uploadProgress + "%")
            }
        </div>
    );
};

const renderError = (props: IEpisodeProps) => {
    return (props.error ?
        (
            <div style={style.errorMessage}>
                {props.error}
            </div>
        )
        :
        null);
};

function EpisodeCard(props: IEpisodeProps) {

    return (
        <Segment style={style.card}>
            <Header style={style.header} >
                {renderError(props)}
                {renderUploadProgressBar(props)}
                <Popup
                    style={{
                        ...globalStyles.tooltip,
                        margin: 0,
                        marginBottom: 0,
                        marginLeft: 20,
                    }}
                    basic
                    size="tiny"
                    trigger={
                        <Button floated="right" style={style.editIcon} onClick={onEpisodeEdit(props)}>
                            <Icon link name="edit" />
                        </Button>}
                    content="Edit"
                />
            </Header>
            <Segment basic style={style.content}>
                <a
                    onClick={(e) => onEpisodeOpen(props)}
                    style={style.title}>
                    {props.item.title}
                </a>
                {props.item.published ?
                    <Header style={style.downloadsCount} floated="right" as="h4">
                        {props.item.downloadsCount || 0} downloads
                    </Header>
                    :
                    null
                }
            </Segment>
            <div style={style.footer}>
                <span style={style.footerDate}>
                    {renderPublishButton(props)}
                </span>
                <span>
                    <Popup
                        style={{
                            ...globalStyles.tooltip,
                            margin: 0,
                            marginBottom: 0,
                            marginLeft: 10,
                        }}
                        basic
                        size="tiny"
                        trigger={
                            <Button style={style.trashIcon} floated="right" onClick={onEpisodeDelete(props)}>
                                <Icon link name="trash outline" />
                            </Button>}
                        content="Delete"
                    />
                </span>
            </div>
        </Segment>
    );
}

// tslint:disable-next-line:max-classes-per-file
export default class Episode extends React.Component<IEpisodeProps, {}> {

    public state = {
        error: "",
    };

    public onError(message: string) {
        this.setState({ error: message });
    }

    public render() {
        return (
            <div>
                {EpisodeCard({ ...this.props, ...this.state, onError: (message) => this.onError(message) })}
            </div>
        );
    }

}

const style = {
    card: {
        marginBottom: 15,
    },
    footer: {
        display: "flex",
    },
    footerDate: {
        color: "gray",
        flex: 1,
    },
    publishButton: {
        margin: 0,
        padding: 0,
        paddingLeft: 5,
        backgroundColor: "transparent",
    },
    uploadProgress: {
        width: "20%",
        marginRight: 15,
        marginLeft: 15,
        marginTop: 6,
    },
    header: {
        paddingBottom: 15,
        flex: 1,
        flexDirection: "row",
        flexWrap: "nowrap",
    },
    editIcon: {
        backgroundColor: "transparent",
        padding: 0,
        paddingLeft: 10,
        marginRight: -10,
        fontSize: "160%",
    },
    trashIcon: {
        backgroundColor: "transparent",
        padding: 0,
        paddingLeft: 10,
        marginRight: -10,
        marginTop: 0,
        fontSize: "200%",
    },
    content: {
        paddingLeft: 0,
        paddingRight: 0,
        border: 0,
        fontSize: "120%",
        overflow: "hidden",
        display: "flex",
    },
    title: {
        cursor: "pointer",
        textAlign: "left",
        ...globalStyles.text,
        whiteSpace: "nowrap",
        overflow: "hidden" as "hidden",
        textOverflow: "ellipsis",
    },
    downloadsCount: {
        color: colors.mainVibrant,
        fontWeight: "700",
        minWidth: 100,
        textAlign: "right",
        justifyContent: "flex-end",
        flex: 1,
    },
    publishIcon: {
        fontSize: "200%",
    },
    calendarIcon: {
        fontSize: "180%",
        marginLeft: 0,
        margin: 0,
        padding: 0,
        paddingLeft: 5,
        backgroundColor: "transparent",
    },
    errorMessage: {
        color: colors.negative,
        fontSize: "80%",
        fontWeight: 700 as 700,
        textAlign: "center",
    },
    tooltip: {
        ...globalStyles.tooltip,
        margin: 0,
        marginBottom: -10,
        marginLeft: 15,
    },
    calendarTooltip: {
    },
};
