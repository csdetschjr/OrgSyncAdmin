<?php

namespace AppSync\Command;

/**
* Controller class for adding permissions to the site for particular users.
*
* @author Chris Detsch
* @package appsync
*/
class AjaxAddPermission {

    public function __construct()
    {

    }

    public function execute()
    {
        if(!(\Current_User::isDeity()))
        {
            echo json_encode("user does not have permission to change permissions");
            exit;
        }

        $username = $_REQUEST['username'];
        $umbrellaId = $_REQUEST['umbrella'];

        $permissions = \AppSync\UmbrellaAdminFactory::getUmbrellaAdmin($username, $umbrellaId);

        if(sizeof($permissions) == 0)
        {
            $newAdmin = new \AppSync\UmbrellaAdmin(null, $username, $umbrellaId);

            \AppSync\UmbrellaAdminFactory::save($newAdmin);

            echo json_encode("success");
            exit;
        }
        else
        {
            echo json_encode("already exists");
            exit;
        }
    }
}
