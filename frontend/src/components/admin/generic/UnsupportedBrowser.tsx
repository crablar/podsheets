import { inject, observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { Grid, Header } from "semantic-ui-react";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

export default class UnsupportedBrowser extends React.Component<{}, {}> {
    public render() {
        return (
            <Grid centered style={style.content}>
                <Grid.Row>
                    <Header style={{ color: colors.mainDark }} as="h1">
                        Unsupported Browser
                    </Header>
                </Grid.Row>
                <Grid.Row>
                    <Header style={{ color: colors.mainDark }} as="h3">
                        To start creating a podcast, please return to
                     Podsheets on your desktop or laptop computer.
                    </Header>
                </Grid.Row>
            </Grid>
        );
    }
}

const style = {
    content: {
        padding: 30,
    },
};
