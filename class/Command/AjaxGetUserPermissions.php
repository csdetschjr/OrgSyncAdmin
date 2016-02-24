<?php

namespace AppSync\Command;

/**
* Controller class for retrieving the permissions for the current user.
*
* @author Chris Detsch
* @package appsync
*/
class AjaxGetUserPermissions {

    public function __construct()
    {

    }

    public function execute()
    {
        $returnData = array('username' => \Current_User::getUsername(),
                            'deity' => \Current_User::isDeity(),
                            'view' => \Current_User::allow('appsync', 'view'),
                            'purge' => \Current_User::allow('appsync', 'purge'));


        echo json_encode($returnData);
        exit;
    }
}
