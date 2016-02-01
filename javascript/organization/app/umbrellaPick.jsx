import React from 'react-dom/node_modules/react';
import ReactDOM from 'react-dom';

export default class UmbrellaPickBox extends React.Component {
  render() {
    return (<UmbrellaBox umbrellaList={this.props.umbrellaList} change={this.props.change}/>);
  }
}

var UmbrellaBox = React.createClass({
    // Retrieves the value of the dropdown and passes it to the parent component.
    change: function()
    {
        var uChoice = ReactDOM.findDOMNode(this.refs.umbrellaChoice);
        var value = uChoice.value;
        this.props.change(value);
    },
    // Render function
    render: function()
    {
        var options = Array({umbrella_id: -1, umbrella_name: "Pick an umbrella..."});
        var data = this.props.umbrellaList;
        var i = 0;
        for(i; i < data.length; i++)
        {
            options.push(data[i]);
        }

        var selectOptions = options.map(function(node)
        {
            return(<option key={node.umbrella_id} value={node.umbrella_id}>{node.umbrella_name}</option>)
        });

        return(
            <div>
                <select onChange={this.change} className="form-control" ref="umbrellaChoice">
                    {selectOptions}
                </select>
            </div>
        );
    }
});
