import { autobind } from "core-decorators";
import * as EventEmitter from "event-emitter";
import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { Button, Checkbox, Container, Header, Icon, Input, Loader, Message, Modal, Popup, Progress, Segment } from "semantic-ui-react";
import { colors, globalStyles } from "../../../lib/styles";
import * as WaveformPlaylist from "../../../lib/wave-form-playlist/app.js";
import { RootState } from "../../../state/RootState";

import "../../../lib/styles.scss";
import "./styles/AudioEditor.scss";

interface IAudioEditorProps {
    rootState?: RootState;
    onAudio: (file: any) => void;
}

interface IAudioEditorState {
    isOpen: boolean;
    playlist: any;
    maxTracks: boolean;
    tracks: number;
    checkedTrack: any;
    loaded: boolean;
}

const TRACK1 = "Track1";
const TRACK2 = "Track2";

@inject("rootState")
@observer
export default class AudioEditor extends React.Component<IAudioEditorProps, IAudioEditorState> {

    public state: IAudioEditorState = {
        isOpen: false,
        playlist: false,
        maxTracks: false,
        tracks: 0,
        checkedTrack: [true, true],
        loaded: true,
    };
    public i = 0;

    public ee: any = null;

    public render() {
        return (
            <div style={{ width: "75%" }}>
                <Container style={style.content}>
                    <div style={style.topRow}>
                        <div>
                            <Button
                                disabled={this.state.maxTracks || !this.state.loaded}
                                loading={!this.state.loaded}
                                onClick={(e) => this.onAddTrack(e)}
                                style={style.addTrackButton}>
                                Add Track
                                </Button>
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
                        <div style={style.zoomContainer}>
                            <Popup
                                trigger={
                                    <Icon
                                        className="audioEditorButtonIcon"
                                        style={style.buttonIcon}
                                        onClick={() => {
                                            this.ee.trim();
                                            this.state.playlist.getEventEmitter().__ee__.startaudiorendering("wav");
                                        }}
                                        name="cut"
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
                                content="Cut" />
                            <Popup
                                trigger={
                                    <Icon
                                        className="audioEditorButtonIcon"
                                        style={style.buttonIcon}
                                        onClick={() => this.ee.zoomin()}
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
                                        onClick={() => this.ee.zoomout()}
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
                    <div style={style.trackContainer}>
                        {!this.state.playlist ?
                            <div style={style.noTrackContainer}>
                                {this.state.loaded ?
                                    <div>
                                        Please add a track to begin editing
                                    <br />
                                        <span
                                            onClick={(e) => this.onAddTrack(e)}
                                            style={style.addTrackText}>
                                            add track
                                    </span>
                                    </div>
                                    :
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column" as "column",
                                        alignItems: "center",
                                        textAlign: "center",
                                    }}>
                                        <Icon name="spinner" size="big" loading={true}/>
                                        Loading audio
                                    </div>
                                }
                            </div>
                            :
                            null
                        }
                        <div style={{
                        }}>
                            <div style={{
                                position: "absolute",
                                top: 75,
                                left: 0,
                                height: 150 * this.state.tracks,
                            }}>
                                {_.times(this.state.tracks, (num) => {
                                    return (
                                        <div style={{
                                            height: 150,
                                            display: "flex",
                                            flexDirection: "column",
                                            flex: 1,
                                            justifyContent: "center",
                                            paddingLeft: 15,
                                        }}>
                                            <Checkbox
                                                onChange={(e, data) => this.onCheck(data, num)}
                                                checked={this.state.checkedTrack[num]} />
                                        </div>);
                                })}
                            </div>
                            <div id="playlist" style={{
                                display: !this.state.playlist ? "none" as "none" : "inline" as "inline",
                                marginTop: 30,
                                // backgroundColor: colors.mainDark,
                                border: "1px solid lightgray",
                                borderRadius: 3,
                            }}>
                            </div>
                        </div>

                    </div>
                    <input
                        ref="trackInput"
                        onChange={(e) => this.onFile(e)}
                        style={style.fileInput}
                        type="file" />
                </Container>
            </div>
        );
    }

    protected onCheck(data, num) {
        const checked = this.state.checkedTrack;
        let count = 0;
        if (checked[0]) {
            count++;
        }
        if (checked[1]) {
            count++;
        }
        if (count === 1 && !checked[num] || count === 2) {
            checked[num] = !checked[num];
        }
        this.setState({ checkedTrack: checked });
    }

    protected delta() {
        this.i += 100;
        return this.i;
    }

    protected toggleEditor(e) {
        e.preventDefault();
        this.setState({ isOpen: !this.state.isOpen });
    }

    protected onAddTrack(e) {
        e.preventDefault();
        const inputField: any = this.refs.trackInput;
        inputField.click();
    }

    protected onFile(e) {
        e.preventDefault();
        e.preventDefault();
        if (e.target && e.target.files && e.target.files.length) {
            const file = e.target.files[0];
            if (!this.state.playlist) {
                this.setState({ loaded: false });
                this.initPlaylist(file);
            } else {
                this.setState({ loaded: false });
                this.addToPlaylist(file);
            }
        }
    }

    protected addToPlaylist(file) {

        this.state.playlist.load([
            {
                src: file,
                name: TRACK2,
                waveOutlineColor: "white",
            },
        ]);
        this.state.playlist.getEventEmitter().__ee__.startaudiorendering("wav");
        this.setState({ maxTracks: true, tracks: 2 });
    }

    protected initPlaylist(file: any) {

        const playlist = WaveformPlaylist.init({
            mono: true,
            samplesPerPixel: 16384,
            waveHeight: 200,
            container: document.getElementById("playlist"),
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
        },
            EventEmitter());

        playlist.load([
            {
                src: file,
                name: TRACK1,
                waveOutlineColor: "white",
            },
        ]).then(() => {
            this.setState({ playlist, tracks: 1, loaded: true });
            this.ee = playlist.getEventEmitter().__ee__;
            playlist.getEventEmitter().__ee__.startaudiorendering("wav");
            playlist.getEventEmitter().on("audiorenderingfinished", (type, data) => {
                const rendered = new File([data], "episode.mp3", { type: "audio/mp3" });
                this.props.onAudio(rendered);
            });
            playlist.getEventEmitter().on("audiosourcesloaded", () => {
                this.setState({ loaded: true });
            });
            playlist.getEventEmitter().on("select", (start, end, track) => {
                const selected = track.name === TRACK1 ? 0 : 1;
                const checkedTrack = this.state.checkedTrack;

                const track1 = this.state.playlist.tracks[0];
                const track2 = this.state.playlist.tracks[1];

                playlist.isActiveAll = checkedTrack[0] && checkedTrack[1] ? true : false;
                playlist.activeTrack = checkedTrack[0] ? track1 : track2;

            });
        });
    }
}

const style = {
    content: {
        padding: 0,
    },
    topRow: {
        display: "flex" as "flex",
        flex: 1,
        flexDirection: "row" as "row",
    },
    zoomContainer: {
        display: "flex" as "flex",
        flex: 1,
        flexDirection: "row" as "row",
        justifyContent: "flex-end" as "flex-end",
    },
    trackContainer: {
        minHeight: 500,
        position: "relative" as "relative",
    },
    addTrackButton: {
        backgroundColor: colors.mainDark,
        color: "white",
    },
    noTrackContainer: {
        display: "flex" as "flex",
        flexDirection: "column" as "column",
        flex: 1,
        justifyContent: "center" as "center",
        textAlign: "center",
        color: "lightgray",
        height: 200,
    },
    addTrackText: {
        color: colors.mainDark,
        cursor: "pointer",
    },
    fileInput: {
        display: "none",
    },
    buttonIcon: {
        cursor: "pointer",
    },
};
