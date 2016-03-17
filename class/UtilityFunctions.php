<?php

namespace AppSync;

use \Database;

/**
 * A class for all the static utility functions.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */


class UtilityFunctions {


    public static function getOrgSyncURL()
    {
        if($_SESSION['state'] != null)
        {
            $state = $_SESSION['state'];
        }
        else
        {
            $state             = 'LIVE';
            $_SESSION['state'] = 'LIVE';
        }

        if($state == 'LIVE')
        {
            return \AppSync\SettingFactory::getSetting('orgsync_live_url')->getValue();
        }
        else
        {
            return \AppSync\SettingFactory::getSetting('orgsync_test_url')->getValue();
        }
    }

    public static function getOrgSyncKey()
    {
        return \AppSync\SettingFactory::getSetting('orgsync_key')->getValue();
    }

    /**
     * Retrieves student objects from banner
     * @return student
     */
    public static function getStudentByBanner($banner)
    {
        $base_url = \AppSync\SettingFactory::getSetting('banner_url')->getValue();

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        curl_setopt($curl, CURLOPT_URL, $base_url.'Student');
        $studentList = json_decode(curl_exec($curl));

        foreach ($studentList as $student) {
            if($student->{'ID'} == $banner)
            {
                return $student;
            }
        }
    }

    /**
     * Retrieves the Id for a user from orgsync
     * @return id
     */
    public static function getIDFromUsername($username){
        $key = self->getOrgSyncKey();
        $base_url = self::getOrgSyncURL();
        $curl = curl_init();
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $base_url.'accounts/username/$username?key=$key'));
        $result = curl_exec($curl);
        curl_close($curl);
        if($result){
            $result = json_decode($result);
            if(!empty($result->id))
            {
                return $result->id;
            }
        }
        $logEntry = new \AppSync\LogEntry(null,
                                 'Attempted to retrieve Id from Orgsync API via getIDFromUsername function, response was ' . $result->message,
                                 \Current_User::getUsername(),
                                 time());
        \AppSync\LogEntryFactory::save($logEntry);
        return false;
    }

    /**
     * Retrieves the students bannerId by using their email/username to find them
     * in the sdr_member database.
     * @return bannerId
     */
    public static function getBannerIDFromEmail($email){
        $parts = explode('@', $email);
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

}
