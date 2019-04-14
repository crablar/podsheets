import * as React from "react";
import { Redirect } from "react-router-dom";
import { Image, Segment } from "semantic-ui-react";
import { globalStyles } from "../../../lib/styles";
import Sidebar from "./Sidebar";

interface ILoadingContainerProps {
    loading: boolean;
    isAuthenticated?: boolean;
    restrictAccess?: "authOnly" | "nonAuthOnly";
    podcastRequired?: any;
}

export default class LoadingContainer extends React.Component<ILoadingContainerProps, {}> {

    public render() {
        if (this.props.loading) {
            return this.renderLoadingState();
        } else if (this.props.restrictAccess) {
            if (!this.props.isAuthenticated && this.props.restrictAccess === "authOnly") {
                return (<Redirect to={ { pathname: "/sign_in" } } />);
            } else if (this.props.isAuthenticated && this.props.restrictAccess === "nonAuthOnly") {
                return (<Redirect to={ { pathname: "/" } } />);
            }
        }
        // NOTE: redirect to create_podcast is the user doesn't have any podcast
        if (Object.keys(this.props).indexOf("podcastRequired") !== -1 && !this.props.podcastRequired) {
            return (<Redirect to={ { pathname: "/create_podcast" } } />);
        }
        return (<div>{ this.props.children }</div>);
    }

    protected renderLoadingState() {
        return (
            <div style={ globalStyles.contentWrapper } >
                <main style={ globalStyles.content }>
                    <Segment style={ style.segment } loading>
                        <Image src="/assets/paragraph.png" style={ style.loadingImage } />
                    </Segment>
                </main>
            </div>
        );
    }
}

const style = {
    segment: {
        border: "none",
        boxShadow: "none",
    },
    loadingImage: {
        width: "100%",
    },
};
