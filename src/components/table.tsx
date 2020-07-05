import * as React from "react";
import { BlockMapType } from "../types";
import fetch from "node-fetch";

type TableProps = {
    id: string
}

type DataState = {
    id: string;
    isLoaded: boolean;
    cols: string[];
    rows: any;
}

class Table extends React.Component<{ id: string }, DataState> {
    constructor(props: TableProps) {
        super(props);
        this.state = {
            id: props.id,
            isLoaded: false,
            cols: [],
            rows: []
        };
    }

    componentDidMount() {
        fetch(`https://notion.superextinct.workers.dev/v1/table/${this.props.id}`)
            .then(res => res.json())
            .then( (result) => {
                let columns: string[] = [];
                let data: object[] = result.map(({id, ...props}:BlockMapType) => {
                    const row:Map<string, any> = new Map<string, any>();
                    Object.keys(props).sort().forEach( (key: string) => {
                        row.set(key, props[key]);
                        row.set("id", id);
            
                        if (!columns.includes(key))
                            columns.push(key);
            
                    });
                    return row;
                });

                this.setState({
                    cols: columns,
                    rows: data,
                    isLoaded: true
                });
            })
    }

    renderTableData() {
        return this.state.rows.map( (row:Map<string, any>) => {
            return (
                <tr key={row.get("id")}>
                    {this.state.cols.map(col => {
                        return (
                            <td className={typeof row.get(col) == "number" ? "num" : ""}>{row.get(col)}</td>
                        )
                    })}
                </tr>
            )
        });
    }

    render() {
        if(this.state.isLoaded) {
            return (
                <table className="notion-table">
                    <thead>
                        <tr key={this.state.id}>
                            {this.state.cols.map((col, i) => {
                                return (
                                    <th key={i}>{col.replace(/([0-9]+\ )/, "")}</th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody className="align-baseline">
                        {this.renderTableData()}
                    </tbody>
                </table>
            )
        } else {
            return (
                <p>Wird geladen…</p>
            )
        }
    }
}

export default Table;