import axios from "axios";
import { autobind } from "core-decorators";
import * as EventEmitter from "event-emitter";
import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactQuill from "react-quill/src/";
import StripeCheckout from "react-stripe-checkout";
import ResizeObserver from "resize-observer-polyfill";
import { Button, Checkbox, Container, Dropdown, Form, Header, Icon, Input, Loader, Message, Modal, Popup, Radio, Segment } from "semantic-ui-react";
import { isNull } from "util";
import { storage } from "../../../lib/constants";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import * as WaveformPlaylist from "../../../lib/wave-form-playlist/app.js";
import { blobLoader } from "../../../lib/wave-form-playlist/track/loader/BlobLoader.js";
import { RootState } from "../../../state/RootState";
import "../generic/styles/AudioEditor.scss";
interface IAdFormProps {
    onSubmit?: () => Promise<void>;
    onChange?: () => void;
    episodeState: any;
}

export interface IAdFormState {
    error?: string;
    loading: boolean;
    playlist: any;
    maxTracks: boolean;
    tracks: number;
    loaded: boolean;
    placements: any;
    placementErrors: any;
    wavePlacements: any;
    zoomTick: number;
    visiblePlacement: boolean;
    activePlacement: any;
}

const placementOptions = [
    {
        text: "Preroll",
        value: "Preroll",
    },
    {
        text: "Midroll",
        value: "Midroll",
    },
    {
        text: "Postroll",
        value: "Postroll",
    },
];

// tslint:disable-next-line:max-line-length
@inject("rootState")
@observer
export default class AdForm extends React.Component<any, IAdFormState> {

    public ee: any = null;

    public cursor: any = null;
    public duration: number = 0;
    public timeWidth: any = null;

    public ro = new ResizeObserver((entries, o) => {
        for (const entry of entries) {
            const { left, top, width, height } = entry.contentRect;

            if (width !== 0) {
                this.timeWidth = width;
                this.forceUpdate();
            }
            // console.warn('Element:', entry.target);
            // console.warn(`Element's size: ${width}px x ${height}px`);
            // console.warn(`Element's paddings: ${top}px ; ${left}px`);
        }
    });

    constructor(props) {

        super(props);

        const wavePlacements = _.get(props, "adPlacement.manualPlacements", []);
        let placements = this.convertPlacements(_.get(props, "adPlacement.existingPlacements", []));
        if (placements.length === 0) {
            placements = [{
                type: "Preroll",
                start: "",
                end: "",
            }];
        }
        this.state = {
            loading: false,
            playlist: false,
            maxTracks: false,
            tracks: 0,
            loaded: true,
            placements,
            wavePlacements,
            placementErrors: {},
            zoomTick: 0,
            visiblePlacement: false,
            activePlacement: null,
        };
    }

    public convertPlacements(placements) {
        return _.map(placements, (placement) => {

            const startTime = (placement as any).start;
            const sMin = Math.floor((startTime / 60));
            const sSec = startTime % 60;
            const start = sMin + ":" + sSec;

            const endTime = (placement as any).end;
            const eMin = Math.floor((endTime / 60));
            const eSec = endTime % 60;
            const end = eMin + ":" + eSec;

            return {
                type: (placement as any).type,
                start,
                end,
            };
        });
    }

    public async componentDidMount() {
        const audioUrl = this.props.episodeState.fields.audioUrl ? this.props.episodeState.fields.audioUrl.replace("http://", "https://") : null;
        if (audioUrl) {
            this.initPlaylist(audioUrl);
        }
    }

    public popPlacementRenderer() {
        const cursor = document.getElementsByClassName("selection point")[0];
        if (cursor) {
            const placement = cursor.firstChild;
            if (placement) {
                cursor.removeChild(placement);
            }
            ReactDOM.render(this.renderPlacementModal()
                , cursor);
        }
    }

    public placementRenderer(zoomTick) {
        if (this.state.playlist) {
            const timeEl = document.getElementsByClassName("time")[0];
            const p = document.getElementsByClassName("playlist")[0];
            const timeScale = document.getElementsByClassName("playlist-time-scale")[0];
            const canvas = timeScale.lastElementChild;
            this.duration = (this.state.playlist as any).duration;
            this.timeWidth = canvas.attributes[0].value;
            this.ro.observe(canvas);
            const placementExists = document.getElementsByClassName("placementContainer").length > 0;
            if (placementExists) {
                p.removeChild(document.getElementsByClassName("placementContainer")[0]);
            }
            const placement = document.createElement("div");
            placement.className = "placementContainer";
            p.appendChild(placement);
            ReactDOM.render(this.renderPlacementPositions()
                , placement);
        }
    }

    public componentWillUnmount() {
        if (this.state.playlist) {
            (this.state.playlist as any).ac.close();
        }
    }

    public getAdPlacement() {
        const adPlacement = {
            existingPlacements: null,
            manualPlacements: null,
        };
        const placements = _.map(this.state.placements, (placement) => {

            const startSplit = (placement as any).start.split(":");
            const sMin = Number(startSplit[0]);
            const sSec = startSplit.length > 1 ? Number(startSplit[1]) : 0;
            const start = sMin * 60 + sSec;

            const endSplit = (placement as any).end.split(":");
            const eMin = Number(endSplit[0]);
            const eSec = endSplit.length > 1 ? Number(endSplit[1]) : 0;
            const end = eMin * 60 + eSec;

            return {
                type: (placement as any).type,
                start,
                end,
            };

        }).filter((placement) => {
            return placement.start !== 0 || placement.end !== 0;
        });
        adPlacement.existingPlacements = placements;
        adPlacement.manualPlacements = this.state.wavePlacements;
        return adPlacement;
    }

    @autobind
    public render() {
        this.popPlacementRenderer();
        this.placementRenderer(this.state.zoomTick);
        this.props.onChange(this.getAdPlacement());
        const importProgress = this.props.rootState.importProgress;
        const audioUrl = this.props.episodeState.fields.audioUrl;
        return (
            <Segment style={style.container} basic>
                <div style={style.zoomControls}>
                    <div>
                        <Popup
                            trigger={
                                <Icon
                                    className="audioEditorButtonIcon"
                                    style={style.buttonIcon}
                                    onClick={() => {
                                        this.ee.zoomin();
                                        this.forceUpdate();
                                    }}
                                    name="zoom in"
                                    size="large" />
                            }
                            style={{
                                ...globalStyles.tooltip,
                                margin: 0,
                                marginBottom: 0,
                                marginLeft: 15,
                            }}
                            basic
                            size="tiny"
                            content="Zoom In" />
                        <Popup
                            trigger={
                                <Icon
                                    className="audioEditorButtonIcon"
                                    style={style.buttonIcon}
                                    onClick={() => {
                                        this.ee.zoomout();
                                        this.forceUpdate();
                                    }}
                                    name="zoom out"
                                    size="large" />
                            }
                            style={{
                                ...globalStyles.tooltip,
                                margin: 0,
                                marginBottom: 0,
                                marginLeft: 15,
                            }}
                            basic
                            size="tiny"
                            content="Zoom Out" />
                    </div>
                </div>
                {!audioUrl ?
                    <p style={style.text}>
                        Upload an Episode to get started.
                    </p>
                    :
                    <Container basic>

                        <Container>
                            <h3 style={style.text}>
                                Choose Ad Placements
                                </h3>
                            <p style={style.text}>
                                Click on the episode audio to indicate where you would like ads to appear.
                                </p>
                            <div id="adAudio" style={{
                                marginTop: 60,
                                display: this.state.loading ? "none" : "inline" as "inline",
                                // backgroundColor: colors.mainDark,
                                border: "1px solid lightgray",
                                borderRadius: 3,
                            }}>
                            </div>
                            {this.state.loading ?
                                <div style={style.loadingContainer}>
                                    <Icon style={style.text} size="big" name="spinner" loading />
                                    <div style={{ ...style.text, marginTop: 15 }}>Loading audio...</div>
                                </div>
                                :
                                null
                            }
                            <div style={{
                                display: this.state.loading ? "none" : "inline" as "inline",
                                marginTop: -25,
                            }}>
                                <Button onClick={(e) => {
                                    e.preventDefault();
                                    this.ee.play();
                                }} icon="play" positive />
                                <Button onClick={(e) => {
                                    e.preventDefault();
                                    this.ee.pause();
                                }} icon="pause" color="yellow" />
                                <Button onClick={(e) => {
                                    e.preventDefault();
                                    this.ee.stop();
                                }} icon="square" negative />
                            </div>
                            <h3 style={style.text}>
                                Existing Ad Placements
                            </h3>
                            <p style={style.text}>
                                If the episode already has ads, select their position from the dropdown and include the time slots below.
                            </p>
                            {this.renderPlacements()}
                            <div
                                onClick={() => this.addNewPlacement()}
                                style={style.existingPlacementContainer}>
                                <Icon style={{ color: "gray" }} name="plus" size="large" />
                                <span style={style.text}>
                                    Add Existing Ad Placement
                                </span>
                            </div>
                        </Container>
                    </Container>
                }
            </Segment>
        );
    }

    protected addNewPlacement() {
        const placements = this.state.placements;
        placements.push({
            type: "Preroll",
            start: "",
            end: "",
        });
        this.setState({ placements });
    }

    protected selectType(type, index) {
        const placements = this.state.placements;
        const placement = placements[index];
        placement.type = type;
        placements[index] = placement;
        this.setState({ placements });
    }

    protected removePlacement(index) {
        const placements = this.state.placements;
        _.pullAt(placements, [index]);
        this.setState({ placements });

    }

    protected changeEnd(index, event) {
        const placements = this.state.placements;
        const value = event.target.value;

        if (value.length > 5 || (value.includes(":") && value.length > 4)) { return null; }

        if (value.length <= 5) {
            const re = /^(\d{1,2}:?)(\d{1,2}$)?/;
            const match = re.exec(value);
            let val = match ? match[0] : value;
            if (!val.includes(":") && val.length === 3 && val[2] !== ":") {
                val = val[0] + val[1] + ":" + val[2];
            }
            if (val || value.length === 0) {
                placements[index].end = val;
            }
            this.setState({ placements });
        }
    }

    protected changeStart(index, event) {
        const placements = this.state.placements;
        const value = event.target.value;

        if (value.length > 5 || (value.includes(":") && value.length > 4)) { return null; }

        if (value.length <= 5) {
            const re = /^\d{1,2}:?(\d{1,2}$)?/;
            const match = re.exec(value);
            let val = match ? match[0] : value;
            if (!val.includes(":") && val.length === 3 && val[2] !== ":") {
                val = val[0] + val[1] + ":" + val[2];
            }
            if (val || value.length === 0) {
                placements[index].start = val;
            }
            this.setState({ placements });
        }
    }

    protected renderPlacements() {
        const content = _.map(this.state.placements, (item, index) => {
            return (
                <div style={style.placementContainer}>
                    <div style={style.placementItem}>
                        <Dropdown
                            style={style.placementInput}
                            value={(item as any).type}
                            onChange={(e, { value }) => this.selectType(value, index)}
                            placeholder="Preroll"
                            fluid
                            selection
                            options={placementOptions} />
                    </div>
                    <div style={style.placementItem}>
                        <input
                            onChange={(e) => this.changeStart(index, e)}
                            value={(item as any).start}
                            style={style.placementInput}
                            type="text"
                            placeholder="start time mm:ss" />
                    </div>
                    <div style={style.placementItem}>
                        <input
                            onChange={(e) => this.changeEnd(index, e)}
                            value={(item as any).end}
                            style={style.placementInput}
                            type="text"
                            placeholder="end time mm:ss" />
                    </div>
                    {this.state.placements.length > 1 ?
                        <div style={style.removeContainer}>
                            <Popup
                                trigger={
                                    <Icon
                                        className="audioEditorButtonIcon"
                                        style={style.buttonIcon}
                                        onClick={() => this.removePlacement(index)}
                                        name="close"
                                        size="large" />
                                }
                                style={{
                                    ...globalStyles.tooltip,
                                    margin: 0,
                                    marginBottom: 0,
                                    marginLeft: 15,
                                }}
                                basic
                                size="tiny"
                                content="Zoom In" />
                        </div>
                        :
                        null}
                </div>
            );
        });

        return (
            <div>
                {content}
            </div>
        );
    }

    protected initPlaylist(file: any) {

        const plist = document.getElementById("adAudio");

        const playlist = WaveformPlaylist.init({
            mono: true,
            samplesPerPixel: 16384,
            waveHeight: 100,
            container: plist,
            state: "select",
            colors: {
                waveOutlineColor: "gray",
                timeColor: "grey",
                fadeColor: "black",
            },
            timescale: true,
            seekStyle: "line",
            isAutomaticScroll: false,
            states: {
                cursor: true,
                select: true,
                shift: true,
            },
            zoomLevels: [500, 1000, 3000, 5000, 7500, 10000, 16384],
            controls: {
                show: false,
            },
            zoomCallback: () => {
                setTimeout(() => {
                    this.forceUpdate();
                }, 2000);
                this.placementRenderer(this.state.zoomTick);
            },
        },
            EventEmitter());
        this.setState({ playlist, loading: true });
        playlist.load([
            {
                src: file,
                name: "TRACK1",
                waveOutlineColor: "white",
            },
        ]).then(() => {

            this.ee = playlist.getEventEmitter().__ee__;
            this.setState({ loading: false });
            playlist.initExporter();
            this.popPlacementRenderer();
            playlist.getEventEmitter().on("timeupdate", (time) => {
                this.cursor = time;
                this.setState({ visiblePlacement: true, activePlacement: null });
            });
        });
    }

    protected renderPlacementModal() {

        return (
            <div>
                {
                    this.state.visiblePlacement ?
                        <div style={style.placementModal}>
                            <Button onClick={(e) => this.onWavePlacement(e, "Preroll")} style={style.rollButton} content="Preroll" />
                            <Button onClick={(e) => this.onWavePlacement(e, "Midroll")} style={style.rollButton} content="Midroll" />
                            <Button onClick={(e) => this.onWavePlacement(e, "Postroll")} style={style.rollButton} content="Postroll" />
                        </div>
                        :
                        null
                }
            </div>
        );
    }

    protected renderPlacementPositions() {
        const unit = this.timeWidth / this.duration;
        return (
            <div style={style.placementPositionContainer}>
                {this.state.wavePlacements.map((placement) => {
                    return (
                        <div
                            onClick={() => {
                                this.setState({ activePlacement: placement.start });
                            }} style={{
                                position: "absolute",
                                top: 40,
                                left: placement.start * unit,
                                cursor: "pointer",
                            }}>
                            <div style={{
                                position: "absolute",
                                height: 125,
                                top: 45,
                                left: 0,
                                width: 1,
                                backgroundColor: "gray",
                                zIndex: 7,
                            }} />
                            <Icon style={{
                                position: "absolute",
                                top: 0,
                                left: -7.5,
                            }} name="bullhorn" size="large" />
                            {this.state.activePlacement === placement.start ?
                                <div style={{
                                    position: "absolute",
                                    top: -10,
                                    right: -375,
                                    padding: 5,
                                    zIndex: 10,
                                    width: 350,
                                    height: 50,
                                    background: "white",
                                    border: "1px solid gray",
                                }}>
                                    <Button
                                        disabled={placement.type === "Preroll"}
                                        onClick={(e) => this.setPlacement(e, "Preroll", placement.start)}
                                        style={style.rollButton}
                                        content="Preroll" />
                                    <Button
                                        disabled={placement.type === "Midroll"}
                                        onClick={(e) => this.setPlacement(e, "Midroll", placement.start)}
                                        style={style.rollButton}
                                        content="Midroll" />
                                    <Button
                                        disabled={placement.type === "Postroll"}
                                        onClick={(e) => this.setPlacement(e, "Postroll", placement.start)}
                                        style={style.rollButton}
                                        content="Postroll" />
                                    <Icon
                                        onClick={(e) => this.removePlacementWave(e, placement.start)}
                                        name="trash"
                                        size="big"
                                        style={{
                                            color: "#333",
                                            marginLeft: 5,
                                            cursor: "pointer",
                                        }} />
                                </div>
                                :
                                null
                            }
                        </div>
                    );
                })}
            </div>
        );
    }

    protected removePlacementWave(e, start) {
        e.preventDefault();
        const wavePlacements = _.filter(this.state.wavePlacements, (placement) => {
            return (placement as any).start !== start;
        });
        this.setState({ wavePlacements });
    }

    protected setPlacement(e, type, start) {
        const oldPlacements = this.state.wavePlacements;
        const wavePlacements = _.map(oldPlacements, (placement) => {
            if ((placement as any).start === start) {
                return {
                    ...placement,
                    type,
                    start,
                };
            } else {
                return placement;
            }
        });
        this.setState({ wavePlacements });
    }

    protected onWavePlacement(e, type) {
        e.preventDefault();
        const wavePlacements = this.state.wavePlacements;
        wavePlacements.push({
            type,
            start: this.cursor,
        });
        this.setState({ wavePlacements, visiblePlacement: false });
    }

}

const style = {
    container: {
        width: "75%",
    },
    text: {
        color: colors.mainDark,
    },
    zoomControls: {
        display: "flex",
        flexDirection: "row" as "row",
        flex: 1,
        justifyContent: "flex-end" as "flex-end",
    },
    zoomIcon: {
        cursor: "pointer",
    },
    loadingContainer: {
        display: "flex",
        justifyContent: "center" as "center",
        flexDirection: "column" as "column",
        alignItems: "center" as "center",
        marginTop: 50,
    },
    buttonIcon: {
        cursor: "pointer",
    },
    placementContainer: {
        display: "flex",
        flex: 1,
        flexDirection: "row" as "row",
        marginTop: 5,
        color: colors.mainDark,
    },
    placementItem: {
        display: "flex",
        flex: 1,
    },
    existingPlacementContainer: {
        marginTop: 25,
        cursor: "pointer",
    },
    placementInput: {
        color: colors.mainDark,
        borderRadius: 0,
    },
    removeContainer: {
        display: "flex",
        flexDirection: "column" as "column",
        justifyContent: "center" as "center",
        marginLeft: 10,
    },
    placementModal: {
        width: 310,
        height: 50,
        backgroundColor: "white",
        marginTop: -70,
        padding: 5,
        border: "1px solid gray",
        zIndex: 100,
        positon: "fixed",
    },
    rollButton: {
        width: 95,
        backgroundColor: colors.mainDark,
        color: "white",
    },
    placementPositionContainer: {
        position: "absolute" as "absolute",
        top: -30,
    },
};
