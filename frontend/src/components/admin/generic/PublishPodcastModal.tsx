import axios from "axios";
import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import * as ReactQuill from "react-quill/src/";
import StripeCheckout from "react-stripe-checkout";
import { Button, Checkbox, Form, Header, Icon, Input, List, Message, Modal, Popup, Radio, Segment } from "semantic-ui-react";
import { storage } from "../../../lib/constants";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

interface IPublishPodcastProps {
    onSubmit: (formState: IPublishPodcastFields) => Promise<void>;
}

export interface IPublishPodcastFields {
    publish: boolean;
}

export interface IPublishPodcastState {
    fields: IPublishPodcastFields;
    open: boolean;
    loading: boolean;
    error?: string;
}

// tslint:disable-next-line:max-line-length
@inject("rootState")
@observer
export default class PublishPodcastModal extends React.Component<any, IPublishPodcastState> {

    constructor(props: IPublishPodcastProps) {
        super();

        this.state = {
            fields: { publish: true },
            open: false,
            loading: false,
        };
    }

    @autobind
    public render() {

        const importProgress = this.props.rootState.importProgress;

        return (
            <Segment style={style.content} basic>
                {importProgress && importProgress.current ?
                    null
                    :
                    <Form action="#" onSubmit={(e) => e.preventDefault()}>
                        <Form.Button onClick={() => this.setState({ open: true })} style={style.importButton}>
                            Publish Podcast
                        </Form.Button>
                    </Form>
                }
                <Modal
                    size={"small"}
                    open={this.state.open}
                    closeOnEscape={false}
                    closeOnRootNodeClick={false}
                    onClose={this.closeModal}>
                    <Modal.Header style={{color: colors.mainDark}}>
                        Publish Podcast
                    </Modal.Header>
                    <div style={style.modalContent}>
                        <h4 style={{color: colors.mainDark}}>You have two options to publish your podcast:</h4>
                        <List ordered>
                            <List.Item>Via Podsheets, we publish it for you on iTunes and Google Play.</List.Item>
                            <List.Item>You publish it on iTunes and Google Play
                                <List.List>
                                    <List.Item><a href="http://itunespartner.apple.com/en/podcasts/faq" target="_blank">How to publish on iTunes</a></List.Item>
                                    <List.Item><a href="https://support.google.com/googleplay/podcasts/answer/6260341" target="_blank">How to publish on Google Play</a></List.Item>
                                </List.List>
                            </List.Item>
                        </List>
                        {this.state.error ?
                            <Message
                                color="red"
                                onDismiss={() => this.onError("")}
                                content={this.state.error} />
                            :
                            null
                        }
                        <h4 style={{color: colors.mainVibrant}}>Click Publish to publish your podcast via Podsheets</h4>
                    </div>
                    <Modal.Actions>
                        <Button onClick={() => this.closeModal()} basic color="red">Cancel</Button>
                        <Button
                        onClick={this.onSubmit}
                        loading={this.state.loading}
                        color="violet"
                        content="Publish" />
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
    protected onError(message: string) {
        this.setState({ error: message });
    }

    @autobind
    protected async onSubmit() {
        this.setState({ loading: true });
        try {
            const response = await this.props.onSubmit();
            if (response.status === 200) {
                this.closeModal();
            } else {
                this.onError("Error submitting podcast. Please try again later.");
            }
        } catch (error) {
            this.onError("Error submitting podcast. Please try again later.");
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
        /*flex: 1,*/
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
