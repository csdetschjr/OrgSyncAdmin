<?php

namespace AppSync\Command;


/**
* Controller class for getting students currently in a portal.
*
* @author Chris Detsch
* @package appsync
*/
class AjaxGetPortalMembers {

    public function __construct()
    {

    }

    public function execute()
    {
        $portal = $_REQUEST['org_id'];
        $username = \Current_User::getUsername();

        $portalObjs = \AppSync\PortalFactory::getPortalById($portal);
        $umbrellaId = $portalObjs[0]->getUmbrellaId();

        $permissions = \AppSync\UmbrellaAdminFactory::getUmbrellaAdmin($username, $umbrellaId);

        if(sizeof($permissions) == 0)
        {
            echo '<div style="display: none;">User does not have permission to access this data.</div>';
            exit;
        }

        try
        {
            $portalMembers = $this->getOrgMembers($_REQUEST['org_id']);

            echo json_encode($portalMembers);

        }catch(\Exception $e)
        {
            echo '<div style="display: none;">'.$e->getMessage().'</div>';
        }
        exit;
    }


    /**
     *  Retrieve the current members of a portal from orgsync.
     *  @return array
     */
    public function getOrgMembers($org_id){
        // This will need to be moved to the settings.
        $key = \AppSync\UtilityFunctions::getOrgSyncKey();
        $base_url = \AppSync\UtilityFunctions::getOrgSyncURL();
        $curl = curl_init();
        //get organization members by organization id
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $base_url."orgs/$org_id/accounts?key=$key"));
        $org_members = curl_exec($curl);
        if($org_members){
            $org_members = json_decode($org_members);
        }else{
            $org_members = FALSE;
        }
        curl_close($curl);
        return $org_members;
    }
}
