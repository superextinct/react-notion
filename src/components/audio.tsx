import * as React from "react";
import AudioPlayer from "react-h5-audio-player";
import fetch from "node-fetch";

type AudioProps = {
    id: string;
    url: string;
};

type DataState = {
    id: string;
    url: string;
    isLoaded: boolean;
    signedUrl: string;
}

class Audio extends React.Component<{ id: string, url: string}, DataState> {
    constructor(props: AudioProps) {
        super(props);
        this.state = {
            id: props.id,
            url: props.url,
            isLoaded: false,
            signedUrl: ''
        };
    }

    componentDidMount() {
        fetch(`https://notion.superextinct.workers.dev/v1/files/${this.props.id}/${this.props.url}`)
            .then(res => res.json())
            .then( (result) => {
                const res = JSON.parse(result);
                this.setState({
                    isLoaded: true,
                    signedUrl: res.signedUrls[0]
                })
            });
    }

    render() {
        if (this.state.isLoaded) {
            return (
                <AudioPlayer
                    src={this.state.signedUrl}
                    customAdditionalControls={[]}
                />
            );
        } else {
            return (
                <p>Wird geladen…</p>
            );
        }
    }
}

export default Audio;