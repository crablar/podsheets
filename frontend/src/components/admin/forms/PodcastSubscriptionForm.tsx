import axios from "axios";
import { autobind } from "core-decorators";
import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as moment from "moment";
import * as React from "react";
import * as ReactQuill from "react-quill/src/";
import StripeCheckout from "react-stripe-checkout";
import { Button, Container, Form, Header, Icon, Input, Popup, Progress, Radio, Segment, Table } from "semantic-ui-react";
import { price, storage } from "../../../lib/constants";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

import "./styles/PodcastSubscriptionForm.scss";

interface IPodcastSubscriptionFormProps {
    onSubmit: (formState: any) => void;
    onCancelSubscription: () => void;
    currentPodcast: IPodcast;
    rootState?: RootState;
}

export interface IPodcastSubscriptionFields {
    storageLimit?: number;
}

export interface IPodcastSubscriptionFormState {
    fields: IPodcastSubscriptionFields;
    billingOpen: boolean;
}

@inject("rootState")
@observer
// tslint:disable-next-line:max-line-length
export default class PodcastSubscriptionForm extends React.Component<IPodcastSubscriptionFormProps, IPodcastSubscriptionFormState> {

    constructor(props: IPodcastSubscriptionFormProps) {

        super();

        if (props.currentPodcast && props.currentPodcast.storageLimit) {
            let storageLimit = props.currentPodcast.subscription.storageLimit ?
                props.currentPodcast.subscription.storageLimit
                :
                storage.free;

            let current_period_end = 0;
            let canceled_at = 0;

            if (props.currentPodcast.subscription) {
                current_period_end = props.currentPodcast.subscription.data.current_period_end * 1000;
                canceled_at = props.currentPodcast.subscription.data.canceled_at;
            }

            if (canceled_at) {
                canceled_at *= 1000;
            }

            const now = (new Date()).getTime();

            if (!(now < current_period_end && !canceled_at)) {
                storageLimit = storage.free;
            }
            this.state = {
                fields: { storageLimit },
                billingOpen: false,
            };
        } else {
            this.state = {
                fields: { storageLimit: storage.free },
                billingOpen: false,
            };
        }
    }

    public async onToken(token) {
        let limit = this.state.fields.storageLimit;
        if (limit === storage.free) {
            limit = storage.basic;
        }
        if (token && token.id) {
            await this.props.onSubmit({
                token,
                storageLimit: limit,
            });
        }
    }

    public async cancelSubscription() {
        this.props.onCancelSubscription();
    }

    @autobind
    public render() {
        let current_period_end = 0;
        let canceled_at = 0;
        let planPrice = 0;

        if (this.props.currentPodcast.subscription) {
            current_period_end = this.props.currentPodcast.subscription.data.current_period_end * 1000;
            canceled_at = this.props.currentPodcast.subscription.data.canceled_at;

            switch (this.props.currentPodcast.subscription.storageLimit) {
                case storage.basic:
                    planPrice = price.basic;
                    break;
                case storage.intermediate:
                    planPrice = price.intermediate;
                    break;
                case storage.advanced:
                    planPrice = price.advanced;
                    break;
            }
        }

        if (canceled_at) {
            canceled_at *= 1000;
        }

        const now = (new Date()).getTime();
        const storageLimit = _.get(this.props, "rootState.podcast.subscription.storageLimit", storage.free);
        const usedStorage = _.get(this.props, "rootState.podcast.usedStorage", 0).toFixed(2);

        return (
            <Segment style={{ width: "75%", color: colors.mainDark, paddingLeft: 0 }} basic>
                <Header as="h2" style={style.title}>
                    Subscription
                        <div style={style.radioContainer}>
                        <Button
                            disabled={!this.props.currentPodcast.subscription}
                            onClick={() => this.onBillingHistory()} style={style.payButton}>
                            {this.state.billingOpen ?
                                "Subscription options"
                                :
                                "Billing History"
                            }
                        </Button>
                        {now < current_period_end && !canceled_at ?
                            <Form.Button
                                style={style.cancelButton}
                                onClick={() => this.cancelSubscription()}>
                                Cancel Subscription
                                </Form.Button>
                            :
                            <StripeCheckout
                                ComponentClass="div"
                                token={(token) => this.onToken(token)}
                                stripeKey={this.props.rootState.env.STRIPE_PUBLISHABLE_KEY}
                            >
                                <div style={style.payButton}>
                                    Pay With Card
                                    </div>
                            </StripeCheckout>
                        }
                    </div>
                </Header>
                {this.state.billingOpen ?
                    <Container>
                        <Header as="h4" style={{ color: colors.mainXLight }} >
                            The following is your billing history:
                        </Header>
                        {this.props.rootState.billingHistory.length > 0 ?
                            <Table basic>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell
                                            style={style.tableHeader}>Date</Table.HeaderCell>
                                        <Table.HeaderCell
                                            style={style.tableHeader}>Description</Table.HeaderCell>
                                        <Table.HeaderCell
                                            style={style.tableHeader}>Amount</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {_.map((this.props.rootState.billingHistory as any), (
                                        { created, statement_descriptor, amount }) => (
                                            <Table.Row key={created}>
                                                <Table.Cell
                                                    style={style.billingItem}>{moment(created).format("L")}</Table.Cell>
                                                <Table.Cell
                                                    style={style.billingItem}>{statement_descriptor}</Table.Cell>
                                                <Table.Cell
                                                    style={style.billingItem}>${amount / 100}</Table.Cell>
                                            </Table.Row>
                                        ))}
                                </Table.Body>
                            </Table>
                            :
                            <Header as="h4" style={{ color: colors.mainXLight }} >
                                We don't have any billing history to show
                            </Header>
                        }
                    </Container>
                    :
                    <div>
                        <p style={globalStyles.workspaceContentText} >
                            {now < current_period_end && !canceled_at ?
                                "$" + planPrice + " billed monthly"
                                :
                                "You haven't selected a subcription yet."
                            }
                        </p>
                        <div style={{ paddingTop: "15px", paddingBottom: "20px" }}><p style={globalStyles.workspaceContentText}>*Payments are processed with Stripe.</p></div>
                        <Container style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                        }}>
                            <Progress
                                className="purpleProgress"
                                style={{
                                    flex: 1,
                                    backgroundColor: "white",
                                    border: "1px solid lightgray",
                                }}
                                percent={(Number(usedStorage) / storageLimit) * 100} />
                            <span style={{
                                paddingTop: 5,
                                marginLeft: 15,
                            }}>
                                You have used {usedStorage} MB of {storageLimit} MB this month.
                            </span>
                        </Container>
                        <div onClick={() => {
                            this.onChangeStorageField(null, { value: storage.basic });
                        }} style={style.planContainer}>
                            <Header style={style.planHeader}>Basic</Header>
                            <Header style={style.planDescription} as="h4">
                                {storage.basic} MB of storage per month
                            </Header>
                            <Header style={style.planDescription} as="h4">
                                Good for uploading weekly 30 minute episodes
                        </Header>
                            <div style={style.radioContainer}>
                                <Radio
                                    style={style.radioButton}
                                    name="radioGroup"
                                    value={storage.basic}
                                    checked={this.state.fields.storageLimit === storage.basic}
                                    onChange={this.onChangeStorageField}
                                />
                                <span>$5 per month</span>
                            </div>
                        </div>
                        <div onClick={() => {
                            this.onChangeStorageField(null, { value: storage.intermediate });
                        }} style={style.planContainer}>
                            <Header style={style.planHeader}>Intermediate</Header>
                            <Header
                                style={style.planDescription}
                                as="h4">{storage.intermediate} MB of storage per month</Header>
                            <Header style={style.planDescription} as="h4">
                                Good for uploading weekly 60 minute episodes
                        </Header>
                            <div style={style.radioContainer}>
                                <Radio
                                    style={style.radioButton}
                                    name="radioGroup"
                                    value={storage.intermediate}
                                    checked={this.state.fields.storageLimit === storage.intermediate}
                                    onChange={this.onChangeStorageField}
                                />
                                <span>$10 per month</span>
                            </div>
                        </div>
                        <div onClick={() => {
                            this.onChangeStorageField(null, { value: storage.advanced });
                        }} style={style.planContainer}>
                            <Header style={style.planHeader}>Advanced</Header>
                            <Header
                                style={style.planDescription}
                                as="h4">{storage.advanced} MB of storage per month</Header>
                            <Header style={style.planDescription} as="h4">
                                Good for uploading 3 weekly 60 minute episodes
                        </Header>
                            <div style={style.radioContainer}>
                                <Radio
                                    style={style.radioButton}
                                    name="radioGroup"
                                    value={storage.advanced}
                                    checked={this.state.fields.storageLimit === storage.advanced}
                                    onChange={this.onChangeStorageField}
                                />
                                <span>$20 per month</span>
                            </div>
                        </div>
                    </div>
                }
            </Segment>
        );
    }

    @autobind
    protected onChangeStorageField(e: any, content: any) {
        if (content) {
            const fields = { ...this.state.fields, storageLimit: content.value };
            this.setState({ fields });
        }
    }

    @autobind
    protected async onSubmit(e: React.SyntheticEvent<Event>) {
        console.warn("DEBUG");
        e.preventDefault();
    }

    @autobind
    protected async onBillingHistory() {
        this.setState({ billingOpen: !this.state.billingOpen });
    }
}

const style = {
    title: {
        cursor: "pointer",
        textAlign: "left",
        ...globalStyles.text,
        whiteSpace: "nowrap",
        overflow: "hidden" as "hidden",
        textOverflow: "ellipsis",
    },
    formInput: {
        minWidth: "50%",
        maxWidth: 250,
    },
    planDescription: {
        color: colors.mainDark,
        marginTop: 0,
    },
    planContainer: {
        width: "100%",
        border: "1px solid lightgray",
        padding: 15,
        paddingLeft: 30,
        paddingRight: 30,
        cursor: "pointer",
    },
    planHeader: {
        textAlign: "center",
        color: colors.mainDark,
        fontSize: "160%",
    },
    radioContainer: {
        display: "flex",
        flexDirection: "row" as "row",
        flex: 1,
        justifyContent: "flex-end" as "flex-end",
    },
    radioButton: {
        color: colors.mainXLight,
        marginRight: 5,
    },
    cancelButton: {
        color: "white",
        backgroundColor: colors.mainDark,
        fontSize: "60%",
        padding: 15,
        paddingTop: 15,
        paddingBottom: 15,
        borderRadius: 3,
        cursor: "pointer",
    },
    payButton: {
        color: "white",
        backgroundColor: colors.mainDark,
        fontSize: "60%",
        padding: 15,
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 3,
        cursor: "pointer",
    },
    tableHeader: {
        color: colors.mainDark,
        fontWeight: 900 as 900,
        fontSize: "130%",
    },
    billingItem: {
        color: colors.mainXLight,
    },
};
