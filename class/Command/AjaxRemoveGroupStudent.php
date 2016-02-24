<?php

namespace AppSync\Command;

/**
 * Controller class for handling a request to remove a student from a particular
 * group in OrgSync.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class AjaxRemoveGroupStudent extends \AppSync\Command {

    public function getRequestVars(){
        return array('action'=>'AjaxRemoveGroupStudent');
    }

    public function execute()
    {
        $input = $_REQUEST['inputData'];
        $portal = $_REQUEST['portalId'];
        $groupId = $_REQUEST['groupId'];
        $username = \Current_User::getUsername();

        $portalObjs = \AppSync\PortalFactory::getPortalById($portal);
        $umbrellaId = $portalObjs[0]->getUmbrellaId();

        $permissions = \AppSync\UmbrellaAdminFactory::getUmbrellaAdmin($username, $umbrellaId);

        if(sizeof($permissions) == 0)
        {
            echo json_encode(array('status' => 0, 'message' => 'You do not have permission to add students to this group.'));
            exit;
        }

        if(!is_numeric($input))
        {
            //Banner
            $banner = \AppSync\UtilityFunctions::getBannerIDFromEmail($input);
            if($banner === false)
            {
                echo json_encode(array('status' => 0));
                exit;
            }
        }
        else {
            $banner = $input;
        }

        $student = \AppSync\UtilityFunctions::getStudentByBanner($banner);

        if($student === false)
        {
            $returnData = array('status' => 0);
            echo json_encode($returnData);
            exit;
        }

        $status = $this->removeGroupAccount($student->{'emailAddress'}, $groupId);

        $name = $student->{'firstName'} . ' ' . $student->{'lastName'};
        if($status)
        {
            $returnData = array('status' => 1, 'name' => $name);
        }
        else
        {
            $returnData = array('status' => 2, 'name' => $name);
        }

        echo json_encode($returnData);
        exit;
    }

    /**
    * Place a user or users into a group. User can be a single user id or and array of ids
    *
    * @param int $user_id (can be array of user id's), int $group_id (groups id)
    * @return boolean (success or not)
    */
    public function removeGroupAccount($user_id, $group_id){
        $key = \AppSync\UtilityFunctions::getOrgSyncKey();
        $base_url = \AppSync\UtilityFunctions::getOrgSyncURL();
        $id = \AppSync\UtilityFunctions::getIDFromUsername($user_id);
        $import_url = $base_url."groups/$group_id/accounts/remove";
        $curl = curl_init();
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $import_url, CURLOPT_POST => 1, CURLOPT_POSTFIELDS => "ids=$id&key=$key"));
        $result = curl_exec($curl);
        curl_close($curl);
        if($result){
            $result = json_decode($result);
            if(is_object($result) && $result->success == "true")
            {
                return TRUE;
            }
            else
            {
                $logEntry = new \AppSync\LogEntry(null,
                                     'Attempted to from user from group in Orgsync API via removeGroupAccount function, response was ' . $result->message,
                                     \Current_User::getUsername(),
                                     time());
                \AppSync\LogEntryFactory::save($logEntry);
                return FALSE;
            }
        }
        else
        {
            $logEntry = new \AppSync\LogEntry(null,
                                 'Attempted to from user from group in Orgsync API via removeGroupAccount function, response was ' . $result->message,
                                 \Current_User::getUsername(),
                                 time());
            \AppSync\LogEntryFactory::save($logEntry);
            return FALSE;
        }
    }

}
