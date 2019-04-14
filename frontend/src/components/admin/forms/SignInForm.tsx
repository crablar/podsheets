import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Button, Divider, Form, Header, Icon, Input, Segment } from "semantic-ui-react";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

interface ISignInFormProps {
    loading: boolean;
    rootState?: RootState;
    onSubmit: (formState: ISignInFormState) => void;
}

export interface ISignInFormState {
    email: string;
    password: string;
}

@inject("rootState")
@observer
export default class SignInForm extends React.Component<ISignInFormProps, ISignInFormState> {
    public state = { email: "", password: "" };

    @autobind
    public render() {

        if (this.props.rootState.env.USER_ACCOUNTS_ENABLED === "false") {
            return (<div>
                <Form onSubmit={this.onSubmit} loading={this.props.loading}>
                    <Header as="h4" style={{ color: "gray" }}>Sign in with one of these services</Header>
                    <Button as="a" href="/auth/facebook">
                        <Icon name="facebook" />Facebook
                    </Button>
                    <Button as="a" href="/auth/google">
                        <Icon name="google" /> Google
                    </Button>
                </Form>
            </div>);
        } else {
            return (
                <div>
                    <Form onSubmit={this.onSubmit} loading={this.props.loading}>
                        <Header as="h1" style={{ color: colors.mainDark }}>Log Into Your Account</Header>
                        <Form.Input
                            placeholder="Email Address *"
                            type="email"
                            name="email"
                            value={this.state.email}
                            onChange={this.onChangeInputField}
                            required />
                        <Form.Input
                            placeholder="Password *"
                            type="password"
                            name="password"
                            value={this.state.password}
                            onChange={this.onChangeInputField}
                            required />
                        <Form.Button style={globalStyles.mainButton}>Submit</Form.Button>
                    </Form>
                    <Divider />
                    <Header as="h4">Or sign in with one of these services</Header>
                    <Button as="a" href="/auth/facebook">
                        <Icon name="facebook" />Facebook
                </Button>
                    <Button as="a" href="/auth/google">
                        <Icon name="google" /> Google
                </Button>
                </div>
            );
        }
    }

    @autobind
    protected onChangeInputField(e: React.SyntheticEvent<HTMLInputElement>, input: any) {
        if (input && input.name) { this.setState({ [input.name]: input.value }); }
    }

    @autobind
    protected onSubmit(e: React.SyntheticEvent<Event>) {
        this.props.onSubmit({ ...this.state });
        e.preventDefault();

    }

}
