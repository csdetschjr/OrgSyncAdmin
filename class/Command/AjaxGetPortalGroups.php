<?php

namespace AppSync\Command;


/**
* Controller class for getting portal search suggestion data in JSON format.
*
* @author Chris Detsch
* @package appsync
*/
class AjaxGetPortalGroups {

    public function __construct()
    {

    }

    public function execute()
    {

        $portal = $_REQUEST['portalId'];
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
            $portalGroups = $this->getOrgGroups($_REQUEST['portalId']);

            echo json_encode($portalGroups);

        }catch(\Exception $e)
        {
            echo '<div style="display: none;">'.$e->getMessage().'</div>';
        }
        exit;
    }


    /**
     * Retrieve the groups for a given portal.
     * @return array of groups
     */
    public function getOrgGroups($org_id){
        // This will need to be moved to the settings.
        $key = \AppSync\UtilityFunctions::getOrgSyncKey();
        $base_url = \AppSync\UtilityFunctions::getOrgSyncURL();
        $curl = curl_init();
        //get organization members by organization id
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $base_url."orgs/$org_id/groups?key=$key"));
        $org_groups = curl_exec($curl);
        if($org_groups){
            $org_groups = json_decode($org_groups);
        }else{
            $org_groups = FALSE;
        }
        curl_close($curl);
        return $org_groups;
    }
}
