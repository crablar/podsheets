import { inject, observer } from "mobx-react";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { Icon, Image, Menu } from "semantic-ui-react";
import { IPodcast } from "../../../lib/interfaces";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

interface ISidebarProps {
    children?: JSX.Element;
    currentPodcast: IPodcast;
}

function isActive() {
    const location = window.location.href;
    return location.endsWith("/#/");
}

export default function Sidebar(props: ISidebarProps) {
    return (
        <nav style={style.sidebarWrapper}>
            <Menu borderless size="tiny" style={style.sidebar} vertical>
                <Image
                    src={props.currentPodcast.imageUrl || "/assets/image.png"}
                    style={style.image} centered spaced />
                <Menu.Item>
                    <Menu.Header style={style.sectionItem}>VIEW</Menu.Header>
                    <Menu.Menu>
                        <Menu.Item style={style.menuItem}>
                            <NavLink to="/stats" activeStyle={style.activeItem}
                                style={style.submenuItem}>
                                <Icon name="line chart" size="large" style={style.navIcon} />
                                Analytics
                            </NavLink>
                        </Menu.Item>
                        <Menu.Item style={style.menuItem}>
                            <a
                                href={`/p/${props.currentPodcast.slug}/`}
                                style={style.submenuItem}
                                target="_blank" >
                                <Icon name="world" size="large" style={style.navIcon} />
                                Website
                            </a>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu.Item>
                <Menu.Item>
                    <Menu.Header style={style.sectionItem}>PAGES</Menu.Header>
                    <Menu.Menu>
                        <Menu.Item style={style.menuItem}>
                            <NavLink
                                to="/"
                                isActive={() => isActive()}
                                activeStyle={style.activeItem}
                                style={style.submenuItem}>
                                <Icon name="microphone" size="large" style={style.navIcon} />
                                Episodes
                                </NavLink>
                        </Menu.Item>
                        <Menu.Item style={style.menuItem}>
                            <NavLink
                                to="/about"
                                activeStyle={style.activeItem}
                                style={style.submenuItem}>
                                <Icon name="info circle" size="large" style={style.navIcon} />
                                About
                                </NavLink>
                        </Menu.Item>
                        <Menu.Item style={style.menuItem}>
                            <NavLink
                                to="/contact"
                                activeStyle={style.activeItem}
                                style={style.submenuItem}>
                                <Icon name="mail" size="large" style={style.navIcon} />
                                Contact
                                </NavLink>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu.Item>
                {props.currentPodcast.advertisingEnabled ?
                <Menu.Item>
                    <Menu.Header style={style.sectionItem}>ADVERTISING</Menu.Header>
                    <Menu.Menu>
                        <Menu.Item style={style.menuItem}>
                            <NavLink
                                to="/campaigns"
                                activeStyle={style.activeItem}
                                style={style.submenuItem}>
                                <Icon name="bullhorn" size="large" style={style.navIcon} />
                                Campaigns
                            </NavLink>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu.Item>
                :
                null
                }
                <Menu.Item>
                    <Menu.Header style={style.sectionItem}>CONFIGURE</Menu.Header>
                    <Menu.Menu>
                        <Menu.Item style={style.menuItem}>
                            <NavLink
                                to="/podcast_info"
                                activeStyle={style.activeItem}
                                style={style.submenuItem}>
                                <Icon name="setting" size="large" style={style.navIcon} />
                                Settings
                            </NavLink>
                        </Menu.Item>
                        <Menu.Item style={style.menuItem}>
                            <NavLink
                                to="/podcast_design"
                                activeStyle={style.activeItem}
                                style={style.submenuItem}>
                                <Icon name="object group" size="large" style={style.navIcon} />
                                Design
                            </NavLink>
                        </Menu.Item>
                        { props.currentPodcast.subscriptionEnabled === "true" ?
                        <Menu.Item style={style.menuItem}>
                            <NavLink
                                to="/subscription"
                                activeStyle={style.activeItem}
                                style={style.submenuItem}>
                                <Icon name="payment" size="large" style={style.navIcon} />
                                Subscription
                            </NavLink>
                        </Menu.Item>
                        : null }
                    </Menu.Menu>
                </Menu.Item>
            </Menu>
            <div style={{
                position: "absolute" as "absolute",
                bottom: 10,
                color: colors.mainDark,
                textAlign: "center",
                width: "11rem",
                fontSize: "85%",
            }}>
                Copyright © 2019 Podsheets
            </div>
        </nav>
    );
}

const style = {
    sidebarWrapper: {
        flex: "0 0 12em",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative" as "relative",
    } as React.CSSProperties,
    sidebar: {
        borderRadius: 0,
        border: "none",
        minHeight: "100%",
        marginBottom: 0,
        width: "15rem",
    },
    menuItem: {
        padding: 0,
        width: "100%",
    },
    submenuItem: {
        ...globalStyles.linkInverted,
        paddingLeft: 10,
        fontSize: "160%",
        display: "flex",
        flex: 1,
        padding: "5px 0px 5px 15px",
    },
    sectionItem: {
        color: colors.mainXLight,
        fontSize: "120%",
        marginTop: "22px",
    },
    activeItem: {
        ...globalStyles.linkInverted,
        paddingLeft: 10,
        fontSize: "160%",
        display: "flex",
        flex: 1,
        padding: "5px 0px 5px 15px",
        background: colors.mainXLight,
    },
    image: {
        width: "100%",
        padding: "10px",
    },
    navIcon: {
        color: colors.mainDark,
        fontSize: "120%",
        marginRight: 10,
    },
};
