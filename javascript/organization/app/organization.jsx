import React from 'react';
import ReactDOM from 'react-dom';

var AppSyncBox = React.createClass({
    // Sets up an initial state for the class, with default values.
    getInitialState: function() {
        return {umbrella: undefined, portal: null, portalMembers: [], groupList: [], errorData: {message: "", location: ""}};
    },
    // When the component mounts update the available portals.
    componentDidMount: function() {
        this.updatePortals();
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
        var portalPick;
        if(this.state.umbrella == undefined)
        {
            portalPick = (<div></div>);
        }
        else
        {
            portalPick = (<div className="form-group">
                <PortalPickBox onSelect={this.doSearch} umbrellaId={this.state.umbrella} refs="portalPickBox"/>
            </div>);
        }
        var errorBox;
        console.log(this.state.errorData.message)
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
                            <form className="navbar-form">
                                <div className="form-group">
                                    <UmbrellaPickBox change={this.setUmbrella} />
                                </div>
                                {portalPick}
                            </form>
                        </div>
                    </div>
                </nav>
                {errorBox}
                <PortalBox portal={this.state.portal} clearError={this.clearError} errorHandler={this.handleError}
                    errorData={this.state.errorData} portalMembers={this.state.portalMembers} listMembers={this.doSearch}
                    groupList={this.state.groupList}/>
            </div>
        );
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
        console.log(this.refs);
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


var PortalBox = React.createClass({
    // Sets up an initial state for the class, with default values.
    getInitialState: function()
    {
        return {toggleState: "LIST", inputListData: [], outputListData: [], groupId: -1, groupName: "All Groups", groupMembers: [], showDropDown: false};
    },
    // Sets the new state and calls certain functions needed to update the rest of the portal.
    changeToggleState: function(newState)
    {
        this.setState({toggleState: newState, inputListData: [], outputListData: []});
        this.props.clearError();
        this.getGroupMembers(this.state.groupId);
    },
    // Sets the state to the completed state, and refreshs the list of portal members.
    completeState: function()
    {
        this.setState({toggleState: "COMPLETE"});
        this.props.listMembers(this.props.portal);
    },
    // Parses the text provided by the ControlBox into an array of strings,
    // and then passes the array to the createData function as well as a flag
    // that tells it that the users are to be added to the group/portal.
    addSubmit: function(addText)
    {
        var parsedTextData = this.parseData(addText);

        for(i = 0; i < parsedTextData.length; i++)
        {
            parsedTextData[i] = this.stripEmail(parsedTextData[i]);
        }
        this.createData(parsedTextData, "Add");
    },
    // Parses the text provided by the ControlBox into an array of strings,
    // and then passes the array to the createData function as well as a flag
    // that tells it that the users are to be added to the group/portal.
    removeSubmit: function(removeText)
    {
        var parsedTextData = this.parseData(removeText);
        for(i = 0; i < parsedTextData.length; i++)
        {
            parsedTextData[i] = this.stripEmail(parsedTextData[i]);
        }
        this.createData(parsedTextData, "Remove");
    },
    // Parses the text splitting on commas, spaces, and newline characters.
    parseData: function(text)
    {
        var split = text.split(/[, \n]/);
        return split;
    },
    // Parses the text element splitting on the @ symbol and throwing away everything after.
    stripEmail: function(text)
    {
        var split = text.split('@');
        return split[0];
    },
    // Takes the parsed data and creates json objects for the PROCESSING state to
    // display as a list of rows.  Then it sets the inputListData as an array of these
    // objects, sets the state to PROCESSING and initiates the process by calling proccesAdd
    // if the data is to be added or processRemove if it is to be removed.  If there was an error
    // previously the clearError function is called first.  An error is set if there was no data.
    createData: function(parsedTextData, caller)
    {
        var newData = Array();
        for(i = 0; i < parsedTextData.length; i++)
        {
            if(parsedTextData[i] != "")
            {
                newData[i] = {input: parsedTextData[i], name: '-', status: 0};
            }
        }
        if(newData.length != 0)
        {
            this.setState({inputListData: newData});
            this.setState({toggleState: "PROCESSING"});
            if(this.props.errorData.location == "Add" || this.props.errorData.location == "Remove")
            {
                this.props.clearError();
            }
            if(caller == "Add")
            {
                this.processAdd(newData);
            }
            if(caller == "Remove")
            {
                this.processRemove(newData);
            }
        }
        else
        {
            this.props.errorHandler({message: "Empty text field", location: caller});
        }
    },
    // Confirms with the user that they actually want to remove all students from the group/portal.
    // If they say yes then it iterates through the portalMembers prop adding them to an arra and passes
    // them to the createData function.
    clear: function()
    {
        if(confirm("This will remove all students from this organization...\n\nAre you sure?"))
        {
            var membersToRemove = Array();
            var i = 0;
            for(i; i < this.props.portalMembers.length; i++)
            {
                membersToRemove[i] = this.props.portalMembers[i].email;
            }
            this.createData(membersToRemove, "Remove");
        }
    },
    // Takes an email address from the ListBox and searches for the student with that
    // email and adds them to an array and passes it to the createData function to remove.
    singleRemove: function(email)
    {
        var name;
        var i = 0;
        var members = this.props.portalMembers;

        for(i; i < members.length; i++)
        {
            if(members[i].email == email)
            {
                name = members[i].first_name + " " + members[i].last_name;
            }
        }
        if(confirm("Remove " + name + " from this organization...\n\nAre you sure?"))
        {
            var inputList = Array();
            inputList[0] = email;
            this.createData(inputList, "Remove")
        }
    },
    // Iterates through the data provided and calls the appropriate function to make
    // the ajax request to add the student to the group/portal.
    processAdd: function(addData)
    {
        var i = 0;
        for(i; i < addData.length; i++)
        {
            if(this.state.groupId == -1)
            {
                this.addPortalStudent(addData[i].input, i);
            }
            else
            {
                this.addGroupStudent(addData[i].input, i);
            }
        }
    },
    // Iterates through the data provided and calls the appropriate function to make
    // the ajax request to remove the student from the group/portal.
    processRemove: function(removeData)
    {
        var i = 0;
        for(i; i < removeData.length; i++)
        {
            if(this.state.groupId == -1)
            {
                this.removePortalStudent(removeData[i].input, i);
            }
            else
            {
                this.removeGroupStudent(removeData[i].input, i);
            }
        }
    },
    // Changes the groupId to that of the value passed from the dropdown. Also calls the function
    // to refresh the groupMembers array and updates the groupName for the new group.
    changeGroup: function(newGroup)
    {
        this.setState({groupId: newGroup, showDropDown: false});
        if(newGroup != -1)
        {
            this.getGroupMembers(newGroup);
        }

        var list = this.props.groupList;
        var i = 0;
        if(newGroup != -1)
        {
            for(i; i < list.length; i++)
            {
                if(list[i].id == newGroup)
                {
                    this.setState({groupName: list[i].name});
                }
            }
        }
        else
        {
            this.setState({groupName: "All Groups"})
        }
    },
    showGroup: function()
    {
        this.setState({showDropDown: true})
    },
    // Retrieve the members for the given group from the server via ajax.
    getGroupMembers: function(newGroup)
    {
        var inputData = {groupId: newGroup};
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxGetGroupMembers',
            dataType: 'json',
            data: inputData,
            success: function(data) {
                this.setState({groupMembers: data})
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    // Add the new members to the portal via ajax.
    addPortalStudent: function(addInput, index)
    {
        var inputData = {inputData: addInput, portalId: this.props.portal.id};
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxAddPortalStudent',
            type: 'POST',
            data: inputData,
            success: function(data)
            {
                var outputData = this.state.outputListData;
                outputData[index] = JSON.parse(data);

                this.setState({outputListData: outputData});
            }.bind(this),
            error: function(xhr, status, err)
            {
                //TODO create error handler
            }.bind(this)
        });
    },
    // Add the new members to the group via ajax.
    addGroupStudent: function(addInput, index)
    {
        var inputData = {inputData: addInput, portalId: this.props.portal.id, groupId: this.state.groupId};
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxAddGroupStudent',
            type: 'POST',
            data: inputData,
            success: function(data)
            {
                var outputData = this.state.outputListData;
                outputData[index] = JSON.parse(data);
                this.setState({outputListData: outputData});
            }.bind(this),
            error: function(xhr, status, err)
            {
                //TODO create error handler
            }.bind(this)
        });
    },
    // Remove the given members from the portal via ajax
    removePortalStudent: function(removeInput, index)
    {
        var inputData = {inputData: removeInput, portalId: this.props.portal.id};
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxRemovePortalStudent',
            type: 'POST',
            data: inputData,
            success: function(data)
            {
                var outputData = this.state.outputListData;
                outputData[index] = JSON.parse(data);
                this.setState({outputListData: outputData});
            }.bind(this),
            error: function(xhr, status, err)
            {
                //TODO create error handler
            }.bind(this)
        });
    },
    // Remove the given members from the group via ajax
    removeGroupStudent: function(removeInput, index)
    {
        var inputData = {inputData: removeInput, portalId: this.props.portal.id, groupId: this.state.groupId};
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxRemoveGroupStudent',
            type: 'POST',
            data: inputData,
            success: function(data)
            {
                var outputData = this.state.outputListData;
                outputData[index] = JSON.parse(data);
                this.setState({outputListData: outputData});
            }.bind(this),
            error: function(xhr, status, err)
            {
                //TODO create error handler
            }.bind(this)
        });
    },
    // Render function
    render: function()
    {
        if(this.props.portal == undefined)
        {
            return(
                <div></div>
            );
        }
        else {
            var linkStyle = {fontSize: '12px'};
            var link;
            if(!this.state.showDropDown)
            {
                var link = (<a style={linkStyle} onClick={this.showGroup}>Change Group</a>);
            }
            else
            {
                var dropdown = (<div className="col-md-3">
                    <GroupPickBox groups={this.props.groupList} change={this.changeGroup}
                        state={this.state.toggleState} groupId={this.state.groupId}/>
                </div>)
            }
            return(
                <div>
                    <h2>
                        {this.props.portal.name} <small>{this.state.groupName}</small> {link}
                    </h2>
                    {dropdown}
                    <div className="col-md-12">
                        <ToggleBox toggle={this.changeToggleState} state={this.state.toggleState} clear={this.clear} groupId={this.state.groupId}/>
                        <ControlBox add={this.addSubmit} remove={this.removeSubmit} complete={this.completeState} state={this.state.toggleState}
                            inputData={this.state.inputListData} outputData={this.state.outputListData} portalMembers={this.props.portalMembers}
                            errorData={this.props.errorData} singleRemove={this.singleRemove} groupMembers={this.state.groupMembers}
                            groupId={this.state.groupId}/>
                    </div>
                </div>
            );
        }
    }
});

var GroupPickBox = React.createClass({
    // On change of the select component retrieve the value and pass it to the parent component
    change: function()
    {
        var gChoice = this.refs.groupChoice.value;
        this.props.change(gChoice);
    },
    // Render Function
    render: function()
    {
        if(this.props.state == "PROCESSING")
        {
            return (<div></div>);
        }
        var groupsStyle = {marginTop: '20px'};
        var options = Array({id: -1, name: "All Groups"});
        var data = this.props.groups;
        var groupId = this.props.groupId;

        for(i = 0; i < data.length; i++)
        {
            options.push(data[i]);
        }

        var selectOptions = options.map(function(node)
        {
                return(<option key={node.id} value={node.id}>{node.name}</option>);
        });

        return(
            <div>
                <select onChange={this.change} defaultValue={this.props.groupId} style={groupsStyle} className="form-control" ref="groupChoice">
                    {selectOptions}
                </select>
            </div>
        );
    }
});

var ToggleBox = React.createClass({
    // Calls the parent class' toggle function with the LIST flag
    list: function()
    {
        this.props.toggle("LIST");
    },
    // Calls the parent class' toggle function with the ADD flag
    add: function()
    {
        this.props.toggle("ADD");
    },
    // Calls the parent class' toggle function with the REMOVE flag
    remove: function()
    {
        this.props.toggle("REMOVE");
    },
    // Calls the parent class' clear method to attempt to purge all members
    clear: function()
    {
        this.props.clear();
    },
    // Render Function
    render: function()
    {
        if(this.props.state == "PROCESSING")
        {
            return (<div></div>);
        }
        else {
            var list = false;
            var add = false;
            var remove = false;
            if(this.props.state == "LIST")
            {
                list = true;
            }
            else if(this.props.state == "ADD")
            {
                add = true;
            }
            else if(this.props.state == "REMOVE")
            {
                remove = true;
            }
            var listClasses = classNames({
                'btn': true,
                'btn-default': true,
                'active': list
            });

            var addClasses = classNames({
                'btn': true,
                'btn-default': true,
                'active': add
            });

            var removeClasses = classNames({
                'btn': true,
                'btn-default': true,
                'active': remove
            });

            var toggleStyle = {marginTop: '25px'};
            return(
                <div className="row" style={toggleStyle}>
                    <div className="col-md-6">
                        <div className="btn-group">
                            <label onClick={this.list} className={listClasses}>
                                List Members
                            </label>
                            <label onClick={this.add} className={addClasses}>
                                Add Members
                            </label>
                            <label onClick={this.remove} className={removeClasses}>
                                Remove Members
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3 col-md-offset-3">
                        <ButtonBox clear={this.clear} state={this.props.state} groupId={this.props.groupId}/>
                    </div>
                </div>
            );
        }
    }
});


var ButtonBox = React.createClass({
    // On click function for calling the parent class' clear method.
    clear: function()
    {
        this.props.clear();
    },
    // Render method
    render: function()
    {
        if(this.props.state == "PROCESSING")
        {
            return (<div></div>);
        }
        else {
            var message;
            if(this.props.groupId == -1)
            {
                message = "Purge All Members";
            }
            else
            {
                message = "Purge All Members From Group";
            }
            return(
                <div>
                    <a onClick={this.clear} className="btn btn-md btn-danger">{message}</a>
                </div>
            );
        }
    }
});

var ControlBox = React.createClass({
    // Function for setting the state to complete via calling the parents complete function
    completeState: function()
    {
        this.props.complete();
    },
    // On click function for passing the values of the textbox for AddBox and RemoveBox up
    // to the parent class.
    click: function(text)
    {
        if(this.props.state == "ADD")
        {

            this.props.add(text);
        }
        else if(this.props.state == "REMOVE")
        {

            this.props.remove(text);
        }
    },
    // Passes the email to the parent class' singleRemove function
    singleRemove: function(email)
    {
        this.props.singleRemove(email);
    },
    // Render Function
    render: function()
    {
        if(this.props.state == "LIST")
        {
            return(
                <div>
                    <ListBox portalMembers={this.props.portalMembers} groupMembers={this.props.groupMembers}
                        singleRemove={this.singleRemove} groupId={this.props.groupId}/>
                </div>
            );
        }
        else if(this.props.state == "ADD")
        {
            return(
                <div>
                    <AddBox click={this.click} errorData={this.props.errorData} />
                </div>
            );
        }
        else if(this.props.state == "REMOVE")
        {
            return(
                <div>
                    <RemoveBox click={this.click} errorData={this.props.errorData} />
                </div>
            );
        }
        else if(this.props.state == "PROCESSING" || this.props.state == "COMPLETE")
        {
            return(
                <div>
                    <ActionBox complete={this.completeState} inputData={this.props.inputData}
                        outputData={this.props.outputData} state={this.props.state} />
                </div>
            );
        }
        else
        {
                return(
                    <div></div>
                );
        }
    }
});

var ListBox = React.createClass({
    // Function passes the value of the email up to the parent class' function for removing
    // a single student by email.
    remove: function(email)
    {
        this.props.singleRemove(email);
    },
    // Render Function
    render: function()
    {

        var controlStyle = {marginTop: '25px'};
        var noMemberStyle = {marginTop: '10px'};
        var members = Array();
        if(this.props.groupId == -1)
        {
            members = this.props.portalMembers;
        }
        else
        {
            members = this.props.groupMembers;
        }
        if(members.length == 0)
        {
            return (<div style={noMemberStyle}><p>There are no members at present, to add some members click on the Add Members tab.</p></div>);
        }
        var listRemove = this.remove;
        var memberRows = members.map(function(node){
            return (
                <tr key={node.email}>
                    <td>
                        {node.first_name} {node.last_name}
                    </td>
                    <td>
                        {node.email}
                    </td>
                    <td>
                        <OptionBox listRemove={listRemove} email={node.email}/>
                    </td>
                </tr>);
        });
        return(
                <div className="row">
                    <div className="col-md-6">
                        <table style={controlStyle} className="table table-hover table-striped">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberRows}
                            </tbody>
                        </table>
                    </div>
                </div>
        );
    }
});

var AddBox = React.createClass({
    // On click function that retrieves the value of the textbox and passes it up to
    // be parsed and the students added.
    click: function()
    {
        var addText = this.refs.addText.value;
        this.props.click(addText);
    },
    // Render Function
    render: function()
    {
        var controlStyle = {marginTop: '25px'};
        var buttonStyle = {marginTop: '15px'};
        var addError = false;
        if(this.props.errorData.location == "Add")
        {
            addError = true;
        }
        var addInputClasses = classNames({
            'col-md-4': true,
            'has-error': addError
        });
        return(
            <div>
                <div className="row">
                    <div className={addInputClasses}>
                        <textarea style={controlStyle} className="form-control" rows="5" cols="40" ref="addText"></textarea>
                    </div>
                </div>
                <a onClick={this.click} style={buttonStyle} className="btn btn-lg btn-success">Add</a>
            </div>
        );
    }
});

var RemoveBox = React.createClass({
    // On click function that retrieves the value of the textbox and passes it up to
    // be parsed and the students removed.
    click: function()
    {
        var removeText = this.refs.removeText.value;
        this.props.click(removeText);
    },
    // Render Function
    render: function()
    {
        var controlStyle = {marginTop: '25px'};
        var buttonStyle = {marginTop: '15px'};
        var removeError = false;
        if(this.props.errorData.location == "Remove")
        {
            removeError = true;
        }
        var removeInputClasses = classNames({
            'col-md-4': true,
            'has-error': removeError
        });
        return(
            <div>
                <div className="row">
                    <div className={removeInputClasses}>
                        <textarea style={controlStyle} className="form-control" rows="5" cols="40" ref="removeText"></textarea>
                    </div>
                </div>
                <a onClick={this.click} style={buttonStyle} className="btn btn-lg btn-success">Remove</a>
            </div>
        );
    }
});

var ActionBox = React.createClass({
    // A function for calling the parent class' complete function which sets the state to COMPLETE
    completeState: function()
    {
        this.props.complete();
    },
    // Render Function
    render: function()
    {
        var controlStyle = {marginTop: '25px'};
        if(this.props.inputData == undefined)
        {
            return (<div></div>);
        }
        if(this.props.state == "PROCESSING" && this.props.inputData.length == this.props.outputData.length)
        {
            this.completeState();
        }
        var data = Array();
        var i = 0;
        var cmpCnt = 0;
        var errorOccurred = false;

        for(i; i < this.props.inputData.length; i++)
        {
            var datum = Array();
            datum.input = this.props.inputData[i].input;
            if(this.props.outputData[i] == undefined)
            {
                datum.status = undefined;
                datum.name = undefined;
            }
            else
            {
                datum.status = this.props.outputData[i].status;
                datum.name = this.props.outputData[i].name;
                cmpCnt++;
                if(!datum.status)
                {
                    errorOccurred = true;
                }
            }
            data.push(datum);

        }
        var rows = data.map(function(node){

            if(node.status == 0)
            {
                return(
                    <tr key={node.input}>
                        <td>{node.input}</td>
                        <td><i className="fa fa-times text-danger"></i> Error retrieving student</td>
                        <td><i className="fa fa-times text-danger"></i></td>
                    </tr>
                );
            }
            else if(node.status == 1)
            {
                return(<tr key={node.input}>
                        <td>{node.input}</td>
                        <td>{node.name}</td>
                        <td><i className="fa fa-check text-success"></i></td>
                    </tr>
                );
            }
            else if(node.status == 2)
            {
                return(<tr key={node.input}>
                        <td>{node.input}</td>
                        <td>{node.name}</td>
                        <td><i className="fa fa-times text-danger"></i></td>
                    </tr>
                );
            }
            else if(node.name == undefined && node.status == undefined)
            {
                return(<tr key={node.input}>
                        <td>{node.input}</td>
                        <td><i className="fa fa-spinner fa-pulse"></i></td>
                        <td><i className="fa fa-spinner fa-pulse"></i></td>
                    </tr>
                );
            }
        });

        var percentComplete = (cmpCnt / this.props.inputData.length) * 100;

        return(
            <div style={controlStyle}>
                <div className="row">
                    <div className="col-md-6">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Input</th>
                                    <th>Student Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <ProgressBarBox state={this.props.state} percentComplete={percentComplete} errorOccurred={errorOccurred}/>
                    </div>
                </div>
            </div>
        );
    }
});

var OptionBox = React.createClass({
    // Calls the parent class listRemove function and passes the appropriate email for
    // this student node.
    listRemove: function()
    {
        this.props.listRemove(this.props.email);
    },
    // Render Function
    render: function()
    {
        return(
            <button onClick={this.listRemove} type="button" className="close">
                <span aria-hidden="true">
                    <i className="fa fa-trash"></i>
                </span>
            </button>
        );
    }
});

var ProgressBarBox = React.createClass({
    // Render Function
    render: function()
    {
        var percentage = this.props.percentComplete + '%'
        var progressBarStyle = {width: percentage};
        var complete = false;
        var success = true;
        var danger = false;
        var active = true;
        if(this.props.percentComplete == 100)
        {
            complete = true;
            active = false;
        }
        if(this.props.errorOccurred)
        {
            success = false;
            danger = true;
        }
        var progressBarClasses = classNames({
            'progress-bar': true,
            'progress-bar-striped': !complete,
            'progress-bar-success': success,
            'progress-bar-danger': danger,
            'active': active
        });

        return(
            <div className="progress">
                <div className={progressBarClasses} role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style={progressBarStyle}>
                </div>
            </div>
        )

    }
});



ReactDOM.render(
    <AppSyncBox/>,
    document.getElementById('org')
);
