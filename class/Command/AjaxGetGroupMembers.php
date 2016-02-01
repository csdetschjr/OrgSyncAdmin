<?php

namespace AppSync\Command;


/**
* Controller class for getting the members currently in a group.
*
* @author Chris Detsch
* @package intern
*/
class AjaxGetGroupMembers {

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
            $groupMembers = $this->getGroupMembers($_REQUEST['groupId']);

            echo json_encode($groupMembers);

        }catch(Exception $e)
        {
            echo '<div style="display: none;">'.$e->getMessage().'</div>';
        }
        exit;
    }



    function getGroupMembers($group_id)
    {
        $key = \AppSync\SettingFactory::getSetting('orgsync_key')->getValue();
        $base_url = \AppSync\SettingFactory::getSetting('orgsync_url')->getValue();
        $curl = curl_init();
        //get organization members by organization id
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $base_url."groups/$group_id/accounts?key=$key"));
        $group_members = curl_exec($curl);
        if($group_members){
            $group_members = json_decode($group_members);
        }else{
            $group_members = FALSE;
        }
        curl_close($curl);
        return $group_members;
    }
}
