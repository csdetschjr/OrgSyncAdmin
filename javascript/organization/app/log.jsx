import React from 'react-dom/node_modules/react';
import ReactDOM from 'react-dom';

export default class LogBox extends React.Component {
  render() {
    return (<LogViewBox/>);
  }
}

var LogViewBox = React.createClass({
    getInitialState: function()
    {
        return {log: [], retrieved: false, users: [], filter: false, username: ""}
    },
    componentWillMount: function()
    {
        this.getLog();
        this.getUsernames();
    },
    filterToggle: function()
    {
        this.setState({filter: !this.state.filter});
    },
    changeUsername: function(index)
    {
        if(index == -1)
        {
            this.setState({username: ""});
        }
        else
        {
            this.setState({username: this.state.users[index].username});
        }
    },
    getLog: function()
    {
        //AJAX request for the dbpager set innerHTML on success
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxGetLog',
            type: 'GET',
            dataType: 'json',
            success: function(data)
            {
                this.setState({log: data, retrieved: true});
            }.bind(this),
            error: function(xhr, status, err)
            {
                //TODO create error handler
            }.bind(this)
        });
    },
    getUsernames: function()
    {
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxRetrieveUsers',
            type: 'GET',
            dataType: 'json',
            success: function(data)
            {
                this.setState({users: data});
            }.bind(this),
            error: function(xhr, status, err)
            {
                //TODO create error handler
            }.bind(this)
        })
    },
    // Render function
    render: function()
    {
        var log;
        var rows;
        var data = this.state.log;
        if(this.state.retrieved)
        {
            var empty = true;
            if(this.state.username != "")
            {
                var checkUsername = this.state.username;
                var rows = data.map(function(node){
                    if(node.username == checkUsername)
                    {
                        empty = false
                        return (
                            <tr key={node.occurredOn}>
                                <td>
                                    {node.occurredOn}
                                </td>
                                <td>
                                    {node.username}
                                </td>
                                <td>
                                    {node.desc}
                                </td>
                            </tr>);
                    }
                });
            }
            else {
                var rows = data.map(function(node){
                    empty = false;
                    return (
                        <tr key={node.occurredOn}>
                            <td>
                                {node.occurredOn}
                            </td>
                            <td>
                                {node.username}
                            </td>
                            <td>
                                {node.desc}
                            </td>
                        </tr>);
                });
            }
            if(empty)
            {
                rows = (<p>No log entries</p>);
            }
            log = (<table className="table table-hover table-striped">
                        <thead>
                            <th>Occurred</th>
                            <th>Username</th>
                            <th>Description</th>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                   </table>);
        }
        else
        {
            log = (<div></div>);
        }
        return (
                <div>
                    <h2>Change Log</h2>
                    <div className="col-md-9">
                        <FilterBox filterToggle={this.filterToggle} changeUsername={this.changeUsername}
                            filter={this.state.filter} users={this.state.users}/>
                        {log}
                    </div>
                </div>
        );
    }
});

var FilterBox = React.createClass({
    filterToggle: function()
    {
        this.props.filterToggle();
    },
    changeFilterUsername: function()
    {
        var uChoice = ReactDOM.findDOMNode(this.refs.usernameChoice);
        var value = uChoice.value;
        this.props.changeUsername(value);
    },
    // Render Function
    render: function()
    {
        var usernameInput;
        var usernames;
        var data = new Array({username: "All Users"})

        var users = this.props.users;
        var i = 0;

        for(i; i< users.length;i++)
        {
            data.push(users[i]);
        }

        if(this.props.filter)
        {
            var x = -1;
            usernames = data.map(function(node){
                var option = (
                    <option value={x}>
                        {node.username}
                    </option>
                    );
                x++;
                return option;
            });
            usernameInput = (<div className="form-group">
                                <label>Username</label>
                                <select onChange={this.changeFilterUsername} ref="usernameChoice">
                                    {usernames}
                                </select>
                             </div>);
        }
        else {
            usernameInput = (<div></div>);
        }

        return(
            <div>
                <div className="checkbox">
                    <label>
                        <input onClick={this.filterToggle} type="checkbox" /> Filter by Username
                    </label>
                </div>
                {usernameInput}
            </div>
            );

    }
});
