<?php

namespace AppSync\Command;

/**
 * Controller class for handling a request to retrieve all the possible umbrellas
 * This is used when adding permissions.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class AjaxGetAllUmbrellas extends \AppSync\Command {

    public function getRequestVars(){
        return array('action'=>'AjaxGetAllUmbrellas');
    }

    public function execute()
    {
        if(!(\Current_User::isDeity()))
        {
            echo json_encode("user does not have permission to change permissions");
            exit;
        }

        $umbrellasResult = \AppSync\UmbrellaFactory::getUmbrellas();
        $umbrellas = array();
        $i = 0;
        foreach($umbrellasResult as $umbrella)
        {
            $umbrellas[$i]['umbrella_id'] = $umbrella->getOrgSyncId();
            $umbrellas[$i]['umbrella_name'] = $umbrella->getName();
            $i++;
        }

        echo json_encode($umbrellas);
        exit;
    }
}
