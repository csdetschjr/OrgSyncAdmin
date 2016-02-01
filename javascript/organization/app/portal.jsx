import React from 'react-dom/node_modules/react';
import ReactDOM from 'react-dom';
import ControlBox from './control.jsx';

export default class PortalBox extends React.Component {
  render() {
    return <PortalViewBox portal={this.props.portal} clearError={this.props.clearError} errorHandler={this.props.handleError}
        errorData={this.props.errorData} portalMembers={this.props.portalMembers} listMembers={this.props.listMembers}
        groupList={this.props.groupList} userPermissions={this.props.userPermissions}/>;
  }
}

var PortalViewBox = React.createClass({
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
        var i;

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
        var i;

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
        var i;
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
            var i;
            for(i = 0; i < this.props.portalMembers.length; i++)
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

        var members = this.props.portalMembers;
        var i;
        for(i = 0; i < members.length; i++)
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
        var i;
        for(i = 0; i < addData.length; i++)
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
        var i;
        for(i = 0; i < removeData.length; i++)
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

        if(newGroup != -1)
        {
            var i;
            for(i = 0; i < list.length; i++)
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
        var inputData = {groupId: newGroup, portalId: this.props.portal.id};
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
        console.log(this.props.userPermissions)
        var linkStyle = {fontSize: '12px'};
        var link;
        if(!this.state.showDropDown)
        {
            var link = (<a style={linkStyle} onClick={this.showGroup}>Switch Group</a>);
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
                    <ToggleBox toggle={this.changeToggleState} state={this.state.toggleState} clear={this.clear} groupId={this.state.groupId}
                        userPermissions={this.props.userPermissions}/>
                    <ControlBox add={this.addSubmit} remove={this.removeSubmit} completeState={this.completeState} state={this.state.toggleState}
                        inputData={this.state.inputListData} outputData={this.state.outputListData} portalMembers={this.props.portalMembers}
                        errorData={this.props.errorData} singleRemove={this.singleRemove} groupMembers={this.state.groupMembers}
                        groupId={this.state.groupId}/>
                </div>
            </div>
        );
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
        var i;

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
                        <ButtonBox clear={this.clear} state={this.props.state} groupId={this.props.groupId}
                            userPermissions={this.props.userPermissions}/>
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
        if(this.props.state == "PROCESSING" || !this.props.userPermissions.purge)
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
