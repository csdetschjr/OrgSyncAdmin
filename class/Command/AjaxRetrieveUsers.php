<?php

namespace AppSync\Command;

/**
* Controller class for getting all permissions to be listed in the permissions
* list for deities.
*
* @author Chris Detsch
* @package appsync
*/
class AjaxRetrieveUsers {

    public function __construct()
    {

    }

    public function execute()
    {
        if(!(\Current_User::isDeity()))
        {
            echo json_encode('user does not have permission to retrieve other user information');
            exit;
        }

        $permissions = \AppSync\UmbrellaAdminFactory::getAllUmbrellaAdmins();


        $userList   = array();
        $returnData = array();

        foreach($permissions as $permission)
        {
            $username = $permission->getUsername();

            if(!in_array($username, $userList, true))
            {
                array_push($userList, $username);
            }
        }

        foreach($userList as $user)
        {
            $node         = array('username' => $user);
            $returnData[] = $node;
        }


        echo json_encode($returnData);
        exit;
    }
}
