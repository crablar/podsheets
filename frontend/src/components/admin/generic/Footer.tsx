import * as React from "react";
import { Link } from "react-router-dom";
import { Container, Icon } from "semantic-ui-react";
import { colors } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

export default class Footer extends React.Component<{}, {}> {
    public render() {

        return (
            <div style={{ width: "100%", backgroundColor: colors.mainDark, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <div style={{
                    padding: 25,
                    color: "white",
                }} >
                    Built with <span><Icon name="heart" style={{ color: "red" }} size="small"/></span>for podcasters by podcasters
                </div>
                <div style={{
                    padding: 25,
                    color: "white",
                }} >
                    Copyright © 2019 Podsheets, <Link style={{ color: "white" }} to="/terms">Terms of use</Link>
                </div>
                <div
                style={{
                    padding: 25,
                    alignSelf: "flex-start",
                    color: "white",
                }}>
                    <a style={{ color: "white", padding: "0 1em" }} href="https://findcollabs.com/project/IQNarf2tJ8Un4esfoXck">
                        <Icon name="compass" size="large"/>
                    </a>
                    <a style={{ color: "white", padding: "0 1em" }} href="https://github.com/crablar/podsheets">
                        <Icon name="github" size="large"/>
                    </a>
                    <a style={{ color: "white", padding: "0 1em" }} href="https://twitter.com/podsheets">
                        <Icon name="twitter" size="large"/>
                    </a>
                </div>
            </div>
        );
    }
}
