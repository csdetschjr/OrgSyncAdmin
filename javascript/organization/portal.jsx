var PortalBox = React.createClass({
    // Sets up an initial state for the class, with default values.
    getInitialState: function()
    {
        return {toggleState: 0, inputListData: [], outputListData: []};
    },
    //
    changeToggleState: function(newState)
    {
        if(newState == 0)
        {
            this.props.listMembers(this.props.portal);
        }
        this.setState({toggleState: newState, inputListData: [], outputListData: []});
        this.props.clearError();
    },
    //
    completeState: function()
    {
        this.setState({toggleState: 4});
    },
    //
    addSubmit: function(addText)
    {
        var parsedTextData = this.parseData(addText);

        for(i = 0; i < parsedTextData.length; i++)
        {
            parsedTextData[i] = this.removeEmail(parsedTextData[i]);
        }
        this.createData(parsedTextData, "Add");
    },
    //
    removeSubmit: function(removeText)
    {
        var parsedTextData = this.parseData(removeText);
        for(i = 0; i < parsedTextData.length; i++)
        {
            parsedTextData[i] = this.removeEmail(parsedTextData[i]);
        }
        this.createData(parsedTextData, "Remove");
    },
    //
    parseData: function(text)
    {
        var split = text.split(/[, \n]/);
        return split;
    },
    //
    removeEmail: function(text)
    {
        var split = text.split('@');
        return split[0];
    },
    //
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
            this.setState({toggleState: 3});
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
    //
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
    //
    singleRemove: function(email)
    {
        var name;
        var i;
        for(i; i < this.props.portalMembers.length; i++)
        {
            if(this.props.portalMembers[i].email == email)
            {
                name = this.props.portalMembers[i].first_name + " " + this.props.portalMembers[i].last_name;
            }
        }
        if(confirm("Remove "+ name + " from this organization...\n\nAre you sure?"))
        {
            var inputList = Array();
            inputList[0] = {input: this.removeEmail(email), name: '-', status: 0};
            this.setState({inputListData: inputList});
            this.processRemove(inputList);
        }
    },
    //
    processAdd: function(addData)
    {
        var i = 0;
        for(i; i < addData.length; i++)
        {
            this.addStudent(addData[i].input, i);
        }
    },
    //
    processRemove: function(removeData)
    {
        var i = 0;
        for(i; i < removeData.length; i++)
        {
            this.removeStudent(removeData[i].input, i);
        }
    },
    //
    addStudent: function(addInput, index)
    {
        var inputData = {inputData: addInput, portalId: this.props.portal.id};
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxAddStudent',
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
    removeStudent: function(removeInput, index)
    {
        var inputData = {inputData: removeInput, portalId: this.props.portal.id};
        $.ajax({
            url: 'index.php?module=appsync&action=AjaxRemoveStudent',
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
            return(
                <div>
                    <div className="row">
                        <div className="col-md-3">
                            <h2 classsName="marginTop: 12px">{this.props.portal.name}</h2>
                        </div>
                        <div className="col-md-3 col-md-offset-4">
                            <ButtonBox clear={this.clear} groups={this.groups} state={this.state.toggleState}/>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <ToggleBox toggle={this.changeToggleState} state={this.state.toggleState}/>
                        <ControlBox add={this.addSubmit} remove={this.removeSubmit} complete={this.completeState} state={this.state.toggleState}
                            inputData={this.state.inputListData} outputData={this.state.outputListData} members={this.props.portalMembers}
                            errorData={this.props.errorData} singleRemove={this.singleRemove}/>

                    </div>
                </div>
            );
        }
    }
});

var ButtonBox = React.createClass({
    clear: function()
    {
        this.props.clear();
    },
    groups: function()
    {
        this.props.groups();
    },
    render: function()
    {
        if(this.props.state == 3)
        {
            return (<div></div>);
        }
        else {
            var clearStyle = {marginTop: '25px', marginRight: '5px'};
            var groupsStyle = {marginTop: '25px'};
            return(
                <div>
                    <a onClick={this.clear} style={clearStyle} className="btn btn-md btn-danger">Purge All Members</a>
                    <a onClick={this.groups} style={groupsStyle} className="btn btn-md btn-info">Groups</a>
                </div>
            );
        }
    }
});

var ToggleBox = React.createClass({
    list: function()
    {
        this.props.toggle(0);
    },
    add: function()
    {
        this.props.toggle(1);
    },
    remove: function()
    {
        this.props.toggle(2);
    },
    render: function()
    {
        if(this.props.state == 3)
        {
            return (<div></div>);
        }
        else {


            var list = false;
            var add = false;
            var remove = false;
            if(this.props.state == 0)
            {
                list = true;
            }
            else if(this.props.state == 1)
            {
                add = true;
            }
            else if(this.props.state == 2)
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
                <div style={toggleStyle}>
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
            );
        }

    }
});

var ControlBox = React.createClass({
    completeState: function()
    {
        this.props.complete();
    },
    click: function(text)
    {
        if(this.props.state == 1)
        {

            this.props.add(text);
        }
        else if(this.props.state == 2)
        {

            this.props.remove(text);
        }
    },
    singleRemove: function(email)
    {
        this.props.singleRemove(email);
    },
    render: function()
    {
        if(this.props.state == 0)
        {
            return(
            <ListBox members={this.props.members} singleRemove={this.singleRemove}/>
            );
            }
            if(this.props.state == 1)
            {
                return(
                    <AddBox click={this.click} errorData={this.props.errorData} />
                );
            }
            if(this.props.state == 2)
            {
                return(
                    <RemoveBox click={this.click} errorData={this.props.errorData} />
                );
            }
            if(this.props.state == 3 || this.props.state == 4)
            {
                return(
                    <ActionBox complete={this.completeState} inputData={this.props.inputData}
                        outputData={this.props.outputData} state={this.props.state}/>
                )
            }
        }
    });

var ListBox = React.createClass({
    remove: function(email)
    {
        this.props.singleRemove(email);
    },
    render: function()
    {
        var controlStyle = {marginTop: '25px'};
        var members = this.props.members;
        if(members.length == 0)
        {
            return (<p>There are no members at present, to add some members click on the Add Members tab.</p>);
        }
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
                        <OptionBox listRemove={this.remove} email={node.email} />
                    </td>
                </tr>);
            });
            return(
                <div >
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
    click: function()
    {
        var addText = this.refs.addText.value;
        this.props.click(addText);
    },
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
    click: function()
    {
        var removeText = this.refs.removeText.value;
        this.props.click(removeText);
    },
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
            <div style={controlStyle}>
                <div className="row">
                    <div className={removeInputClasses}>
                        <textarea className="form-control" rows="5" cols="40" ref="removeText"></textarea>
                    </div>
                </div>
                <a onClick={this.click} style={buttonStyle} className="btn btn-lg btn-success">Remove</a>
            </div>
        );
    }
});

var ActionBox = React.createClass({
    completeState: function()
    {
        this.props.complete();
    },
    render: function()
    {
        var controlStyle = {marginTop: '25px'};
        if(this.props.inputData == undefined)
        {
            return (<div></div>);
        }
        if(this.props.state == 3 && this.props.inputData.length == this.props.outputData.length)
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
    remove: function()
    {
        this.props.remove(this.props.email);
    },
    render: function()
    {
        return(
            <button onClick={this.listRemove} type="button" className="close">
                <span aria-hidden="true">
                    <i onClick={this.listRemove} className="fa fa-trash"></i>
                </span>
            </button>
        );
    }
});

var ProgressBarBox = React.createClass({
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
