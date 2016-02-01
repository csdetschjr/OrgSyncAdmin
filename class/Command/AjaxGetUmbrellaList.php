<?php

namespace AppSync\Command;

/**
 * Controller class for handling a request to get a list of umbrellas for the user
 * to choose from.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class AjaxGetUmbrellaList extends \AppSync\Command {

      public function getRequestVars(){
          return array('action'=>'AjaxGetUmbrellaList');
      }

      public function execute()
      {
        $username = \Current_User::getUsername();

        $permissions = \AppSync\UmbrellaAdminFactory::getUmbrellaAdminByUsername($username);

        $umbrellas = array();
        $i = 0;

        foreach($permissions as $permission)
        {
            $umbrella = \AppSync\UmbrellaFactory::getUmbrellaByOrgId($permission->getUmbrellaId());
            $umbrellas[$i]['umbrella_id'] = $umbrella->getOrgSyncId();
            $umbrellas[$i]['umbrella_name'] = $umbrella->getName();
            $i++;
        }

        echo json_encode($umbrellas);
        exit;
      }
}
