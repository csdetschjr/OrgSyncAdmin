<?php

namespace AppSync\Command;

/**
 * Controller class for handling a request to remove a student from a particular
 * portal in OrgSync.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class AjaxRemovePortalStudent extends \AppSync\Command {

    public function getRequestVars(){
        return array('action'=>'AjaxRemovePortalStudent');
    }

    public function execute()
    {
        $input = $_REQUEST['inputData'];
        $portal = $_REQUEST['portalId'];
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
            $banner = $this->getBannerIDFromEmail($input);
            if($banner === false)
            {
                echo json_encode(array('status' => 0));
                exit;
            }
        }
        else {
            $banner = $input;
        }

        $student = $this->getStudentByBanner($banner);

        if($student === false)
        {
            $returnData = array('status' => 0);
            echo json_encode($returnData);
            exit;
        }

        $status = $this->removeAccount($student->{'emailAddress'}, $portal);

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
     * Retrieves the students bannerId by using their email/username to find them
     * in the sdr_member database.
     * @return bannerId
     */
    public function getBannerIDFromEmail($email){
        $parts = explode("@", $email);
        $username = strtolower($parts[0]);
        if(!empty($username)){
            $query = "SELECT * FROM sdr_member WHERE username='$username' ORDER BY id DESC";
            $result = pg_query($query);
            if($result && pg_num_rows($result) > 0){
                $row = pg_fetch_assoc($result);
                return $row['id'];
            }
            else{
                return false;
            }
        }
        else{
            return false;
        }
    }


    /**
    * Remove an account or multiple accounts from an organization. $ids can be one id or and array of ids.
    *
    *
    */
    public function removeAccount($user_id, $org_id){
        $key = \AppSync\SettingFactory::getSetting('orgsync_key')->getValue();
        $base_url = \AppSync\SettingFactory::getSetting('orgsync_url')->getValue();
        $id = $this->getIDFromUsername($user_id);

        $url = $base_url."/orgs/$org_id/accounts/remove";
        $curl = curl_init();
        curl_setopt_array($curl, array(CURLOPT_TIMEOUT => 900, CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $url, CURLOPT_POST => 1, CURLOPT_POSTFIELDS => "ids=$id&key=$key"));
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
                                     'Attempted to remove user from portal in Orgsync API via removeAccount function, response was ' . $result->message,
                                     \Current_User::getUsername(),
                                     time());
                \AppSync\LogEntryFactory::save($logEntry);
                return FALSE;
            }
        }
        $logEntry = new \AppSync\LogEntry(null,
                             'Attempted to from user from portal in Orgsync API via removeAccount function, response was ' . $result->message,
                             \Current_User::getUsername(),
                             time());
        \AppSync\LogEntryFactory::save($logEntry);
    }

    /**
     * Retrieves the Id for a user from orgsync
     * @return id
     */
    public function getIDFromUsername($username){
        $key = \AppSync\SettingFactory::getSetting('orgsync_key')->getValue();
        $base_url = \AppSync\SettingFactory::getSetting('orgsync_url')->getValue();
        $curl = curl_init();
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $base_url."accounts/username/$username?key=$key"));
        $result = curl_exec($curl);
        curl_close($curl);
        if($result){
            $result = json_decode($result);
            if(!empty($result->id))
            return $result->id;
        }
        $logEntry = new \AppSync\LogEntry(null,
                                 'Attempted to retrieve Id for portal remove from Orgsync API via getIDFromUsername function, response was ' . $result->message,
                                 \Current_User::getUsername(),
                                 time());
        \AppSync\LogEntryFactory::save($logEntry);
        return false;
    }

    /**
     * Retrieves student objects from banner
     * @return student
     */
    public function getStudentByBanner($banner)
    {
        $base_url = \AppSync\SettingFactory::getSetting('banner_url')->getValue();

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        curl_setopt($curl, CURLOPT_URL, $base_url."Student");
        $studentList = json_decode(curl_exec($curl));

        foreach ($studentList as $student) {
            if($student->{'ID'} == $banner)
            {
                return $student;
            }
        }

        return false;
    }

}
