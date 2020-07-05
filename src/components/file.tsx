import * as React from "react";
import fetch from "node-fetch";

type FileProps = {
    id: string;
    url: string;
    title: string;
    size: string;
};

type DataState = {
    id: string;
    url: string;
    title: string;
    size: string;
    isLoaded: boolean;
    signedUrl: string;
    extension: any;
};

class File extends React.Component<{ id: string, url: string, title: string, size: string}, DataState> {
    constructor(props: FileProps) {
        super(props);

        const re = /(?:\.([^.]+))?$/;

        this.state = {
            id: props.id,
            url: props.url,
            title: props.title,
            size: props.size,
            isLoaded: false,
            signedUrl: "",
            extension: re.exec(props.title)?.[1]
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
                <a
                    href={this.state.signedUrl}
                    rel="_blank"
                    className="download-link"
                    download
                >
                    {this.props.title}
                    <small>{this.props.size}</small>
                </a>
            )
        } else {
            return this.props.title;
        }
    }
}

export default File;