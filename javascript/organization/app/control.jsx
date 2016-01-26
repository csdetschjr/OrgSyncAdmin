import React from 'react-dom/node_modules/react';
import ReactDOM from 'react-dom';

export default class ControlBox extends React.Component {
  render() {
    return <ControlActionBox add={this.props.add} remove={this.props.remove} completeState={this.props.completeState} state={this.props.state}
        inputData={this.props.inputData} outputData={this.props.outputData} portalMembers={this.props.portalMembers}
        errorData={this.props.errorData} singleRemove={this.props.singleRemove} groupMembers={this.props.groupMembers}
        groupId={this.props.groupId}/>;
  }
}

var ControlActionBox = React.createClass({
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
