<?php

namespace AppSync\Command;

/**
 * Controller class for handling a request to retrieve all the log entries.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class AjaxGetLog extends \AppSync\Command {

    public function getRequestVars(){
        return array('action'=>'AjaxGetLogPager');
    }

    public function execute()
    {
        $logs = \AppSync\LogEntryFactory::getOrderedLogEntries();

        $response = array();

        foreach ($logs as $logEntry)
        {
            $row = array("occurredOn" => date('m/d/Y h:m:s a', $logEntry->getOccurredOn()),
                         "username" => $logEntry->getUsername(),
                         "desc" => $logEntry->getDescription());
            $response[] = $row;
        }

        echo json_encode($response);
        exit;
    }
}
