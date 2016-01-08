<?php

namespace AppSync\Command;

class AjaxRemoveGroupStudent extends \AppSync\Command {

    public function getRequestVars(){
        return array('action'=>'AjaxRemoveStudent');
    }

    public function execute()
    {
        $input = $_REQUEST['inputData'];
        $portal = $_REQUEST['portalId'];
        $groupId = $_REQUEST['groupId'];

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


    function getBannerIDFromEmail($email){
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
    * Place a user or users into a group. User can be a single user id or and array of ids
    *
    * @param int $user_id (can be array of user id's), int $group_id (groups id)
    * @return boolean (success or not)
    */
    function removeGroupAccount($user_id, $group_id){
        $key = \AppSync\SettingFactory::getSetting('orgsync_key')->getValue();
        $base_url = \AppSync\SettingFactory::getSetting('orgsync_url')->getValue();
        $id = $this->getIDFromUsername($user_id);
        $import_url = '';
        $import_url = $base_url."groups/$group_id/accounts/remove";
        $curl = curl_init();
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $import_url, CURLOPT_POST => 1, CURLOPT_POSTFIELDS => "ids=$id&key=$key"));
        $result = curl_exec($curl);
        curl_close($curl);
        if($result){
            $result = json_decode($result);
            if(is_object($result) && $result->success == "true")
            return TRUE;
            else
            return FALSE;
        }else{
            return FALSE;
        }
    }


    function getIDFromUsername($username){
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
        return false;
    }


    function getStudentByBanner($banner)
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
