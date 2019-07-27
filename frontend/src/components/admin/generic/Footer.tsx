import * as React from "react";
import { Link } from "react-router-dom";
import { Container, Icon } from "semantic-ui-react";
import { colors } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

export default class Footer extends React.Component<{}, {}> {
    public render() {

        return (
            <div style={{ width: "100%", backgroundColor: colors.mainDark, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <div style={{
                    padding: 25,
                    color: "white",
                    width: "33%",
                    textAlign: "left",
                }} >
                    Built with <span><Icon name="heart" style={{ color: "red" }} size="small"/></span>for podcasters by podcasters
                </div>
                <div style={{
                    paddingTop: 25,
                    paddingBottom: 25,
                    color: "white",
                    width: "33%",
                    textAlign: "center",
                }} >
                    Copyright © 2019 Podsheets, <Link style={{ color: "white" }} to="/terms">Terms of use</Link>
                </div>
                <div
                style={{
                    padding: 25,
                    color: "white",
                    width: "33%",
                    textAlign: "right",
                }}>
                    <a style={{ color: "white", paddingRight: "5em" }} href="https://twitter.com/podsheets">
                        <Icon name="twitter" size="large"/>
                    </a>
                </div>
            </div>
        );
    }
}
