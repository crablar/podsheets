import * as MobileDetect from "mobile-detect";
import { observer, Provider } from "mobx-react";
import * as React from "react";
import { HashRouter as Router, Redirect, Route } from "react-router-dom";
import rootState from "../../state/RootState";
import Header from "./generic/Header";
import UnsupportedBrowser from "./generic/UnsupportedBrowser";
import AboutUsScreen from "./screens/AboutUsScreen";
import CampaignsScreen from "./screens/CampaignsScreen";
import EditOrCreateEpisodeScreen from "./screens/EditOrCreateEpisodeScreen";
import EditOrCreatePodcastScreen from "./screens/EditOrCreatePodcastScreen";
import PodcastAboutScreen from "./screens/PodcastAboutScreen";
import PodcastContactScreen from "./screens/PodcastContactScreen";
import PodcastDesignScreen from "./screens/PodcastDesignScreen";
import PodcastHomeScreen from "./screens/PodcastHomeScreen";
import PodcastStatsScreen from "./screens/PodcastStatsScreen";
import PodcastSubscriptionScreen from "./screens/PodcastSubscriptionScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import TermsOfUseScreen from "./screens/TermsOfUseScreen.jsx";

function browserSwitch(component) {

    const md = new MobileDetect(window.navigator.userAgent);

    if (md.mobile()) {
        return <UnsupportedBrowser />;
    }

    return component;
}

@observer
class App extends React.Component<{}, {}> {
    public render() {
        return (
            <Provider rootState={rootState} >
                <Router>
                    <div>
                        <Header />
                        <Route
                            path="/sign_up"
                            render={() => <SignUpScreen />}
                            key="signUn"
                            exact />
                        <Route
                            path="/sign_in"
                            render={() => <SignInScreen />}
                            key="signIn"
                            exact />
                        <Route
                            path="/logout"
                            render={this.logout}
                            key="logout"
                            exact />
                        <Route
                            path="/create_podcast"
                            render={(props: any) => browserSwitch(<EditOrCreatePodcastScreen {...props} />)}
                            key="createPodcast"
                            exact />
                        <Route
                            path="/about"
                            render={(props: any) => browserSwitch(<PodcastAboutScreen {...props} />)}
                            key="podcastAbout"
                            exact />
                        <Route
                            path="/podcast_info"
                            render={(props: any) => browserSwitch(
                                <EditOrCreatePodcastScreen {...props} editingPodcast={true} />)}
                            key="podcastInfo"
                            exact />
                        <Route
                            path="/stats"
                            render={(props: any) => browserSwitch(<PodcastStatsScreen {...props} />)}
                            key="podcastStats"
                            exact />
                        <Route
                            path="/contact"
                            render={(props: any) => browserSwitch(<PodcastContactScreen {...props} />)}
                            key="podcastContact"
                            exact />
                        <Route
                            path="/podcast_design"
                            render={(props: any) => browserSwitch(<PodcastDesignScreen {...props} />)}
                            key="podcastDesign"
                            exact />
                        <Route
                            path="/new_episode"
                            render={(props: any) => browserSwitch(<EditOrCreateEpisodeScreen {...props} />)}
                            key="createEpisode"
                            exact />
                        <Route
                            path="/episode/:episodeId"
                            render={(props: any) => browserSwitch(
                                <EditOrCreateEpisodeScreen {...props} editingEpisode={true} />)}
                            key="editEpisode"
                            exact />
                        <Route
                            path="/about_us"
                            render={(props: any) => <AboutUsScreen {...props} />}
                            key="aboutUs"
                            exact />
                        <Route
                            path="/subscription"
                            render={(props: any) => browserSwitch(<PodcastSubscriptionScreen {...props} />)}
                            key="subscription"
                            exact />
                        <Route
                            path="/terms"
                            render={(props: any) => <TermsOfUseScreen {...props} />}
                            key="terms"
                            exact />
                        <Route
                            path="/campaigns"
                            render={(props: any) => <CampaignsScreen {...props} />}
                            key="campagins"
                            exact />
                        <Route
                            path="/"
                            render={(props: any) => <PodcastHomeScreen {...props} />}
                            key="index"
                            exact />
                    </div>
                </Router>
            </Provider>
        );
    }

    protected logout() {
        rootState.logout();
        return (<Redirect to={{ pathname: "/sign_in" }} />);
    }
}

const Root = (<App />);
export default Root;
