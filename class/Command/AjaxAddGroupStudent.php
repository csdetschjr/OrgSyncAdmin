<?php

namespace AppSync\Command;
/**
 * Controller class for handling a request to add a student to a particular
 * group in OrgSync.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */
class AjaxAddGroupStudent extends \AppSync\Command {

    public function getRequestVars(){
        return array('action'=>'AjaxAddGroupStudent');
    }

    /**
     * The main function for executing the command.
     */
    public function execute()
    {
        // Retrieve the values from the request
        $input    = $_REQUEST['inputData'];
        $portal   = $_REQUEST['portalId'];
        $groupId  = $_REQUEST['groupId'];

        // Retrieve other important values and objects
        $username    = \Current_User::getUsername();
        $portalObjs  = \AppSync\PortalFactory::getPortalById($portal);
        $umbrellaId  = $portalObjs[0]->getUmbrellaId();
        $permissions = \AppSync\UmbrellaAdminFactory::getUmbrellaAdmin($username, $umbrellaId);

        // If the permissions array is empty then the user does not have permission to use this command
        // throw an error back to the front end.
        if(sizeof($permissions) == 0)
        {
            echo json_encode(array('status' => 0, 'message' => 'You do not have permission to add students to this group.'));
            exit;
        }

        // If the input is not a number then it must be a username, retrieve the banner
        if(!is_numeric($input))
        {
            //Banner
            $banner = \AppSync\UtilityFunctions::getBannerIDFromEmail($input);

            // If false is returned then the username was not valid.
            if($banner === false)
            {
                echo json_encode(array('status' => 0, 'message' => 'Email/Username was invalid'));
                exit;
            }
        }
        else
        {
            $banner = $input;
        }

        // Retrieve the student and make sure it is not null, passing an error
        // back to the front end if it is
        $student = \AppSync\UtilityFunctions::getStudentByBanner($banner);

        if($student == null || isset($student->Message) || $student->emailAddress == null)
        {
            $returnData = array('status' => 0);
            echo json_encode($returnData);
            exit;
        }

        $id     = \AppSync\UtilityFunctions::getIDFromUsername($student->{'emailAddress'});
        $added  = false;

        // Check to see if the id returned as false indicating that the student does not exist
        // in orgsync yet, then add the student to orgsync
        if(!$id)
        {
            \AppSync\UtilityFunctions::addAccount($student->{'emailAddress'}, $student->{'firstName'}, $student->{'lastName'}, $student->{'ID'});
            $id     = \AppSync\UtilityFunctions::getIDFromUsername($student->{'emailAddress'});
            $added  = true;
        }

        // Pass the student info and group id to the function responsible for interacting
        // with the OrgSync API
        $status = $this->userToGroup($id, $groupId);

        // Create the response to the front end
        $name = $student->{'firstName'} . ' ' . $student->{'lastName'};
        if($status)
        {
            $returnData = array('status' => 1, 'name' => $name, 'added' => $added);
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
    public function userToGroup($id, $group_id){
        // Use the UtilityFunctions to retrieve the info to be passed to the API
        $key      = \AppSync\UtilityFunctions::getOrgSyncKey();
        $base_url = \AppSync\UtilityFunctions::getOrgSyncURL();

        // Create the url
        $import_url = $base_url."groups/$group_id/accounts/add";

        // Initialize curl
        $curl = curl_init();
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $import_url, CURLOPT_POST => 1, CURLOPT_POSTFIELDS => "ids=$id&key=$key"));

        // Execute the curl request and store the result
        $result = curl_exec($curl);

        // Close curl
        curl_close($curl);

        // Check to make sure the result was valid
        if($result)
        {
            $result = json_decode($result);
            if(is_object($result) && isset($result->success) && $result->success == true)
            {
                return TRUE;
            }
            else
            {
                // Log that an attempt to interact with the API failed
                $logEntry = new \AppSync\LogEntry(null,
                                     'Attempted to add user to group in Orgsync API via userToGroup function, response was ' . $result->message,
                                     \Current_User::getUsername(),
                                     time());
                \AppSync\LogEntryFactory::save($logEntry);
                return FALSE;
            }
        }
        else
        {
            // Log that an attempt to interact with the API failed
            $logEntry = new \AppSync\LogEntry(null,
                                 'Attempted to add user to group in Orgsync API via userToGroup function, response was ' . $result->message,
                                 \Current_User::getUsername(),
                                 time());
            \AppSync\LogEntryFactory::save($logEntry);
            return FALSE;
        }
    }

}
