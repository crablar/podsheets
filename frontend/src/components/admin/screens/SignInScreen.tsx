import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { Container, Image, Menu, Message, Segment } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import SignInForm, { ISignInFormState } from "../forms/SignInForm";
import LoadingContainer from "../generic/LoadingContainer";

interface ISignInScreenProps { rootState?: RootState; history?: any; }
interface ISignInScreenState { error: string; }

@inject("rootState")
@observer
export default class SignInScreen extends React.Component<ISignInScreenProps, ISignInScreenState> {
    public state: ISignInScreenState = { error: null };

    public render() {
        return (
            <LoadingContainer
                loading={ !!this.props.rootState.loadingCount }
                restrictAccess="nonAuthOnly"
                isAuthenticated={ this.props.rootState.isAuthenticated } >
                <Container style={ globalStyles.content } textAlign="center" text>
                    <Segment attached="top" style={ style.topSegment }>
                        <Menu fluid widths={ 2 } style={ style.topSegmentMenu }>
                            <Menu.Item style={ style.inactiveTab } >
                                <Link to="/sign_up" style={ style.tabLink }>SIGN UP</Link>
                            </Menu.Item>
                            <Menu.Item
                                name="SIGN IN"
                                style={ style.activeTab } />
                        </Menu>
                    </Segment>
                    <Segment style={ style.contentSegment } attached>
                        { this.renderError() }
                        <SignInForm onSubmit={ this.onSignInSubmit } loading={ false } />
                    </Segment>
                </Container>
            </LoadingContainer>
        );
    }

    protected renderError() {
        if (!this.state.error) { return null; }
        return (
            <Message
                error
                header="Error"
                content={ this.state.error }
            />
        );
    }

    @autobind
    protected async onSignInSubmit(form: ISignInFormState) {
        const { email, password } = form;
        try {
            await this.props.rootState.signInUser(email, password);
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
    },
    inactiveTab: {
        padding: 0,
        borderRadius: 0,
        background: "rgba(0,0,0,.05)",
        borderBottom: "1px solid rgba(34,36,38,.15)",
    },
    tabLink: {
        padding: "1em",
        width: "100%",
    },
};
