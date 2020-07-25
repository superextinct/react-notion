import * as React from "react";
import fetch from "node-fetch";

type PlayerProps = {
    id: string;
    url: string;
};

type DataState = {
    id: string;
    url: string;
    isLoaded: boolean;
    signedUrl: string;
}

class Player extends React.Component<{ id: string, url: string}, DataState> {
    constructor(props: PlayerProps) {
        super(props);
        this.state = {
            id: props.id,
            url: props.url,
            isLoaded: false,
            signedUrl: ''
        };
    }

    componentDidMount() {
        console.log(`https://notion.superextinct.workers.dev/v1/files/${this.props.id}/${this.props.url}`);
        fetch(`https://notion.superextinct.workers.dev/v1/files/${this.props.id}/${this.props.url}`)
            .then(res => res.json())
            .then( (result) => {
                const res = JSON.parse(result);
                this.setState({
                    isLoaded: true,
                    signedUrl: res.signedUrls[0]
                });
            });
    }

    render() {
        if (this.state.isLoaded) {
            return (
                <video controls>
                    <source src={this.state.signedUrl} type={"video/mp4"} />
                </video>
            );
        } else {
            return (
                <p>Wird geladen…</p>
            );
        }
    }
}

export default Player;