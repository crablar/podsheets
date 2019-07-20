import * as React from "react";
import { Link } from "react-router-dom";
import { Container, Icon } from "semantic-ui-react";
import { colors } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

export default class Footer extends React.Component<{}, {}> {
    public render() {

        return (
            <div style={{
                width: "100%",
                backgroundColor: colors.mainDark,
                padding: 25,
                textAlign: "center",
                color: "white",
                marginLeft: 0,
                marginRight: 0,
            }} >
                Copyright © 2019 Podsheets, <Link style={{ color: "white" }} to="/terms">Terms of use</Link>
            </div>
        );
    }
}
