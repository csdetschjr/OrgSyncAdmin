<?php

namespace AppSync\Command;

/**
* Controller class for getting umbrella permissions based on a username.
*
* @author Chris Detsch
* @package appsync
*/
class AjaxGetUmbrellaPermissions {

    public function __construct()
    {

    }

    public function execute()
    {
        $username = $_REQUEST['username'];

        $permissions = \AppSync\UmbrellaAdminFactory::getUmbrellaAdminByUsername($username);

        $returnData = array();
        $i = 0;

        foreach($permissions as $permission)
        {
            $umbrella = \AppSync\UmbrellaFactory::getUmbrellaByOrgId($permission->getUmbrellaId());
            $returnData[$i]['umbrella_id'] = $umbrella->getOrgSyncId();
            $returnData[$i]['umbrella_name'] = $umbrella->getName();
            $i++;
        }

        echo json_encode($returnData);
        exit;
    }
}
