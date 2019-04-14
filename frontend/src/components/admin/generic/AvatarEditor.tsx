import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import * as AvatarEditor from "react-avatar-editor";
import { Link } from "react-router-dom";
import { Button, Container, Dropdown, Header, Icon, Input, Message, Modal, Popup, Progress, Segment } from "semantic-ui-react";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import PodcastForm, { IPodcastFields } from "../forms/PodcastForm";

interface IAvatarEditorProps {
    rootState?: RootState;
    onClose: () => void;
    onFile: (file: any) => void;
    file?: any;
    isOpen: boolean;
}

interface IAvatarEditorState {
    zoom: number;
}

@inject("rootState")
@observer
export default class AvatarEditorComponent extends React.Component<IAvatarEditorProps, IAvatarEditorState> {

    public state: IAvatarEditorState = {
        zoom: 1,
    };

    public editor: any;

    public render() {
        return (
            <Modal
                style={style.modal}
                onClose={() => this.props.onClose()}
                open={this.props.isOpen}>
                <div style={style.content}>
                    <div style={style.editor}>
                        <AvatarEditor
                            ref={(editor) => this.editor = editor}
                            image={this.props.file || ""}
                            width={250}
                            height={250}
                            border={50}
                            color={[255, 255, 255, 0.6]} // RGBA
                            scale={this.state.zoom}
                            rotate={0}
                        />
                    </div>
                    Scale
                    <input value={this.state.zoom} onChange={(e) => this.onZoom(e)} id="zoom" type="range" min={1} max={5} step={0.1} />
                    <Button onClick={() => this.onClickSave()} style={style.saveButton} positive>Save</Button>
                </div>
            </Modal>
        );
    }

    protected onZoom(e) {
        this.setState({ zoom: e.target.value });
    }

    protected onClickSave() {
        if (this.editor) {
            this.editor.getImage().toBlob((blob) => {
                const re = /(?:\.([^.]+))?$/;
                const ext = re.exec(this.props.file.name)[1];
                const file = new File([blob], this.props.file.name, { type: "image/" + ext});
                this.props.onFile(file);
            });
        }
    }

    protected setEditorRef = (editor) => this.editor = editor;

}

const style = {
    modal: {
        alignSelf: "center" as "center",
        padding: 15,
    },
    content: {
        display: "flex" as "flex",
        flex: 1,
        justifyContent: "center" as "center",
        alignItems: "center" as "center",
        flexDirection: "column" as "column",
    },
    saveButton: {
        marginTop: 15,
    },
    editor: {
        border: "1px solid lightgray",
        borderRadius: 3,
    },
};
