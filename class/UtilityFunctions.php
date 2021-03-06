<?php

namespace AppSync;

use \Database;

/**
 * A class for all the static utility functions that are used in multiple classes.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */


class UtilityFunctions {

    /**
     * Retrieves the OrgSync URL from the database, if the state is not set it
     * will set it to LIVE and use that as the state, otherwise it will use the
     * current state.
     * @return string - the url
     */
    public static function getOrgSyncURL()
    {
        if(isset($_SESSION['state']))
        {
            $state = $_SESSION['state'];
        }
        else
        {
            $state             = 'LIVE';
            $_SESSION['state'] = 'LIVE';
        }

        // If the state is not set to live then it will be set to test.
        if($state == 'LIVE')
        {
            return \AppSync\SettingFactory::getSetting('orgsync_live_url')->getValue();
        }
        else
        {
            return \AppSync\SettingFactory::getSetting('orgsync_test_url')->getValue();
        }
    }

    /**
     * Retrieves the OrgSync Key from the database.
     * @return string - the key
     */
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
        // Retrieve the url for Banner from the database
        $base_url = \AppSync\SettingFactory::getSetting('banner_url')->getValue();

        // Initialize curl
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $base_url.'Student');
        // Execute the curl request and store its result
        $studentList = json_decode(curl_exec($curl));

        // Loop through the student list and retrieve the student with the given banner id
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
        // Retrieve the orgsync url values using the static functions in this class
        $key = self::getOrgSyncKey();
        $base_url = self::getOrgSyncURL();
        // Initialize curl
        $curl = curl_init();
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $base_url."accounts/username/$username?key=$key"));
        // Execute the curl request and store its result
        $result = curl_exec($curl);
        // Close curl
        curl_close($curl);
        // Check to see if the result is valid
        if($result){
            $result = json_decode($result);
            if(!empty($result->id))
            {
                return $result->id;
            }
        }
        // Log that an attempt to interact with the API failed
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
        // Breaks the email apart at the @ symbol, this should give the username
        $parts = explode('@', $email);
        $username = strtolower($parts[0]);
        // If the username variable is not empty then retrieve the bannerId by the
        // username from the sdr member table
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
