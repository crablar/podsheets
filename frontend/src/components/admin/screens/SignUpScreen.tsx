import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { Button, Container, Image, Menu, Message, Modal, Segment } from "semantic-ui-react";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import SignUpForm, { ISignUpFormState } from "../forms/SignUpForm";
import LoadingContainer from "../generic/LoadingContainer";
import TermsOfUseScreen from "./TermsOfUseScreen.jsx";

interface ISignUpScreenProps { rootState?: RootState; history?: any; }
interface ISignUpScreenState {
    error: string;
    terms_open: boolean;
    form?: ISignUpFormState;
}

@inject("rootState")
@observer
export default class SignUpScreen extends React.Component<ISignUpScreenProps, ISignUpScreenState> {
    public state: ISignUpScreenState = {
        error: null,
        terms_open: false,
    };

    public render() {
        return (
            <LoadingContainer
                loading={!!this.props.rootState.loadingCount}
                restrictAccess="nonAuthOnly"
                isAuthenticated={this.props.rootState.isAuthenticated} >
                <Container style={globalStyles.content} textAlign="center" text>
                    <Segment attached="top" style={style.topSegment}>
                        <Menu fluid widths={2} style={style.topSegmentMenu}>
                            <Menu.Item
                                name="SIGN UP"
                                style={style.activeTab} />
                            <Menu.Item style={style.inactiveTab} >
                                <Link to="/sign_in" style={style.tabLink}>SIGN IN</Link>
                            </Menu.Item>
                        </Menu>
                    </Segment>
                    <Segment style={style.contentSegment} attached>
                        {this.renderError()}
                        <SignUpForm onSubmit={(form) => this.open(form)} loading={false} />
                    </Segment>
                </Container>
                <Modal dimmer={true} open={this.state.terms_open} onClose={this.close}>
                    <Modal.Header>Terms of Use</Modal.Header>
                    <Modal.Content>
                        <TermsOfUseScreen wide disableFooter />
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            positive
                            icon="checkmark"
                            labelPosition="left"
                            content="Agree"
                            onClick={() => this.close()} />
                    </Modal.Actions>
                </Modal>
            </LoadingContainer>
        );
    }

    protected async close() {
        this.setState({ terms_open: false });
        this.onSignUpSubmit(this.state.form);
    }

    protected open(form: ISignUpFormState) {
        this.setState({ terms_open: true, form });
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
    protected async onSignUpSubmit(form: ISignUpFormState) {
        const { firstName, lastName, email, password } = form;
        try {
            await this.props.rootState.signUpUser(firstName, lastName, email, password);
            this.props.history.push({ pathname: "/" });
        } catch (err) {
            this.setState({ error: err.message });
        }
    }
}

const style = {
    topSegment: {
        padding: 0,
        border: 0,
    },
    contentSegment: {
        paddingTop: 30,
    },
    topSegmentMenu: {
        borderBottom: 0,
        borderRadius: 0,
    },
    activeTab: {
        borderRadius: 0,
        color: colors.mainDark,
    },
    inactiveTab: {
        padding: 0,
        borderRadius: 0,
        background: "rgba(0,0,0,.05)",
        borderBottom: "1px solid rgba(34,36,38,.15)",
        color: colors.mainDark,
    },
    tabLink: {
        padding: "1em",
        width: "100%",
    },
};
