import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Button, Divider, Form, Header, Icon, Input, Segment } from "semantic-ui-react";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

interface ISignUpFormProps {
    loading: boolean;
    rootState?: RootState;
    onSubmit: (formState: ISignUpFormState) => void;
}

export interface ISignUpFormState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

@inject("rootState")
@observer
export default class SignUpForm extends React.Component<ISignUpFormProps, ISignUpFormState> {
    public state = { firstName: "", lastName: "", email: "", password: "", passwordConfirmation: "" };

    @autobind
    public render() {

        if (this.props.rootState.env.USER_ACCOUNTS_ENABLED === "false") {
            return (
                <div>
                    <Header style={{color: "gray"}} as="h4">Sign up with one of these services</Header>
                    <Button as="a" href="/auth/facebook">
                        <Icon name="facebook" />Facebook
                </Button>
                    <Button as="a" href="/auth/google">
                        <Icon name="google" /> Google
                </Button>
                </div>
            );
        } else {
            return (
                <div>
                    <Form onSubmit={this.onSubmit} loading={this.props.loading}>
                        <Header as="h1" style={{ color: colors.mainDark }}>
                            Create your account
                    </Header>
                        <Form.Group widths="equal">
                            <Form.Input
                                placeholder="First name *"
                                name="firstName"
                                value={this.state.firstName}
                                onChange={this.onChangeInputField}
                                required />
                            <Form.Input
                                placeholder="Last name *"
                                name="lastName"
                                value={this.state.lastName}
                                onChange={this.onChangeInputField}
                                required />
                        </Form.Group>
                        <Form.Input
                            placeholder="Email Address *"
                            type="email"
                            name="email"
                            value={this.state.email}
                            onChange={this.onChangeInputField}
                            required />
                        <Form.Group widths="equal">
                            <Form.Input
                                placeholder="Password *"
                                type="password"
                                name="password"
                                value={this.state.password}
                                onChange={this.onChangeInputField}
                                required />
                            <Form.Input
                                placeholder="Password confirmation *"
                                type="password"
                                name="passwordConfirmation"
                                value={this.state.passwordConfirmation}
                                onChange={this.onChangeInputField}
                                pattern={this.state.password}
                                required />
                        </Form.Group>
                        <Form.Button style={globalStyles.mainButton}>Submit</Form.Button>
                    </Form>
                    <Divider />
                    <Header as="h4">Or sign up with one of these services</Header>
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
        e.preventDefault();
        this.props.onSubmit({ ...this.state });
    }

}
