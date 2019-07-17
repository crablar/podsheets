import axios from "axios";
import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import * as ReactQuill from "react-quill/src/";
import StripeCheckout from "react-stripe-checkout";
import { Button, Checkbox, Form, Header, Icon, Input, Message, Modal, Popup, Radio, Segment } from "semantic-ui-react";
import { storage } from "../../../lib/constants";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

interface IRSSImportFormProps {
    onSubmit: (formState: IRSSImportFields) => Promise<void>;
}

export interface IRSSImportFields {
    feedUrl?: string;
    publish: boolean;
}

export interface IRSSImportFormState {
    fields: IRSSImportFields;
    open: boolean;
    loading: boolean;
    error?: string;
}

// tslint:disable-next-line:max-line-length
@inject("rootState")
@observer
export default class RSSImportForm extends React.Component<any, IRSSImportFormState> {

    constructor(props: IRSSImportFormProps) {
        super();

        this.state = {
            fields: { feedUrl: "", publish: false },
            open: false,
            loading: false,
        };

    }

    @autobind
    public render() {

        const importProgress = this.props.rootState.importProgress;

        if (this.props.rootState.env.IMPORT_RSS_ENABLED === "false")  { return null; }

        return (
            <Segment style={style.content} basic>
                {importProgress && importProgress.current ?
                    null
                    :
                    <Form action="#" onSubmit={(e) => e.preventDefault()}>
                        <Form.Button onClick={() => this.setState({ open: true })} style={style.importButton}>
                            Import RSS
                        </Form.Button>
                    </Form>
                }
                <Modal
                    size={"small"}
                    open={this.state.open}
                    closeOnEscape={false}
                    closeOnRootNodeClick={false}
                    onClose={this.closeModal}
                >
                    <Modal.Header style={{color: colors.mainDark}}>
                        Import RSS Feed
                    </Modal.Header>
                    <div style={style.modalContent}>
                        <p>Import all of your episodes from an existing RSS feed</p>
                        {this.state.error ?
                            <Message
                                color="red"
                                onDismiss={() => this.onError("")}
                                content={this.state.error} />
                            :
                            null
                        }
                        <Input
                            onChange={this.onChangeUrlField}
                            style={style.feedInput}
                            type="text"
                            placeholder="Feed url" />
                        <Checkbox
                            checked={this.state.fields.publish}
                            onChange={() => this.onCheck()}
                            style={{
                                marginTop: 15,
                            }}
                            label="Publish episodes automatically" />
                    </div>
                    <Modal.Actions>
                        <Button onClick={() => this.closeModal()} basic color="red">Cancel</Button>
                        <Button
                            onClick={this.onSubmit}
                            loading={this.state.loading}
                            color="violet"
                            labelPosition="right"
                            icon="cloud upload"
                            content="Import" />
                    </Modal.Actions>
                </Modal>
            </Segment>
        );
    }

    protected onCheck() {
        const fields = this.state.fields;
        const publish = !fields.publish;
        this.setState({
            fields: {
                ...fields,
                publish,
            },
        });
    }

    protected closeModal() {
        this.setState({ open: false, loading: false });
    }

    @autobind
    protected onChangeUrlField(e: React.ChangeEvent<HTMLInputElement>, content: any) {
        if (content) {
            const fields = { ...this.state.fields, feedUrl: content.value };
            this.setState({ fields });
        }
    }

    @autobind
    protected onError(message: string) {
        this.setState({ error: message });
    }

    @autobind
    protected async onSubmit() {
        this.setState({ loading: true });
        try {
            const response = await this.props.onSubmit(this.state.fields);
            if (response.status === 200) {
                this.closeModal();
            } else {
                this.onError("Failed to parse RSS feed please make sure it is correct and try again");
            }
        } catch (error) {
            this.onError("Failed to parse RSS feed please make sure it is correct and try again");
        }
        this.setState({ loading: false });
    }
}

const style = {
    content: {
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "row",
        flex: 1,
        justifyContent: "flex-end",
        marginRight: 15,
    },
    importButton: {
        backgroundColor: colors.mainDark,
        color: "white",
    },
    modalContent: {
        padding: 20,
    },
    feedInput: {
        display: "flex",
        flexDirection: "row",
        flex: 1,
    },
};
