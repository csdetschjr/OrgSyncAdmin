<?php

namespace AppSync\Command;

/**
* Controller class for removing a permission from the given user.
*
* @author Chris Detsch
* @package appsync
*/
class AjaxRemovePermission {

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

        \AppSync\UmbrellaAdminFactory::removeUmbrellaAdmin($username, $umbrellaId);

        echo json_encode("success");
        exit;
    }
}
