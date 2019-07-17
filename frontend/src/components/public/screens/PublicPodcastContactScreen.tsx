import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Button, Container, Form, Header, Image, Message, Segment } from "semantic-ui-react";
import { PublicClientState } from "../../../state/PublicClientState";

interface IPublicPodcastContactScreenProps { publicClientState?: PublicClientState; }

export interface IPodcastcontactState {
    contactName: string;
    contactEmail: string;
    contactMessage: string;
    hasContactErrors: boolean;
    hasSubmitted: boolean;
}

@inject("publicClientState")
@observer
export default class PublicPodcastContactScreen extends React.Component<IPublicPodcastContactScreenProps, {}> {
    public state: IPodcastcontactState = {
        contactName: "",
        contactEmail: "",
        contactMessage: "",
        hasContactErrors: false,
        hasSubmitted: false,
    };

    public render() {

        return (
            <div style={{
                paddingBottom: 30,
                minHeight: "100vh",
            }}>
                <div style={style.imageWrapper}>
                    <Image
                        style={style.image}
                        src={this.props.publicClientState.podcast.imageUrl || "/assets/image.png"}
                        centered spaced />
                </div>
                <main>
                    <Container>
                        <Segment style={style.content} >
                            <Header as="h1" color="blue">Contact</Header>
                            <p style={style.textContent}>
                                {this.props.publicClientState.podcast.contactMessage}
                            </p>
                            <p style={style.textContent}>
                                {this.props.publicClientState.podcast.contactFacebook}
                            </p>
                            <p style={style.textContent}>
                                {this.props.publicClientState.podcast.contactTwitter}
                            </p>
                            <div style={{paddingTop: "50px" }}></div>
                            {this.renderMessage()}
                            {this.renderContactForm()}
                        </Segment>
                    </Container>
                </main>
            </div>
        );
    }

    @autobind
    public onSubmit(e) {
        e.preventDefault();
        this.setState({hasSubmitted: true});
        if ((this.state.contactEmail === "") || (this.state.contactName === "") || (this.state.contactMessage === "")) {
            this.setState({hasContactErrors: true});
        } else {
            this.setState({asContactErrors: false});

            // request to send the email
            this.props.publicClientState.submitContactMessage(this.state.contactName, this.state.contactEmail, this.state.contactMessage, this.props.publicClientState.podcast.email);
            // tslint:disable-next-line:no-console
            console.log("end");
        }
    }

    @autobind
    public renderContactForm() {
        if (!this.props.publicClientState.podcast.email) {
            return null;
        }

        return (
            <Form>
                <Form.Input required name="contactName" label="Name (required)" style={{maxWidth: "300px"}} value={this.state.contactName}
                onChange={this.onChangeInputField}/>
                <Form.Input name="contactEmail" required label="Email (required)" style={{maxWidth: "300px"}} value={this.state.contactEmail} onChange={this.onChangeInputField}/>
                <Form.TextArea name="contactMessage" required label="Message (required)" style={{maxWidth: "500px"}}
                value={this.state.contactMessage} onChange={this.onChangeTextArea}/>
                <Button type="button" onClick={this.onSubmit}>Submit</Button>
            </Form>
        );
    }

    @autobind
    public renderMessage() {
        // tslint:disable-next-line:no-console
        console.log("has contacterrors " + this.state.hasContactErrors + " has submitted " + this.state.hasSubmitted);

        if (this.state.hasContactErrors && this.state.hasSubmitted) {
            return (
                <Message
                    error
                    style={{maxWidth: "400px"}}
                >Please fill out all the fields from the contact form.</Message>
            );
        } else if (!this.state.hasContactErrors && this.state.hasSubmitted) {
            return (
                <Message
                    color="blue"
                    style={{maxWidth: "300px"}}
                >Your message has been sent.</Message>
            );
        } else {
            return null;
        }
    }

    @autobind
    protected onChangeInputField(e: React.ChangeEvent<HTMLInputElement>, input: any) {
        if (input && input.name) {
            this.setState({ [input.name]: input.value});
        }
    }

    @autobind
    protected onChangeTextArea(e: React.ChangeEvent<HTMLTextAreaElement>, textArea: any) {
        if (textArea && textArea.name) {
            const fields = { ...this.state, [textArea.name]: textArea.value };
            this.setState({ [textArea.name]: textArea.value});
        }
    }
}

const style = {
    imageWrapper: {
        textAlign: "center",
    },
    image: {
        maxWidth: 150,
        margin: 30,
    },
    content: {
        backgroundColor: "#FFFFFF",
        minHeight: 100,
    },
    textContent: {
        textAlign: "justify",
    },
};
