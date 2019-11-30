import React from "react";

interface IRawVisualizerProps {
  content: any;
  title?: string;
}

interface IRawVisualizerState {
  expanded: boolean;
}

const devtoolsStyle: {
  [name: string]: React.CSSProperties,
} = {
  rawItem: {
    width: "100%",
    marginTop: "2px",
    userSelect: "none",
    cursor: "pointer",
  },
  rawChildren: {
    width: "100%",
    backgroundColor: "#FFF",
    color: "#000051",
    marginTop: "2px",
  },
};

export default class DevToolRawVisualizer extends
  React.Component<IRawVisualizerProps, IRawVisualizerState> {
  constructor(props: IRawVisualizerProps) {
    super(props);

    this.state = {
      expanded: false,
    };

    this.toggleExpand = this.toggleExpand.bind(this);
  }
  public toggleExpand() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }
  public render() {
    return (
      <div style={devtoolsStyle.rawItem} onClick={this.toggleExpand}>
        <p>{this.props.title ? this.props.title : "view raw content"}</p>
        {this.state.expanded ? <code style={devtoolsStyle.rawChildren}>
          {JSON.stringify(this.props.content, null, 2)}
        </code> : null}
      </div>
    );
  }
}