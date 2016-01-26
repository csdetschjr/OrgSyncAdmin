<?php

namespace AppSync\Command;

/**
* Controller class for getting portal search suggestion data in JSON format.
*
* @author Chris Detsch
* @package intern
*/
class AjaxGetUserPermissions {

    public function __construct()
    {

    }

    public function execute()
    {
        $username = \Current_User::getUsername();

        $permissions = \AppSync\PermissionFactory::getPermissionsByUsername($username);

        var_dump($permissions);exit;

        echo json_encode($returnData);
        exit;
    }
}
