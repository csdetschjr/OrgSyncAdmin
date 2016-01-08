<?php

namespace AppSync\Command;


/**
* Controller class for getting portal search suggestion data in JSON format.
*
* @author Chris Detsch
* @package intern
*/
class AjaxGetPortalGroups {

    public function __construct()
    {

    }

    public function execute()
    {
        try
        {
            $portalGroups = $this->getOrgGroups($_REQUEST['portalId']);

            echo json_encode($portalGroups);

        }catch(Exception $e)
        {
            echo '<div style="display: none;">'.$e->getMessage().'</div>';
        }
        exit;
    }



    function getOrgGroups($org_id){
        // This will need to be moved to the settings.
        $key = \AppSync\SettingFactory::getSetting('orgsync_key')->getValue();
        $base_url = \AppSync\SettingFactory::getSetting('orgsync_url')->getValue();
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