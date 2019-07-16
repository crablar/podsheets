import * as Modal from "boron/FadeModal";
import { autobind } from "core-decorators";
import * as React from "react";
// tslint:disable-next-line:max-line-length
import { Button, Divider, Dropdown, Form, Grid, Header, Icon, Image, Input, Message, Popup, Segment } from "semantic-ui-react";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
interface IPodcastFormProps {
    onSubmit: (formState: IPodcastDesignFields) => Promise<void>;
    onPreview: (item: IPodcastDesignFields) => Promise<void>;
    currentPodcast: IPodcast;
}

export interface IPodcastDesignFields {
    theme: "light" | "dark" | "sky" | "silver" | "sand";
    layout: "classic" | "minimalistic";
}

export interface IPodcastFormState {
    fields: IPodcastDesignFields;
    previewDevice?: string;
}

function getIconProps(value: string) {

    switch (value) {
        case "dark":
            return {
                size: "large", name: "square", style: {
                    color: "#000000",
                    border: "1px solid #EEE",
                    background: "#000000",
                },
            };
        case "silver":
            return {
                size: "large", name: "square", style: {
                    color: "#CDC9C9",
                    border: "1px solid #EEE",
                    background: "#CDC9C9",
                },
            };
        case "sky":
            return {
                size: "large", name: "square", style: {
                    color: "#B2D3FD",
                    border: "1px solid #EEE",
                    background: "#B2D3FD",
                },
            };
        case "light":
            return {
                size: "large", name: "square", style: {
                    color: "#FFFFFF",
                    border: "1px solid #EEE",
                    background: "white",
                },
            };
        case "sand":
            return {
                size: "large", name: "square", style: {
                    color: "#EDECE7",
                    border: "1px solid #EEE",
                    background: "#EDECE7",
                },
            };
    }

    return { size: "large", name: "square", style: { color: "#FFFFFF" } };
}

const selectThemeOptions = [
    { key: "darkk", value: "dark", text: "Dark", icon: getIconProps("dark") },
    { key: "silver", value: "silver", text: "Silver", icon: getIconProps("silver") },
    { key: "sky", value: "sky", text: "Sky", icon: getIconProps("sky") },
    { key: "light", value: "light", text: "Light", icon: getIconProps("light") },
    { key: "sand", value: "sand", text: "Sand", icon: getIconProps("sand") },
];

export default class PodcastForm extends React.Component<IPodcastFormProps, IPodcastFormState> {
    constructor(props: IPodcastFormProps) {
        super();
        if (props.currentPodcast) {
            const theme = props.currentPodcast.theme ? props.currentPodcast.theme : "light";
            const layout = props.currentPodcast.layout ? props.currentPodcast.layout : "classic";
            this.state = {
                fields: { theme, layout },
                previewDevice: "desktop",
            };
        }
    }

    public render() {
        return (
            <Segment style={{ width: "75%", paddingLeft: 0 }} basic>
                <Form>
                    <Header as="h2" style={globalStyles.title}>
                        Design
                    </Header>
                    <Form.Field inline required>
                        <label style={style.formLabel}>Theme</label>
                        <Dropdown
                            placeholder="theme"
                            name="theme"
                            value={this.state.fields.theme}
                            options={selectThemeOptions}
                            onChange={this.onChangeInputField}
                            style={style.formInput}
                            trigger={(
                                <div>
                                    <Icon
                                        style={getIconProps(this.state.fields.theme).style}
                                        name={getIconProps(this.state.fields.theme).name} />
                                    <span style={{ color: colors.mainDark }}>{this.state.fields.theme}</span>
                                </div>
                            )}
                            selection />
                    </Form.Field>
                    {/*
                    <Grid style={{ marginTop: 30 }}>
                        <Grid.Row columns={2}>
                            <Grid.Column width={8}>
                                <div
                                    onClick={() => {
                                        this.setState({ fields: { ...this.state.fields, layout: "classic" } });
                                    }}
                                    style={{
                                        backgroundColor: "#EDECE7",
                                        width: "23vw",
                                        height: "17vw",
                                        cursor: "pointer",
                                        // tslint:disable-next-line:max-line-length
                                        border: this.state.fields.layout === "classic" ? "3px solid #68C3EF" : "3px solid #E1ECF1",
                                    }}>
                                    <Image
                                        style={{ width: "100%", height: "100%" }}
                                        src="/assets/design/classic-design.png" />
                                </div>
                                <Header style={style.layoutHeader} textAlign="center">
                                    Classic
                                </Header>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <div
                                    onClick={() => {
                                        this.setState({ fields: { ...this.state.fields, layout: "minimalistic" } });
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        backgroundColor: "#EDECE7",
                                        width: "23vw",
                                        height: "17vw",
                                        // tslint:disable-next-line:max-line-length
                                        border: this.state.fields.layout === "minimalistic" ? "3px solid #68C3EF" : "3px solid #E1ECF1",
                                    }}>
                                    <Image
                                        style={{ width: "100%", height: "100%" }}
                                        src="/assets/design/minimalistic-design.png" />
                                </div>
                                <Header style={style.layoutHeader} textAlign="center">
                                    Minimalistic
                                </Header>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    */}
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
                            src={`/p/${this.props.currentPodcast.slug}/design-preview/#/`}>
                        </iframe>
                    </div>
                </Modal>
            </Segment>
        );
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
    protected async onPreview(item: IPodcastDesignFields, e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        await this.props.onPreview(item);
        this.showPreview();
    }

    @autobind
    protected onChangeInputField(e: React.ChangeEvent<HTMLInputElement>, input: any) {
        if (input && input.name) {
            const fields = { ...this.state.fields, [input.name]: input.value };
            this.setState({ fields });
        }
    }

    @autobind
    protected async onSubmit(e: any) {
        e.preventDefault();
        await this.props.onSubmit(this.state.fields);

    }
}

const style = {
    formInput: {
    },
    formLabel: {
        color: colors.mainDark,
    },
    actionContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "row" as "row",
        justifyContent: "center" as "center",
    },
    tooltip: {
        ...globalStyles.tooltip,
        margin: 0,
        marginBottom: 0,
        marginLeft: 15,
    },
    actionIcon: {
        fontSize: "80%",
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 0,
        marginRight: 15,
        alignSelf: "flex-end",
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
    layoutHeader: {
        width: "23vw",
        marginTop: 15,
        color: colors.mainDark,
    },
};
