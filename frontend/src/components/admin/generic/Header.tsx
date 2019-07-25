import { inject, observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { Icon, Menu } from "semantic-ui-react";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";

interface IHeaderProps {
    rootState?: RootState;
}

function renderAuthLink(isAuthenticated: boolean) {
    return isAuthenticated ?
        (<Link to="/logout" style={style.navLink}>Sign Out</Link>) :
        (<Link to="/sign_in" style={style.navLink}>Sign in</Link>);
}

@inject("rootState")
@observer
export default class Header extends React.Component<IHeaderProps, {}> {
    public render() {
        return (
            <Menu borderless style={style.menu} inverted>
                <Menu.Item>
                    <a href="/" style={{paddingTop: "5px"}}><img src="assets/podsheets-logo.png" style={{ height: "58px" }} /></a>
                </Menu.Item>
                <Menu.Menu position="right">
                    <Menu.Item>
                        <a target="_blank" style={{ color: "white" }} href="https://findcollabs.com/project/IQNarf2tJ8Un4esfoXck">
                            <img src="assets/collab-white.svg" style={{ height: "1.25em", marginTop: "0.25em" }} />
                        </a>
                    </Menu.Item>
                    <Menu.Item>
                        <a target="_blank" style={{ color: "white" }} href="https://github.com/crablar/podsheets">
                            <Icon name="github" size="large"/>
                        </a>
                    </Menu.Item>
                    <Menu.Item>
                        <a target="_blank" href="https://medium.com/podsheets-blog" style={style.navLink}>Blog</a>
                    </Menu.Item>
                    <Menu.Item>
                        <Link to="/about_us" style={style.navLink}>About</Link>
                    </Menu.Item>
                    <Menu.Item>
                        {renderAuthLink(this.props.rootState.isAuthenticated)}
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        );
    }
}

const style = {
    menu: {
        marginBottom: 0,
        background: colors.mainDark,
        borderRadius: 0,
        height: 68,
        paddingRight: 30,
    },
    podsheets: {
        ...globalStyles.linkInvertedLight,
        fontSize: "140%",
    },
    navLink: {
        ...globalStyles.linkInvertedLight,
        fontSize: "120%",
        fontWeight: 500,
    } as React.CSSProperties,
};
