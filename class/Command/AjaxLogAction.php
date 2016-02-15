<?php

namespace AppSync\Command;
/**
 * Controller class for handling a request to add a log entry to the database.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */
class AjaxLogAction extends \AppSync\Command {

    public function getRequestVars(){
        return array('action'=>'AjaxLogAction');
    }

    public function execute()
    {
        $id = $_REQUEST['logId'];
        $action = $_REQUEST['logAction'];
        $category = $_REQUEST['logCategory'];
        $toFrom = 'to';

        $username = \Current_User::getUsername();

        if($action == 'Removing')
        {
            $toFrom = 'from';
        }

        $logEntry = new \AppSync\LogEntry(null,
                             $action . ' students ' . $toFrom . ' ' . $category . ' with ' . $category . ' id ' . $id,
                             $username,
                             time());
        \AppSync\LogEntryFactory::save($logEntry);

        echo json_encode("logged");
        exit;
    }
}
