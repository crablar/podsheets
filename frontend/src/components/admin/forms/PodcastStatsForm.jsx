import { inject, observer } from "mobx-react";
import { autobind } from "core-decorators";
import * as React from "react";
import {
    Button, Divider, Dropdown, Form, Header, Icon, Image, Input, Message, Reveal, Segment, Table
} from "semantic-ui-react";
import * as moment from "moment";
import { IPodcast } from "../../../lib/interfaces";
import { colors } from "../../../lib/styles";
import { globalStyles } from "../../../lib/styles";

import Highlight from "../utils/highlight.jsx";

import {
    DiscreteColorLegend,
    HorizontalGridLines,
    LineSeries,
    makeWidthFlexible,
    XAxis,
    XYPlot,
    YAxis,
} from "react-vis";

const FlexibleXYPlot = makeWidthFlexible(XYPlot);

@inject("rootState")
@observer
export default class PodcastForm extends React.Component {

    state = {
        lastDrawLocation: null,
        series: [
            {
                title: "Downloads",
                disabled: false,
                data: this.getSeriesData(),
                color: colors.mainVibrant,
            },
        ],
        column: null,
        data: this.getTableData(),
        direction: null,
    };

    handleSort = clickedColumn => () => {
        const { column, data, direction } = this.state

        if (column !== clickedColumn) {
            this.setState({
                column: clickedColumn,
                data: _.sortBy(data, [clickedColumn]),
                direction: 'ascending',
            })

            return
        }

        this.setState({
            data: data.reverse(),
            direction: direction === 'ascending' ? 'descending' : 'ascending',
        })
    }

    render() {

        const { series, lastDrawLocation, column, data, direction } = this.state;

        const episodeData = this.getTableData();

        let totalDownloads = 0;
        _.forIn(episodeData, (value) => {
            totalDownloads += value.downloads;
        });

        const isEnoughData = this.isEnoughData();

        const seriesData = isEnoughData ? series : [];

        if (this.props.rootState.publishedEpisodes.length === 0) {
            return (
                <Segment style={{ width: "75%", paddingLeft: 0 }} basic>
                    <Header as="h2" style={globalStyles.title}>
                            Analytics
                        <div style={{ marginTop: '1em' }}>
                            <div style={style.noEpisodeText}>
                                Analytics appear after a published episode is heard
                            </div>
                            <div style={style.noEpisodeText}>
                                Publish an episode to get started
                            </div>
                        </div>
                    </Header>
                </Segment>
            )
        }
        return (
            <Segment style={{ width: "75%", paddingLeft: 0 }} basic>
                <Header as="h1" style={{ color: colors.mainDark, display: "flex", flexDirection: "row" }}>
                    <div style={globalStyles.title}>
                        Analytics
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={style.downloadCount}>
                            {totalDownloads}
                        </div>
                        <div style={style.downloadCount}>
                            Total Downloads
                    </div>
                    </div>
                </Header>

                <div style={{ position: "relative" }}>
                    <div className="legend">
                        <DiscreteColorLegend
                            width={180}
                            items={seriesData} />
                    </div>
                    <div className="chart no-select">
                        <FlexibleXYPlot
                            color={colors.mainVibrant}
                            stroke={colors.mainVibrant}
                            animation
                            xType="time"
                            xDomain={lastDrawLocation && [lastDrawLocation.left, lastDrawLocation.right]}
                            height={300}>

                            <HorizontalGridLines />

                            <YAxis />
                            <XAxis />

                            {seriesData.map(entry => (
                                <LineSeries
                                    key={entry.title}
                                    data={entry.data}
                                />
                            ))}

                            <Highlight onBrushEnd={(area) => {
                                (this as any).setState({
                                    lastDrawLocation: area,
                                });
                            }} />
                        </FlexibleXYPlot>
                        {isEnoughData ?
                            null
                            :
                            <div style={{
                                position: "absolute",
                                top: 100,
                                left: 0,
                                width: "100%",
                                textAlign: "center",
                            }}>
                                There is not enough data to display, please check back later
                                </div>
                        }
                    </div>

                    <Button style={style.resetButton} onClick={() => {
                        this.setState({ lastDrawLocation: null });
                    }}>
                        Reset Zoom
                    </Button>
                </div>
                <Table sortable celled fixed>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell sorted={column === 'title' ? direction : null} onClick={this.handleSort('title')}>
                                Title
                            </Table.HeaderCell>
                            <Table.HeaderCell sorted={column === 'date' ? direction : null} onClick={this.handleSort('date')}>
                                Date
                            </Table.HeaderCell>
                            <Table.HeaderCell sorted={column === 'downloads' ? direction : null} onClick={this.handleSort('downloads')}>
                                Downloads
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {_.map(this.state.data, ({ title, date, downloads }) => (
                            <Table.Row key={title}>
                                <Table.Cell>{title}</Table.Cell>
                                <Table.Cell>{moment(date).format('L')}</Table.Cell>
                                <Table.Cell>{downloads}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>

            </Segment>
        );
    }

    @autobind
    getSeriesData() {
        const statistics = this.props.currentPodcast.statistics;
        return _.map(statistics, (value, key) => {
            const x = new Date(Number(key));
            return {
                x,
                y: value,
            };
        })
    }

    @autobind
    isEnoughData() {
        const statistics = this.props.currentPodcast.statistics;
        const keys = _.map(statistics, (value, key) => {
            return { key };
        })
        const sorted = _.sortBy(keys, (o) => o.key);
        if (sorted.length >= 2) {
            const diff = ((sorted[sorted.length - 1].key - sorted[0].key)) / 86400000;
            return diff > 1;

        } else {
            return false;
        }
    }

    @autobind
    getTableData() {
        const episodes = this.props.rootState.publishedEpisodes;
        return _.map(episodes, (episode) => {
            return {
                title: episode.title,
                date: episode.publishedAt,
                downloads: episode.downloadsCount,
            };
        })
    }
}

const style = {
    title: {
        position: "absolute" as "absolute",
        top: 10,
        left: 0,
    },
    downloadCount: {
        display: "flex",
        flex: 1,
        justifyContent: "center" as "center",
        color: colors.mainVibrant,
        fontWeight: 900 as 900,
        fontSize: "80%",
    },
    resetButton: {
        position: "absolute" as "absolute",
        top: 0,
        right: 0,
        backgroundColor: colors.mainDark,
        color: "white",
        border: "none",
    },
    noEpisodeText: {
        color: colors.mainVibrant,
        fontSize: "70%",
    }
};
