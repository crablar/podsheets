import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Container, Grid, Header, Image } from "semantic-ui-react";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import Footer from "../generic/Footer";

interface IAboutUsScreenProps {
    rootState?: RootState;
    history?: any;
}

@inject("rootState")
@observer
export default class AboutUsScreen extends React.Component<IAboutUsScreenProps, {}> {

    public render() {
        return (
            <div>
                <Grid doubling centered style={style.content}>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={16} width={12} textAlign="center">
                            <Header style={style.mainTitle} as="h1">
                                Podsheets is built by podcasters for podcasters
                        </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={14} width={8} computer={6} textAlign="center">
                            <Header style={style.subTitle} as="h3">
                                We know first hand how difficult it can be to start a podcast.
                             We are on a mission to make it extremely simple to start a podcast and monetize it.
                        </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={14} width={8} textAlign="center">
                            <Header style={style.teamText} as="h1">
                                Founders
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row style={{ marginTop: "5vh" }} width={16} columns={3}>
                        <Grid.Column mobile={14} width={3} computer={3} textAlign="center">
                            <Image shape="circular" centered width={150 as 4} src="/assets/jeff.jpg" />
                            <Header style={style.founderName} as="h1">
                                Jeff Meyerson
                        </Header>
                            <Header style={style.founderPosition} as="h3">
                                CEO
                        </Header>
                        </Grid.Column>
                        <Grid.Column mobile={14} width={3} computer={3} textAlign="center">
                            <Image shape="circular" centered width={150 as 4} src="/assets/mo.png" />
                            <Header style={style.founderName} as="h1">
                                Mo Rehman
                        </Header>
                            <Header style={style.founderPosition} as="h3">
                                CTO
                        </Header>
                        </Grid.Column>
                        <Grid.Column mobile={14} width={3} computer={3} textAlign="center">
                            <Image shape="circular" centered width={150 as 4} src="/assets/andrew.png" />
                            <Header style={style.founderName} as="h1">
                                Andrew Lloyd
                        </Header>
                            <Header style={style.founderPosition} as="h3">
                                Director of open source & release
                        </Header>
                        </Grid.Column>
                        <Grid.Column mobile={14} width={3} computer={3} textAlign="center">
                            <Image shape="circular" centered width={150 as 4} src="/assets/edaena.jpg" />
                            <Header style={style.founderName} as="h1">
                                Edaena Salinas
                        </Header>
                            <Header style={style.founderPosition} as="h3">
                                Advisor
                        </Header>
                        </Grid.Column>
                        <Grid.Column mobile={14} width={3} computer={3} textAlign="center">
                            <Image shape="circular" centered width={150 as 4} src="/assets/erika.jpg" />
                            <Header style={style.founderName} as="h1">
                                Erika Hokanson
                        </Header>
                            <Header style={style.founderPosition} as="h3">
                                Advisor
                        </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={14} width={8} computer={8} textAlign="center">
                            <p style={style.textParagraph}>
                                Jeff created
                                 <a href="https://softwareengineeringdaily.com"> Software Engineering Daily</a>.
                             A daily podcast about Software topics. Jeff knows the obstacles
                              of launching and maintaining
                              a podcast and is committed to changing this. Previously
                               Jeff was a Software Engineer at Amazon.
                        </p>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={14} width={8} computer={8} textAlign="center">
                            <p style={style.textParagraph}>
                                Mo is a podcast enthusiast and currently a student at UWaterloo. Previously, Mo was at Facebook & LinkedIn working on data science & infrastructure teams.
                        </p>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={14} width={8} computer={8} textAlign="center">
                            <p style={style.textParagraph}>
                            Andrew is an Air Force veteran and is currently a platform engineer at Starbucks.
                            He has been contributing to the <a href="https://github.com/softwareengineeringdaily"> Software Engineering Daily</a> open source ecosystem for several years.
                        </p>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={14} width={8} computer={8} textAlign="center">
                            <p style={style.textParagraph}>
                                 Edaena created <a href="https://thewomenintechshow.com">The Women in Tech Show: </a>
                             technical interviews with prominent women in tech.
                              Edaena saw that launching a podcast was not easy.
                               She is working to improve this. Edaena is a Software
                                Engineer at Microsoft since 2014.
                        </p>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={14} width={8} computer={8} textAlign="center">
                            <p style={style.textParagraph}>
                                Erika joined
                                 <a href="https://softwareengineeringdaily.com"> Software Engineering Daily</a>.
                             She has been successfully managing the show and the operations.
                             Erika wants to make it easy to manage a podcast.
                        </p>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Footer />
            </div >
        );
    }

}

const style = {
    content: {
        padding: "6vh",
    },
    mainTitle: {
        color: colors.mainDark,
        fontSize: "220%",
    },
    subTitle: {
        color: colors.mainVibrant,
    },
    teamText: {
        color: colors.mainVibrant,
        marginTop: "5vw",
    },
    founderName: {
        color: colors.mainLVibrant,
    },
    founderPosition: {
        color: colors.mainVibrant,
        marginTop: 10,
    },
    textParagraph: {
        color: colors.mainVibrant,
        textAlign: "justify",
        fontSize: "120%",
        marginTop: "5vh",
    },
};
