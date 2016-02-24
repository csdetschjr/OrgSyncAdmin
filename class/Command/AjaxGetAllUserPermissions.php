<?php

namespace AppSync\Command;

/**
* Controller class for getting all permissions to be listed in the permissions
* list for deities.
*
* @author Chris Detsch
* @package appsync
*/
class AjaxGetAllUserPermissions {

    public function __construct()
    {

    }

    public function execute()
    {
        if(!(\Current_User::isDeity()))
        {
            echo json_encode("user does not have permission to retrieve permissions");
            exit;
        }

        $permissions = \AppSync\UmbrellaAdminFactory::getAllUmbrellaAdmins();


        $userList = array();
        $returnData = array();

        foreach($permissions as $permission)
        {
            $username = $permission->getUsername();

            if(!in_array($username, $userList, true))
            {
                array_push($userList, $username);
            }
        }

        foreach ($userList as $username)
        {
            $permissionList = "";
            $first = true;
            foreach ($permissions as $permission)
            {
                if($permission->getUsername() == $username)
                {
                    $umbrella = \AppSync\UmbrellaFactory::getUmbrellaByOrgId($permission->getUmbrellaId());
                    if($first)
                    {
                        $permissionList = $umbrella->getName();
                        $first = false;
                    }
                    else {
                        $permissionList .= ", " . $umbrella->getName();
                    }
                }
            }
            $node = array("username" => $username, "permissions" => $permissionList);
            array_push($returnData, $node);
        }

        echo json_encode($returnData);
        exit;
    }
}
