import { Provider } from "mobx-react";
import * as React from "react";
import { HashRouter as Router, Redirect, Route } from "react-router-dom";
import { theme } from "../../lib/styles";
import publicClientState from "../../state/PublicClientState";
import Footer from "./generic/Footer";
import Header from "./generic/Header";

import PublicPodcastAboutScreen from "./screens/PublicPodcastAboutScreen";
import PublicPodcastContactScreen from "./screens/PublicPodcastContactScreen";
import PublicPodcastEpisodeScreen from "./screens/PublicPodcastEpisodeScreen";
import PublicPodcastHomeScreen from "./screens/PublicPodcastHomeScreen";

class App extends React.Component<{}, {}> {
    public render() {
        return (
            <Provider publicClientState={publicClientState} >
                <Router>
                    <div style={{
                        backgroundColor: theme[publicClientState.podcast.theme || "light"].backgroundColor,
                        overflow: "scroll",
                    }}>
                        <Header />
                        <Route
                            path="/"
                            render={(props: any) => (<PublicPodcastHomeScreen />)}
                            key="index"
                            exact />
                        <Route
                            path="/about"
                            render={(props: any) => (<PublicPodcastAboutScreen />)}
                            key="about"
                            exact />
                        <Route
                            path="/contact"
                            render={(props: any) => (<PublicPodcastContactScreen />)}
                            key="contact"
                            exact />
                        <Route
                            path="/episode/:episodeTitle"
                            render={(props: any) => <PublicPodcastEpisodeScreen {...{ ...this.props, ...props }} />}
                            key="editEpisode"
                            exact />
                        <Footer />
                    </div>
                </Router>
            </Provider>
        );
    }
}

const Root = (<App />);
export default Root;
