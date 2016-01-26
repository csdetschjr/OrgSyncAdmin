import React from 'react-dom/node_modules/react';
import ReactDOM from 'react-dom';
import PortalBox from './portal.jsx';

export default class AppBox extends React.Component {
    render() {
        return <AppSyncBox/>;
    }
}

var AppSyncBox = React.createClass({
    // Sets up an initial state for the class, with default values.
    getInitialState: function() {
        return {umbrella: undefined, portal: null, portalMembers: [], groupList: [], errorData: {message: "", location: ""}, userPermissions: null};
    },
    // When the component mounts update the available portals.
    componentDidMount: function() {
        this.updatePortals();
        this.getUserPermissions();
    },
    // Set the value of the umbrella to the value picked on the dropdown
    setUmbrella: function(newUmbrella) {
        this.setState({umbrella: newUmbrella});
    },
    // Calls the functions responsible for picking the portal, setting up the members of the portal,
    // and the groups for the portal.
    doSearch: function(datum) {
        this.setState({portal: datum});
        this.getMembers(datum);
        this.getGroups(datum);
    },
    // Retrieve the members for the given portal from the server via ajax.
    getMembers: function(datum) {
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxGetPortalMembers',
            dataType: 'json',
            data: {org_id: datum.id, umbrella: this.state.umbrella},
            success: function(data) {
                this.setState({portalMembers: data})
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    // Sends a call to the server to update the portals from the orgsync api.
    updatePortals: function() {
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxUpdateOrgData',
            type: 'POST',
            success: function()
            {
                this.setState({updated: true});
            }.bind(this),
            error: function(xhr, status, err)
            {
                //TODO create error handler
            }.bind(this)
        });
    },
    // Retrieves the groups for the given portal
    getGroups: function(datum)
    {
        var inputData = {portalId: datum.id};
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxGetPortalGroups',
            type: 'POST',
            data: inputData,
            success: function(data)
            {
                var outputData = Array();
                outputData = JSON.parse(data);
                this.setState({groupList: outputData});
            }.bind(this),
            error: function(xhr, status, err)
            {
                //TODO create error handler
            }.bind(this)
        });
    },
    // Gets the current users's permissions.
    getUserPermissions: function()
    {
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxGetUserPermissions',
            type: 'GET',
            success: function(data)
            {
                var outputData = Array();
                outputData = JSON.parse(data);
                this.setState({userPermissions: outputData});
            }.bind(this),
            error: function(xhr, status, err)
            {
                //TODO create error handler
            }.bind(this)
        });
    },
    // Sets the errorData, so that the ErrorBox can report errors
    handleError: function(data)
    {
        this.setState({errorData: data});
    },
    // Sets the errorData to blank values, in order to clear the ErrorBox
    clearError: function()
    {
        this.setState({errorData: {message: "", location: ""}});
    },
    // Render function
    render: function()
    {

        var errorBox;

        if(this.state.errorData.message == "")
        {
            errorBox = (<div></div>);
        }
        else
        {
            errorBox = (<ErrorBox errorData={this.state.errorData} />);
        }

        return(
            <div>
                <NavigationBox umbrella={this.state.umbrella} setUmbrella={this.setUmbrella} doSearch={this.doSearch} />
                {errorBox}
                <PortalBox portal={this.state.portal} clearError={this.clearError} errorHandler={this.handleError}
                    errorData={this.state.errorData} portalMembers={this.state.portalMembers} listMembers={this.doSearch}
                    groupList={this.state.groupList} />
            </div>
        );
    }
});

var NavigationBox = React.createClass({
    render: function()
    {
        var portalPick;
        if(this.props.umbrella == undefined)
        {
            portalPick = (
                <div></div>
            );
        }
        else
        {
            portalPick = (
                <div className="form-group">
                    <PortalPickBox onSelect={this.props.doSearch} umbrellaId={this.props.umbrella} refs="portalPickBox"/>
                </div>
            );
        }
        return(
            <div>
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand" href="#">AppSync Admin</a>
                        </div>
                        <div className="collapse navbar-collapse">
                            <ul className="nav navbar-nav">
                                <form className="navbar-form">
                                    <div className="form-group">
                                        <UmbrellaPickBox change={this.props.setUmbrella} />
                                    </div>
                                    {portalPick}
                                </form>
                            </ul>
                            <ul className="nav navbar-nav navbar-right">
                                <li>
                                    <a href="index.php?module=controlpanel">
                                        <i className="fa fa-cog"></i> Control Panel</a>
                                    </li>
                                    <li><a href="#">Username Here</a></li>
                                    <li>
                                        <a href="index.php?module=users&action=user&command=logout">
                                            <i className="fa fa-sign-out"></i> Sign out
                                        </a>
                                    </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        )
    }
});

var UmbrellaPickBox = React.createClass({
    // Sets up an initial state for the class, with default values.
    getInitialState: function()
    {
        return({umbrellas: []});
    },
    // When the component mounts, get all the umbrellas
    componentWillMount: function()
    {
        this.getUmbrellas();
    },
    // Retrieves the value of the dropdown and passes it to the parent component.
    change: function()
    {
        var uChoice = ReactDOM.findDOMNode(this.refs.umbrellaChoice);
        var value = uChoice.value;
        this.props.change(value);
    },
    // Retrieves the umbrellas from the server via an ajax call.
    getUmbrellas: function()
    {
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxGetUmbrellaList',
            type: 'GET',
            dataType: 'json',
            success: function(data)
            {
                this.setState({umbrellas: data})
            }.bind(this),
            error: function(xhr, status, err)
            {
                alert(err.toString())
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    // Render function
    render: function()
    {
        var options = Array({umbrella_id: -1, umbrella_name: "Pick an umbrella..."});
        var data = this.state.umbrellas;
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

var PortalPickBox = React.createClass({
    // On successful mount set up the autofill using Bloodhound.
    componentDidMount: function() {
        var searchSuggestions = new Bloodhound({
            datumTokenizer: function(datum){
                var nameTokens      = Bloodhound.tokenizers.obj.whitespace('name');
                return nameTokens;
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: 'index.php?module=appsync&action=GetSearchSuggestions&umbrellaId=' + this.props.umbrellaId + '&searchString=%QUERY',
                wildcard: '%QUERY'
            }
        });

        var element = ReactDOM.findDOMNode(this);
        $(element).typeahead({
            minLength: 3,
            highlight: true,
            hint: true
        },
        {
            name: 'portals',
            display: 'portalId',
            source: searchSuggestions.ttAdapter(),
            limit: 15,
            templates: {
                suggestion: function(row) {
                    return ('<p>'+row.name+' &middot; ' + row.id + '</p>');
                }
            }
        });

        // Event handler for selecting a suggestion
        var handleSearch = this.props.onSelect;
        $(element).bind('typeahead:select', function(obj, datum, name) {
            // Redirect to the student profile the user selected
            handleSearch(datum);
        });

        // Event handler for enter key.. Search with whatever the person put in the box
        $(element).keydown(function(e){

            // Look for the enter key
            if(e.keyCode == 13) {
                // Prevent default to keep the form from being submitted on enter
                e.preventDefault();
                return;
            }

            // Ignore the tab key
            if(e.keyCode == 9){
                return;
            }

        });
    },
    // If the component has updated recreate the autofill with Bloodhound.
    componentDidUpdate: function() {
        var element = ReactDOM.findDOMNode(this);
        $(element).typeahead('destroy');
        var searchSuggestions = new Bloodhound({
            datumTokenizer: function(datum){
                var nameTokens      = Bloodhound.tokenizers.obj.whitespace('name');
                return nameTokens;
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: 'index.php?module=appsync&action=GetSearchSuggestions&umbrellaId=' + this.props.umbrellaId + '&searchString=%QUERY',
                wildcard: '%QUERY'
            }
        });

        var element = ReactDOM.findDOMNode(this);
        $(element).typeahead({
            minLength: 3,
            highlight: true,
            hint: true
        },
        {
            name: 'portals',
            display: 'portalId',
            source: searchSuggestions.ttAdapter(),
            limit: 15,
            templates: {
                suggestion: function(row) {
                    return ('<p>'+row.name+' &middot; ' + row.id + '</p>');
                }
            }
        });

        // Event handler for selecting a suggestion
        var handleSearch = this.props.onSelect;
        $(element).bind('typeahead:select', function(obj, datum, name) {
            // Redirect to the student profile the user selected
            handleSearch(datum);
        });

        // Event handler for enter key.. Search with whatever the person put in the box
        $(element).keydown(function(e){

            // Look for the enter key
            if(e.keyCode == 13) {
                // Prevent default to keep the form from being submitted on enter
                e.preventDefault();
                return;
            }

            // Ignore the tab key
            if(e.keyCode == 9){
                return;
            }

        });
    },
    // If the component is going to unmount destroy the typeahead
    componentWillUnmount: function() {
        var element = ReactDOM.findDOMNode(this);
        $(element).typeahead('destroy');
    },
    // Render function
    render: function()
    {
        return (
            <input type="search" name="portalId" id="portalSearch" className="form-control typeahead" placeholder="Portal Name" ref="searchString" autoComplete="off" autofocus/>
        );
    }
});

var ErrorBox = React.createClass({
    // The Render Function
    render: function()
    {
        return (
            <div className="alert alert-danger" role="alert">
                <i className="fa fa-times fa-2x"></i> <span>{this.props.errorData.message}</span>
            </div>
        );
    }
});
